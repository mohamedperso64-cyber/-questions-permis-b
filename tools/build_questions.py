"""Construit questions.json à partir du PDF officiel DSR/BRPCE."""
import sys, io, json, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import pdfplumber

PDF_PATH = r'C:\Users\compt\Downloads\banque-verifications-23_01_2023.pdf'
OUT_PATH = r'C:\Users\compt\Desktop\site_questions_permis\src\data\questions.json'
COL_SPLIT = 315
NUM_X_MAX = 100

def group_lines(words, y_tol=4):
    if not words:
        return []
    words = sorted(words, key=lambda w: (w['top'], w['x0']))
    lines = []
    current = [words[0]]
    current_top = words[0]['top']
    for w in words[1:]:
        if abs(w['top'] - current_top) <= y_tol:
            current.append(w)
        else:
            lines.append(sorted(current, key=lambda x: x['x0']))
            current = [w]
            current_top = w['top']
    if current:
        lines.append(sorted(current, key=lambda x: x['x0']))
    return lines

def split_line(line):
    num_words = [w for w in line if w['x1'] < NUM_X_MAX]
    left_words = [w for w in line if NUM_X_MAX <= w['x0'] < COL_SPLIT]
    right_words = [w for w in line if w['x0'] >= COL_SPLIT]
    return (
        ' '.join(w['text'] for w in num_words).strip(),
        ' '.join(w['text'] for w in left_words).strip(),
        ' '.join(w['text'] for w in right_words).strip(),
    )

def is_footer(left, right):
    combined = re.sub(r'\s+', '', (left + right)).lower()
    if 'eranver' in combined or 'navre' in combined:
        return True
    return False

with pdfplumber.open(PDF_PATH) as pdf:
    rows = []
    for page_idx, page in enumerate(pdf.pages):
        if page_idx == 0 or page_idx >= 39:
            continue
        words = page.extract_words(use_text_flow=False, keep_blank_chars=False)
        for line in group_lines(words):
            num, left, right = split_line(line)
            if is_footer(left, right):
                continue
            rows.append({'num': num, 'left': left, 'right': right})

questions = []
current = None
section = None

def flush(q):
    if q is None:
        return
    for k, v in list(q.items()):
        if isinstance(v, str):
            q[k] = re.sub(r'\s+', ' ', v).strip()
    questions.append(q)

for row in rows:
    L, R, num = row['left'], row['right'], row['num']
    L_strip = L.strip()

    if L_strip in ('VI', 'VE'):
        flush(current)
        current = {
            'id': None, 'type': L_strip,
            'enonce': '', 'reponse': '',
            'qser_question': '', 'qser_reponse': '',
            'secours_question': '', 'secours_reponse': '',
        }
        section = 'verif'
        if num and re.fullmatch(r'\d{1,3}', num):
            current['id'] = int(num)
        continue

    if L_strip == 'QSER' or L_strip.startswith('QSER '):
        section = 'qser'
        if current is not None and num and re.fullmatch(r'\d{1,3}', num) and current['id'] is None:
            current['id'] = int(num)
        continue

    if L_strip == '1ers secours' or L_strip.startswith('1ers secours '):
        section = 'secours'
        if current is not None and num and re.fullmatch(r'\d{1,3}', num) and current['id'] is None:
            current['id'] = int(num)
        continue

    if num and re.fullmatch(r'\d{1,3}', num) and current is not None and current['id'] is None:
        current['id'] = int(num)

    if current is None or section is None:
        continue

    target_q_key = {'verif': 'enonce', 'qser': 'qser_question', 'secours': 'secours_question'}[section]
    target_a_key = {'verif': 'reponse', 'qser': 'qser_reponse', 'secours': 'secours_reponse'}[section]
    if L:
        current[target_q_key] += ' ' + L
    if R:
        current[target_a_key] += ' ' + R

flush(current)

# Renumber question 0 (PDF labels last question '00') as 100
for q in questions:
    if q['id'] == 0:
        q['id'] = 100

# Final cleanup
PUA_RE = re.compile(r'[-]')  # Private Use Area chars injected by PDF extraction
for q in questions:
    for k in ('enonce', 'reponse', 'qser_question', 'qser_reponse', 'secours_question', 'secours_reponse'):
        v = q[k]
        v = PUA_RE.sub('', v)
        v = re.sub(r'er\s*anver', '', v, flags=re.IGNORECASE)
        v = re.sub(r'eranver', '', v, flags=re.IGNORECASE)
        v = re.sub(r'(?:^|\s)P(?=\s|$)', ' ', v)
        v = re.sub(r'\s+', ' ', v).strip()
        q[k] = v

# Stats
print(f'Total: {len(questions)} | VI: {sum(1 for q in questions if q["type"]=="VI")} | VE: {sum(1 for q in questions if q["type"]=="VE")}')
missing = [i for i in range(1, 101) if i not in [q["id"] for q in questions]]
print(f'Missing IDs: {missing}')

questions.sort(key=lambda q: q['id'] if q['id'] else 999)

# Apply manual overrides (corrections de qualité)
import os
OVERRIDES_PATH = os.path.join(os.path.dirname(__file__), 'overrides.json')
if os.path.exists(OVERRIDES_PATH):
    with open(OVERRIDES_PATH, encoding='utf-8') as f:
        overrides = json.load(f)
    applied = 0
    for q in questions:
        key = str(q['id'])
        if key in overrides:
            for field, value in overrides[key].items():
                if field.startswith('_'):
                    continue
                q[field] = value
                applied += 1
    print(f'Overrides applied: {applied} fields across {sum(1 for q in questions if str(q["id"]) in overrides)} questions')

os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
with open(OUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
print(f'Saved to {OUT_PATH}')
