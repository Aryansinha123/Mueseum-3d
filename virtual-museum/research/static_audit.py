import ast, json, os, re
from collections import Counter
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND = os.path.join(ROOT, 'backend')
ART = os.path.join(BACKEND, 'artifacts.json')
PIPE = os.path.join(BACKEND, 'rag', 'rag_pipeline.py')
CONF = os.path.join(BACKEND, 'rag', 'confidence.py')
CACHE = os.path.join(BACKEND, 'data', 'artifact_embeddings.npy')

A = json.load(open(ART, encoding='utf-8'))
cache = np.load(CACHE)

report = {
    'catalog': {
        'artifacts': len(A),
        'unique_ids': len({a.get('id') for a in A}),
        'verified_records': sum(bool(a.get('isVerifiedMuseumData')) for a in A),
        'physical_glb_records': sum(bool(a.get('hasPhysicalGlb')) for a in A),
        'galleries': dict(Counter(a.get('galleryName') for a in A)),
        'embedding_cache_shape': list(cache.shape),
    },
    'threshold': {},
    'pipeline_checks': {},
}

conf_text = open(CONF, encoding='utf-8').read()
m = re.search(r'RELEVANCE_THRESHOLD\s*=\s*([0-9.]+)', conf_text)
report['threshold']['configured_value'] = float(m.group(1)) if m else None
report['threshold']['uses_cosine_not_probability'] = 'not a calibrated statistical confidence probability' in conf_text

pipe_text = open(PIPE, encoding='utf-8').read()
report['pipeline_checks']['pre_generation_gate_phrase'] = 'LLM: NOT CALLED' in pipe_text
report['pipeline_checks']['contextual_artifact_routing'] = 'TYPE A' in pipe_text and 'artifact_id' in pipe_text
report['pipeline_checks']['bounded_memory'] = 'format_history_for_prompt' in pipe_text
report['pipeline_checks']['evidence_returned'] = '"evidence": evidence_text' in pipe_text
report['pipeline_checks']['source_returned'] = '"source": {' in pipe_text
report['pipeline_checks']['llm_called_after_gate'] = pipe_text.find('generate_grounded_answer(\n', pipe_text.find('def _generate_accepted_response')) > pipe_text.find('def _generate_accepted_response')

# Basic benchmark integrity.
bench = json.load(open(os.path.join(ROOT, 'research', 'benchmark.json'), encoding='utf-8'))
qs = bench['queries']
report['benchmark'] = {
    'queries': len(qs),
    'in_scope': sum(q['label']=='in_scope' for q in qs),
    'ood': sum(q['label']=='ood' for q in qs),
    'deictic': sum(q.get('query_type')=='deictic' for q in qs),
    'unique_query_ids': len({q['id'] for q in qs}),
}

outdir = os.path.join(ROOT, 'research', 'results')
os.makedirs(outdir, exist_ok=True)
out = os.path.join(outdir, 'static_audit.json')
json.dump(report, open(out, 'w', encoding='utf-8'), indent=2)
print(json.dumps(report, indent=2))
print(f'Wrote {out}')
