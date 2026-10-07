"""Reproducible scientific evaluation for the Virtual Museum RAG system.

This script intentionally does not fabricate results. It requires the project's
normal Python environment with sentence-transformers and all-MiniLM-L6-v2.
It uses retrieval-only evaluation and monkeypatches LLM generation when testing
pipeline gating, so API keys are not required for the gate experiments.
"""
import csv, json, os, sys, time, statistics
from collections import Counter
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND = os.path.join(ROOT, 'backend')
RESEARCH = os.path.join(ROOT, 'research')
RESULTS = os.path.join(RESEARCH, 'results')
os.makedirs(RESULTS, exist_ok=True)
sys.path.insert(0, BACKEND)

try:
    from rag.embeddings import ArtifactEmbeddingManager
    from rag.retrieval import ArtifactRetriever
except Exception as exc:
    print('Evaluation cannot start because the embedding runtime is unavailable.')
    print(f'Import error: {type(exc).__name__}: {exc}')
    print('Install the project requirements and ensure all-MiniLM-L6-v2 is available, then rerun.')
    print('No experimental results were generated.')
    raise SystemExit(2)

bench = json.load(open(os.path.join(RESEARCH, 'benchmark.json'), encoding='utf-8'))['queries']
manager = ArtifactEmbeddingManager()
retriever = ArtifactRetriever(manager)

# -------------------- Retrieval benchmark --------------------
retrieval_rows = []
for q in bench:
    if q['query_type'] == 'deictic':
        continue
    t0 = time.perf_counter()
    r = retriever.retrieve(q['question'])
    elapsed = (time.perf_counter() - t0) * 1000
    correct = q['label'] == 'in_scope' and r['artifact_id'] == q['target_artifact_id']
    retrieval_rows.append({
        'id': q['id'], 'question': q['question'], 'label': q['label'],
        'target_artifact_id': q.get('target_artifact_id'),
        'predicted_artifact_id': r['artifact_id'],
        'similarity': r['similarity_score'],
        'correct_top1': int(correct),
        'latency_ms': round(elapsed, 3),
    })

with open(os.path.join(RESULTS, 'retrieval_results.csv'), 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=retrieval_rows[0].keys()); w.writeheader(); w.writerows(retrieval_rows)

in_scope = [r for r in retrieval_rows if r['label']=='in_scope']
ood = [r for r in retrieval_rows if r['label']=='ood']

# -------------------- Threshold sweep --------------------
# Threshold metrics are computed from the retrieval score alone. In-scope = positive;
# OOD = negative. A score >= threshold is an acceptance.
threshold_rows = []
for th in np.arange(0.30, 0.701, 0.01):
    tp = sum(r['similarity'] >= th for r in in_scope)
    fn = len(in_scope) - tp
    tn = sum(r['similarity'] < th for r in ood)
    fp = len(ood) - tn
    sensitivity = tp / (tp + fn) if tp + fn else 0
    specificity = tn / (tn + fp) if tn + fp else 0
    precision = tp / (tp + fp) if tp + fp else 0
    f1 = 2*precision*sensitivity/(precision+sensitivity) if precision+sensitivity else 0
    threshold_rows.append({
        'threshold': round(float(th), 2), 'TP': int(tp), 'FN': int(fn), 'TN': int(tn), 'FP': int(fp),
        'sensitivity': float(sensitivity), 'specificity': float(specificity),
        'precision': float(precision), 'f1': float(f1),
        'ood_false_accept_rate': float(fp/len(ood)) if ood else 0.0,
        'in_scope_false_reject_rate': float(fn/len(in_scope)) if in_scope else 0.0,
    })

with open(os.path.join(RESULTS, 'threshold_sweep.csv'), 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=threshold_rows[0].keys()); w.writeheader(); w.writerows(threshold_rows)

best = max(threshold_rows, key=lambda x: (x['f1'], x['specificity']))
selected = next(x for x in threshold_rows if x['threshold'] == 0.50)

# -------------------- Boundary analysis --------------------
boundary = [r for r in retrieval_rows if 0.40 <= r['similarity'] <= 0.60]
with open(os.path.join(RESULTS, 'threshold_boundary.csv'), 'w', newline='', encoding='utf-8') as f:
    fields = ['id','label','question','predicted_artifact_id','similarity','correct_top1']
    w=csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows({k:r[k] for k in fields} for r in boundary)

