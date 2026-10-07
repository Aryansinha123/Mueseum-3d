import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'backend', 'artifacts.json')
OUT = os.path.join(os.path.dirname(__file__), 'benchmark.json')

artifacts = json.load(open(DATA, encoding='utf-8'))

TEMPLATES = [
    'Tell me about {name}.',
    'What is the historical significance of {name}?',
    'When was {name} created or used?',
    'What is {name} and what was it used for?',
    'What do we know about the origin of {name}?',
    'What makes {name} important?',
    'What period is {name} associated with?',
    'What is the main purpose or role of {name}?',
]

queries = []
for a in artifacts:
    for i, template in enumerate(TEMPLATES):
        queries.append({
            'id': f"INS_{a['id']}_{i+1}",
            'question': template.format(name=a['name']),
            'label': 'in_scope',
            'target_artifact_id': a['id'],
            'query_type': 'named_semantic',
        })

# Artifact-bound deictic benchmark: the expected target is determined by the supplied
# 3D exhibit context, not by semantic retrieval of the pronoun itself.
deictic = [
    'What is this?',
    'Tell me about this artifact.',
    'When was it created?',
    'Who created it?',
    'What was it used for?',
    'Why is this important?',
]
for a in artifacts:
    for i, q in enumerate(deictic):
        queries.append({
            'id': f"DEI_{a['id']}_{i+1}",
            'question': q,
            'label': 'in_scope',
            'target_artifact_id': a['id'],
            'artifact_id': a['id'],
            'query_type': 'deictic',
        })

# OOD benchmark intentionally spans unrelated domains and should be rejected by the
# confidence gate rather than answered by general world knowledge.
ood = [
    'What is the weather forecast in Tokyo today?',
    'What is 25 multiplied by 17?',
    'Write a Python program to sort a list.',
    'Who won the latest football match?',
    'What is the current price of Bitcoin?',
    'Give me a recipe for chocolate cake.',
    'What is the exchange rate from dollars to rupees?',
    'Recommend a movie for tonight.',
    'How do I book a hotel in Paris?',
    'What are the symptoms of influenza?',
    'Who is the current prime minister of India?',
    'Translate this sentence into French.',
    'How can I learn JavaScript?',
    'What is the stock market doing today?',
    'Tell me a joke.',
    'What is the population of Tokyo?',
    'How do I calculate compound interest?',
    'What is the best pizza restaurant nearby?',
    'Who won the cricket match yesterday?',
    'How do I make coffee?',
    'What is the capital of Australia?',
    'Explain quantum computing in general.',
    'Give me a C program for binary search.',
    'What is the temperature in London?',
    'What are today\'s major news headlines?',
    'How do I train for a marathon?',
    'Recommend a smartphone under 30000 rupees.',
    'What is the latest movie release?',
    'Solve 12345 divided by 37.',
    'How do I apply for a job?',
    'What is the best hotel in Mumbai?',
    'Tell me about a random celebrity.',
    'How do I cook pasta?',
    'What is the current exchange rate for euros?',
    'Write SQL to find duplicate rows.',
    'What is the latest cricket score?',
    'How do I remove a virus from Windows?',
    'What is the forecast for rain tomorrow?',
    'Recommend a song for studying.',
    'How do I learn machine learning?',
]
for i, q in enumerate(ood, 1):
    queries.append({
        'id': f'OOD_{i:03d}',
        'question': q,
        'label': 'ood',
        'target_artifact_id': None,
        'query_type': 'out_of_domain',
    })

json.dump({'version': '1.0', 'num_queries': len(queries), 'queries': queries}, open(OUT, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print(f'Wrote {len(queries)} queries to {OUT}')
