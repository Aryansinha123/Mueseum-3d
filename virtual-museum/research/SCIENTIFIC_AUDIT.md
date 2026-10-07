# Scientific Audit — Current Virtual Museum Paper vs. Repository

## Verified from the uploaded project

- 15 unique artifact records are present in `backend/artifacts.json`.
- All 15 records are marked `isVerifiedMuseumData=true`.
- The catalog is balanced across three galleries: 5 / 5 / 5.
- The cached artifact embedding matrix is `(15, 384)`.
- The configured retrieval/relevance threshold is `0.50`.
- The code explicitly documents that the similarity value is **not a calibrated probability**.
- The backend contains a pre-generation gate: rejected paths return with `llm_called=False` before `generate_grounded_answer` is invoked.
- Artifact-bound Type A routing is implemented when `artifact_id` is supplied.
- The backend maintains a bounded memory window of 3 exchanges.
- Accepted responses expose source and evidence fields.
- A 250-query benchmark has been generated: 120 named semantic in-scope queries, 90 deictic queries, and 40 OOD queries.

## Critical issues found in the current paper

The current DOCX contains quantitative claims that are not reproducible from the uploaded repository/environment available to this run. Examples include exact similarity values, 100% sensitivity/specificity claims, ablation percentages, latency measurements, token savings, and ungrounded-LLM hallucination rates. These should **not** remain in a submission version unless corresponding raw experiment outputs are available.

The paper also contains artifact labels that no longer match the current `backend/artifacts.json` (for example, the paper's ART002/ART005 descriptions differ from the uploaded project's current records). The paper must be synchronized with the current repository before submission.

## What has been prepared

- `research/benchmark.json`: 250 labeled queries.
- `research/generate_benchmark.py`: reproducible benchmark generator.
- `research/run_evaluation.py`: threshold sweep, retrieval accuracy, deictic routing, provenance, and latency evaluation.
- `research/static_audit.py`: repository/data/code audit.
- `research/README.md`: execution and reporting instructions.
- `research/results/static_audit.json`: actual static audit output from this environment.

## Publication rule

Until `run_evaluation.py` is executed in an environment with the project's SentenceTransformer runtime/model available, quantitative performance statements should be framed as **hypotheses, protocol, or implementation verification**, not empirical findings.
