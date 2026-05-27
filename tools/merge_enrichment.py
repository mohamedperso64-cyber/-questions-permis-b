"""
Fusionne questions.json (texte brut des 100 questions) avec les 10 fichiers
enrichment_lot*.json (modes + distracteurs + mots-clés) en un seul
src/data/questions_enrichies.json consommable par l'app React.

Structure de sortie par question :
{
  "id": 1, "type": "VI",
  "verif":   { "question": "...", "reponse": "...", "mode": "geste_interieur" },
  "qser":    { "question": "...", "reponse": "...", "mode": "qcm",   "distracteurs": [...], "mots_cles_memo": [...] },
  "secours": { "question": "...", "reponse": "...", "mode": "libre", "mots_cles":     [...] }
}

Effectue également une batterie de vérifications d'intégrité.
"""
import sys, io, json, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = r'C:\Users\compt\Desktop\site_questions_permis'
SRC_PATH = os.path.join(ROOT, 'src', 'data', 'questions.json')
OUT_PATH = os.path.join(ROOT, 'src', 'data', 'questions_enrichies.json')
TOOLS_DIR = os.path.join(ROOT, 'tools')

VALID_MODES = {'geste_interieur', 'geste_exterieur', 'qcm', 'libre'}
ERRORS = []
WARNINGS = []

def err(msg):
    ERRORS.append(msg)
    print(f'  ❌ {msg}')

def warn(msg):
    WARNINGS.append(msg)
    print(f'  ⚠️  {msg}')

# 1) Load base questions
with open(SRC_PATH, encoding='utf-8') as f:
    base = json.load(f)
by_id = {q['id']: q for q in base}
print(f'Loaded {len(base)} base questions from questions.json')

# 2) Load all enrichment lots
enrichments = {}
for n in range(1, 11):
    path = os.path.join(TOOLS_DIR, f'enrichment_lot{n}.json')
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    cnt = 0
    for k, v in data.items():
        if k.startswith('_'):
            continue
        qid = int(k)
        if qid in enrichments:
            err(f'Q{qid}: enrichment defined in multiple lots')
        enrichments[qid] = v
        cnt += 1
    print(f'Lot {n}: {cnt} questions enriched')

print(f'\nTotal enriched: {len(enrichments)}')

# 3) Merge + validate
merged = []
for qid in range(1, 101):
    if qid not in by_id:
        err(f'Q{qid}: missing in questions.json')
        continue
    if qid not in enrichments:
        err(f'Q{qid}: missing enrichment')
        continue

    base_q = by_id[qid]
    enrich_q = enrichments[qid]

    out = {
        'id': qid,
        'type': base_q['type'],
        'verif': {
            'question': base_q['enonce'],
            'reponse': base_q['reponse'],
            **enrich_q.get('verif', {}),
        },
        'qser': {
            'question': base_q['qser_question'],
            'reponse': base_q['qser_reponse'],
            **enrich_q.get('qser', {}),
        },
        'secours': {
            'question': base_q['secours_question'],
            'reponse': base_q['secours_reponse'],
            **enrich_q.get('secours', {}),
        },
    }
    merged.append(out)

# 4) Integrity checks
print('\n=== Integrity checks ===')

for q in merged:
    qid = q['id']

    # Each sub-part must have a valid mode
    for part in ('verif', 'qser', 'secours'):
        sp = q[part]
        mode = sp.get('mode')
        if not mode:
            err(f'Q{qid}.{part}: missing mode')
            continue
        if mode not in VALID_MODES:
            err(f'Q{qid}.{part}: invalid mode "{mode}"')

        # Question text must exist (except verif which can be empty if pure gesture? actually all have a question)
        if not sp.get('question'):
            err(f'Q{qid}.{part}: missing question text')

        # Mode-specific checks
        if mode == 'qcm':
            distracteurs = sp.get('distracteurs') or []
            if len(distracteurs) != 3:
                err(f'Q{qid}.{part} (qcm): expected 3 distracteurs, got {len(distracteurs)}')
            if not sp.get('reponse'):
                err(f'Q{qid}.{part} (qcm): missing reponse (la bonne réponse)')
            memo = sp.get('mots_cles_memo') or []
            if not memo:
                warn(f'Q{qid}.{part} (qcm): no mots_cles_memo')

        elif mode == 'libre':
            mots = sp.get('mots_cles') or []
            if not mots:
                err(f'Q{qid}.{part} (libre): missing mots_cles')
            if not sp.get('reponse'):
                err(f'Q{qid}.{part} (libre): missing reponse (modèle)')

        elif mode in ('geste_interieur', 'geste_exterieur'):
            # Gesture mode: no distracteurs nor mots_cles expected. Reponse can be empty.
            if 'distracteurs' in sp:
                warn(f'Q{qid}.{part} (geste): unexpected distracteurs field')
            if 'mots_cles' in sp:
                warn(f'Q{qid}.{part} (geste): unexpected mots_cles field')

    # VI/VE type matches gesture mode
    typ = q['type']
    verif_mode = q['verif']['mode']
    if typ == 'VI' and verif_mode == 'geste_exterieur':
        err(f'Q{qid}: type VI but verif.mode is geste_exterieur')
    if typ == 'VE' and verif_mode == 'geste_interieur':
        err(f'Q{qid}: type VE but verif.mode is geste_interieur')

# 5) Stats
print('\n=== Stats ===')
mode_counts = {'verif': {}, 'qser': {}, 'secours': {}}
for q in merged:
    for part in ('verif', 'qser', 'secours'):
        m = q[part]['mode']
        mode_counts[part][m] = mode_counts[part].get(m, 0) + 1

for part in ('verif', 'qser', 'secours'):
    print(f'{part}: {mode_counts[part]}')

total_distracteurs = sum(len(q[p].get('distracteurs', [])) for q in merged for p in ('verif', 'qser', 'secours'))
total_memo = sum(len(q[p].get('mots_cles_memo', [])) for q in merged for p in ('verif', 'qser', 'secours'))
total_mots_cles = sum(len(q[p].get('mots_cles', [])) for q in merged for p in ('verif', 'qser', 'secours'))
print(f'\nDistracteurs total: {total_distracteurs}')
print(f'Mots-clés mémo total: {total_memo}')
print(f'Mots-clés libre total: {total_mots_cles}')

# 6) Write output
os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
with open(OUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(merged, f, ensure_ascii=False, indent=2)
print(f'\nSaved to {OUT_PATH}')
print(f'File size: {os.path.getsize(OUT_PATH)/1024:.1f} KB')

# 7) Summary
print(f'\n=== Summary ===')
print(f'Total questions merged: {len(merged)}')
print(f'Errors:   {len(ERRORS)}')
print(f'Warnings: {len(WARNINGS)}')
if ERRORS:
    print('\n❌ ERRORS:')
    for e in ERRORS:
        print(f'  - {e}')
    sys.exit(1)
print('\n✅ All checks passed!')
