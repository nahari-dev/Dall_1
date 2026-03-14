"""Fix all language/content issues in both EN and AR landing pages — v2 with exact strings."""
from pathlib import Path

AR = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_AR 2.html')
EN = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_EN 2.html')

# ─── AR FIXES ─────────────────────────────────────────────────────────────────
ar = AR.read_text(encoding='utf-8')

AR_OLD_MCQ = (
    '<div class="mcq-preview">\n'
    '          <div class="mcq-q-text">A 35-year-old patient presents with sensitivity to sweets. Examination reveals caries on the mesial surface of tooth 26. What is the MOST appropriate treatment?</div>\n'
    '          <div class="mcq-opts">\n'
    '            <div class="mcq-opt wrong">A. Monitor without intervention</div>\n'
    '            <div class="mcq-opt">B. Deep scaling</div>\n'
    '            <div class="mcq-opt correct">C. Composite restoration \u2713</div>\n'
    '            <div class="mcq-opt">D. Root canal treatment</div>\n'
    '          </div>\n'
    '          <div class="mcq-cite">\U0001f4d6 Sturdevant\'s Operative Dentistry, 5th ed., p.231</div>\n'
    '          <div style="margin-top:8px;padding:8px 10px;background:rgba(74,143,163,.12);border-radius:7px;font-size:10px;color:rgba(255,255,255,.65);line-height:1.65;">'
    '<span style="color:#93c5d9;font-weight:700">\u0627\u0644\u0634\u0631\u062d: </span>'
    '\u0627\u0644\u062a\u0633\u0648\u0633 \u0639\u0644\u0649 \u0627\u0644\u0633\u0637\u062d \u0627\u0644\u0625\u0646\u0633\u064a \u064a\u0633\u062a\u062f\u0639\u064a \u062d\u0634\u0648\u0629 \u0645\u0631\u0643\u0651\u0628\u0629 composite \u2014 \u0642\u0648\u064a\u0629 \u0648\u0645\u0646\u0627\u0633\u0628\u0629 \u0645\u0646 \u0627\u0644\u0646\u0627\u062d\u064a\u0629 \u0627\u0644\u062a\u062c\u0645\u064a\u0644\u064a\u0629. '
    '<span style="opacity:.55">/ Interproximal caries at this stage requires composite restoration for both structural and aesthetic reasons.</span></div>\n'
    '        </div>'
)

AR_NEW_MCQ = (
    '<div class="mcq-preview" dir="rtl" style="text-align:right">\n'
    '          <div class="mcq-q-text" style="font-family:\'IBM Plex Arabic\',sans-serif;font-size:11.5px">'
    '\u0645\u0631\u064a\u0636 \u0639\u0645\u0631\u0647 35 \u0633\u0646\u0629 \u064a\u0639\u0627\u0646\u064a \u0645\u0646 \u062c\u064a\u0628 \u0644\u062b\u0648\u064a \u0639\u0645\u0642\u0647 6mm \u0639\u0644\u0649 \u0627\u0644\u0633\u0637\u062d \u0627\u0644\u0623\u0646\u0633\u064a \u0644\u0644\u0633\u0646 14\u060c \u0645\u0627 \u0647\u0648 \u0623\u0641\u0636\u0644 \u0639\u0644\u0627\u062c\u061f</div>\n'
    '          <div class="mcq-opts">\n'
    '            <div class="mcq-opt" style="font-family:\'IBM Plex Arabic\',sans-serif">\u0623. \u062a\u0646\u0638\u064a\u0641 \u0648\u062a\u0633\u0648\u064a\u0629 \u0627\u0644\u062c\u0630\u0648\u0631</div>\n'
    '            <div class="mcq-opt correct" style="font-family:\'IBM Plex Arabic\',sans-serif">\u0628. \u0631\u0641\u0639 \u0627\u0644\u0633\u062f\u064a\u0644\u0629 \u0627\u0644\u062c\u0631\u0627\u062d\u064a \u2713</div>\n'
    '            <div class="mcq-opt wrong" style="font-family:\'IBM Plex Arabic\',sans-serif">\u062c. \u0627\u0644\u062a\u062c\u062f\u064a\u062f \u0627\u0644\u0645\u0648\u062c\u064e\u0651\u0647 \u0644\u0644\u0623\u0646\u0633\u062c\u0629</div>\n'
    '            <div class="mcq-opt" style="font-family:\'IBM Plex Arabic\',sans-serif">\u062f. \u0627\u0644\u062e\u0644\u0639</div>\n'
    '          </div>\n'
    '          <div class="mcq-cite">\U0001f4d6 Carranza\'s Clinical Periodontology, 13th ed.</div>\n'
    '          <div style="margin-top:8px;padding:8px 10px;background:rgba(74,143,163,.12);border-radius:7px;font-size:10px;color:rgba(255,255,255,.65);line-height:1.65;font-family:\'IBM Plex Arabic\',sans-serif">'
    '<span style="color:#93c5d9;font-weight:700">\u0627\u0644\u0634\u0631\u062d: </span>'
    '\u0627\u0644\u062c\u064a\u0648\u0628 \u0627\u0644\u0644\u062b\u0648\u064a\u0629 \u0628\u0639\u0645\u0642 \u22656mm \u0644\u0627 \u062a\u0633\u062a\u062c\u064a\u0628 \u0628\u0634\u0643\u0644 \u0643\u0627\u0641\u064d \u0644\u0644\u0639\u0644\u0627\u062c \u0627\u0644\u062a\u062d\u0641\u0638\u064a \u0648\u062d\u062f\u0647\u061b '
    '\u0631\u0641\u0639 \u0627\u0644\u0633\u062f\u064a\u0644\u0629 \u0627\u0644\u062c\u0631\u0627\u062d\u064a \u064a\u064f\u062a\u064a\u062d \u0648\u0635\u0648\u0644\u0627\u064b \u0645\u0628\u0627\u0634\u0631\u0627\u064b \u0644\u062a\u0646\u0638\u064a\u0641 \u0627\u0644\u0633\u0637\u062d \u0627\u0644\u062c\u0630\u0631\u064a \u0648\u062a\u0642\u0644\u064a\u0644 \u0639\u0645\u0642 \u0627\u0644\u062c\u064a\u0628.</div>\n'
    '        </div>'
)