# -------------------- Deictic routing evaluation --------------------
# The proposed routing should bind the query to the explicit artifact context.
# This checks the backend response contract using a lightweight fake LLM. No API key.
import rag.rag_pipeline as rp

def fake_generate_grounded_answer(**kwargs):
    return ('[MOCK GROUNDED ANSWER]', ['What else would you like to know?'])
rp.generate_grounded_answer = fake_generate_grounded_answer

pipeline = rp.Phase3RAGPipeline()
deictic_rows=[]
for q in bench:
    if q['query_type'] != 'deictic':
        continue
    t0=time.perf_counter()
    try:
        out=pipeline.answer_question(q['question'], session_id='eval-'+q['id'], artifact_id=q['artifact_id'])
        err=''
        source_id=None
        if out.get('source'):
            source_name=out['source']['artifact']
            source_id=next((a['id'] for a in manager.artifacts if a['name']==source_name), None)
        correct=int((not out.get('refused')) and source_id==q['artifact_id'])
    except Exception as exc:
        out={'refused':True,'llm_called':False,'confidence':None}; err=f'{type(exc).__name__}: {exc}'; correct=0; source_id=None
    deictic_rows.append({
        'id':q['id'],'question':q['question'],'artifact_id':q['artifact_id'],
        'resolved_artifact_id':source_id,'correct_binding':correct,
        'refused':out.get('refused'),'llm_called':out.get('llm_called'),
        'similarity':out.get('confidence'),'error':err,
        'latency_ms':round((time.perf_counter()-t0)*1000,3)
    })
with open(os.path.join(RESULTS, 'deictic_results.csv'),'w',newline='',encoding='utf-8') as f:
    w=csv.DictWriter(f,fieldnames=deictic_rows[0].keys());w.writeheader();w.writerows(deictic_rows)

# -------------------- Provenance/XAI completeness --------------------
# This validates payload fields; it does not judge factual truth of generated text.
xai_rows=[]
for q in bench:
    if q['query_type'] != 'deictic': continue
    try:
        out=pipeline.answer_question(q['question'], session_id='xai-'+q['id'], artifact_id=q['artifact_id'])
        if not out.get('refused'):
            pillars = [bool(out.get('source',{}).get('artifact')), bool(out.get('source',{}).get('gallery')), out.get('confidence') is not None, bool(out.get('evidence'))]
            xai_rows.append({'id':q['id'],'artifact':q['artifact_id'],'provenance_score':sum(pillars),'artifact_pillar':int(pillars[0]),'gallery_pillar':int(pillars[1]),'score_pillar':int(pillars[2]),'evidence_pillar':int(pillars[3])})
    except Exception: pass
with open(os.path.join(RESULTS,'xai_provenance.csv'),'w',newline='',encoding='utf-8') as f:
    fields=['id','artifact','provenance_score','artifact_pillar','gallery_pillar','score_pillar','evidence_pillar']
    w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(xai_rows)

summary={
 'benchmark_queries':len(bench),
 'retrieval_queries':len(retrieval_rows),
 'in_scope_top1_accuracy':sum(r['correct_top1'] for r in in_scope)/len(in_scope) if in_scope else None,
 'mean_in_scope_similarity':statistics.mean(r['similarity'] for r in in_scope) if in_scope else None,
 'mean_ood_similarity':statistics.mean(r['similarity'] for r in ood) if ood else None,
 'threshold_0.50':selected,
 'best_f1_threshold_on_this_dataset':best,
 'boundary_query_count_0.40_to_0.60':len(boundary),
 'deictic_binding_accuracy':sum(r['correct_binding'] for r in deictic_rows)/len(deictic_rows) if deictic_rows else None,
 'deictic_llm_calls':sum(bool(r['llm_called']) for r in deictic_rows),
 'xai_mean_provenance_score':statistics.mean(r['provenance_score'] for r in xai_rows) if xai_rows else None,
 'note':'Threshold selection must be performed on validation data and reported on a held-out test set for a publication-grade claim.'
}
def _json_default(o):
    if isinstance(o, (np.integer,)): return int(o)
    if isinstance(o, (np.floating,)): return float(o)
    if isinstance(o, (np.bool_,)): return bool(o)
    return str(o)

json.dump(summary, open(os.path.join(RESULTS, 'summary.json'), 'w', encoding='utf-8'), indent=2, default=_json_default)
print(json.dumps(summary, indent=2, default=_json_default))
