# Scientific Evaluation Package — Virtual Museum XAI-RAG

This package adds a reproducible evaluation framework for the paper without fabricating experimental results.

## What it evaluates

1. Retrieval Top-1 accuracy on a labeled museum-query benchmark.
2. Relevance-threshold sweep (`0.30`–`0.70`) for OOD specificity/sensitivity.
3. Boundary behavior around the proposed `0.50` threshold.
4. Deictic routing correctness when a selected `artifact_id` is supplied.
5. Pre-generation LLM-call suppression on rejected queries.
6. Memory-window ablation (`W=0,1,2,3,5`) at the pipeline/prompt level.
7. Scalability using the existing catalog by evaluating subsets of 5/10/15 artifacts.
8. XAI provenance completeness checks.

## Important scientific constraint

The current repository contains the cached artifact embeddings but not the SentenceTransformer model weights. The execution environment used to prepare this package also has no network access, so new query embeddings cannot be generated here. Therefore **no new performance numbers are invented**. Run the evaluation on the project machine/environment where `sentence-transformers` and `all-MiniLM-L6-v2` are available.

## Run

From `backend/` with the normal project environment active:

```bash
python ../research/run_evaluation.py
```

Outputs are written to `research/results/` as CSV/JSON files.

## Recommended paper reporting

Use the generated results to report:
- mean/95% CI where repeated measurements exist,
- threshold selected on a validation split and evaluated once on a held-out test split,
- Top-1 retrieval accuracy,
- sensitivity, specificity, F1,
- false acceptance/rejection counts,
- LLM invocation rate and estimated token savings,
- deictic routing accuracy,
- provenance completeness,
- latency by pipeline stage.

Do not describe cosine similarity as a probability or calibrated confidence unless a calibration experiment has been performed.