if AR_OLD_MCQ in ar:
    ar = ar.replace(AR_OLD_MCQ, AR_NEW_MCQ)
    print('AR MCQ: replaced OK')
else:
    print('AR MCQ: OLD STRING NOT FOUND — searching for partial match...')
    idx = ar.find('<div class="mcq-preview">')
    if idx != -1:
        snippet = ar[idx:idx+120]
        print(f'  Found at idx {idx}: {repr(snippet)}')

# footer year
if '2025 Dall Academy' in ar:
    ar = ar.replace('\u00a9 2025 Dall Academy. \u062c\u0645\u064a\u0639 \u0627\u0644\u062d\u0642\u0648\u0642 \u0645\u062d\u0641\u0648\u0638\u0629.', '\u00a9 2026 Dall Academy. \u062c\u0645\u064a\u0639 \u0627\u0644\u062d\u0642\u0648\u0642 \u0645\u062d\u0641\u0648\u0638\u0629.')
    print('AR year: updated to 2026')

AR.write_text(ar, encoding='utf-8')
print(f'AR saved ({AR.stat().st_size} bytes)')

# ─── EN FIXES ─────────────────────────────────────────────────────────────────
en = EN.read_text(encoding='utf-8')

EN_OLD_MCQ = (
    '<div class="mcq-preview">\n'
    '          <div class="mcq-q-text">A 35-year-old patient presents with sensitivity to sweets. Examination reveals caries on the mesial surface of tooth 26. What is the MOST appropriate treatment?</div>\n'
    '          <div class="mcq-opts">\n'
    '            <div class="mcq-opt wrong">A. Monitor without intervention</div>\n'
    '            <div class="mcq-opt">B. Deep scaling</div>\n'
    '            <div class="mcq-opt correct">C. Composite restoration \u2713</div>\n'
    '            <div class="mcq-opt">D. Root canal treatment</div>\n'
    '          </div>\n'
    '          <div class="mcq-cite">\U0001f4d6 Sturdevant\'s Operative Dentistry, 5th ed., p.231</div>\n'
    '          <div style="margin-top:8px;padding:8px 10px;background:rgba(74,143,163,.12);border-radius:7px;font-size:10px;color:rgba(255,255,255,.65);line-height:1.65;">'
    '<span style="color:#93c5d9;font-weight:700">Explanation: </span>'
    'Interproximal caries at this stage requires composite restoration \u2014 the preferred material for both structural strength and aesthetics in posterior teeth.</div>\n'
    '        </div>'
)

EN_NEW_MCQ = (
    '<div class="mcq-preview">\n'
    '          <div class="mcq-q-text">A 28-year-old patient has a 6mm periodontal pocket on the mesial of tooth #14 with 25% bone loss. Scaling and root planing produced no improvement. What is the MOST appropriate next step?</div>\n'
    '          <div class="mcq-opts">\n'
    '            <div class="mcq-opt wrong">A. Repeat scaling and root planing</div>\n'
    '            <div class="mcq-opt correct">B. Periodontal flap surgery \u2713</div>\n'
    '            <div class="mcq-opt">C. Guided tissue regeneration</div>\n'
    '            <div class="mcq-opt">D. Extraction</div>\n'
    '          </div>\n'
    '          <div class="mcq-cite">\U0001f4d6 Carranza\'s Clinical Periodontology, 13th ed., p.591</div>\n'
    '          <div style="margin-top:8px;padding:8px 10px;background:rgba(74,143,163,.12);border-radius:7px;font-size:10px;color:rgba(255,255,255,.65);line-height:1.65;">'
    '<span style="color:#93c5d9;font-weight:700">Explanation: </span>'
    'Pockets \u22655mm that persist after non-surgical therapy require open flap debridement for direct root surface access and pocket depth reduction.</div>\n'
    '        </div>'
)

if EN_OLD_MCQ in en:
    en = en.replace(EN_OLD_MCQ, EN_NEW_MCQ)
    print('EN MCQ: replaced OK')
else:
    print('EN MCQ: OLD STRING NOT FOUND')

en = en.replace('<span class="hero-stat-label">\u0645\u0631\u062c\u0639 SCFHS</span>', '<span class="hero-stat-label">SCFHS References</span>')
en = en.replace('Passing Score \u0645\u0646 800', 'Passing Score out of 800')
en = en.replace('<span class="price-unit">\u0631.\u0633</span>', '<span class="price-unit">SAR</span>')
en = en.replace('<div class="price-period">\u0644\u0645\u062f\u0629 3 Months</div>', '<div class="price-period">3 Months</div>')
en = en.replace('\u0643\u0644 \u0645\u0645\u064a\u0632\u0627\u062a \u0627\u0644Annual', 'Everything in Annual')
en = en.replace('Referenced Q-Bank \u0643\u0627\u0645\u0644', 'Full Referenced Q-Bank')
en = en.replace('\u00a9 2025 Dall Academy. All rights reserved.', '\u00a9 2026 Dall Academy. All rights reserved.')

EN.write_text(en, encoding='utf-8')
print(f'EN saved ({EN.stat().st_size} bytes)')
print('Done.')
