"""Fix all language/content issues in both EN and AR landing pages."""
from pathlib import Path

AR = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_AR 2.html')
EN = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_EN 2.html')

# ─── AR FIXES ─────────────────────────────────────────────────────────────────
ar = AR.read_text(encoding='utf-8')

# 1. Replace English MCQ with the Arabic periodontics question
ar = ar.replace(
    '''        <div class="mcq-preview">
          <div class="mcq-q-text">A 35-year-old patient presents with sensitivity to sweets. Examination reveals caries on the mesial surface of tooth 26. What is the MOST appropriate treatment?</div>
          <div class="mcq-opts">
            <div class="mcq-opt wrong">A. Monitor without intervention</div>
            <div class="mcq-opt">B. Deep scaling</div>
            <div class="mcq-opt correct">C. Composite restoration ✓</div>
            <div class="mcq-opt">D. Root canal treatment</div>
          </div>
          <div class="mcq-cite">📖 Sturdevant's Operative Dentistry, 5th ed., p.231</div>
          <div style="margin-top:8px;padding:8px 10px;background:rgba(74,143,163,.12);border-radius:7px;font-size:10px;color:rgba(255,255,255,.65);line-height:1.65;"><span style="color:#93c5d9;font-weight:700">Explanation: </span>Interproximal caries at this stage requires composite restoration for both structural and aesthetic reasons.</div>
        </div>''',
    '''        <div class="mcq-preview" dir="rtl" style="text-align:right">
          <div class="mcq-q-text" style="font-family:\'IBM Plex Arabic\',sans-serif;font-size:11.5px">مريض عمره 35 سنة يعاني من جيب لثوي عمقه 6mm على السطح الأنسي للسن 14، ما هو أفضل علاج؟</div>
          <div class="mcq-opts">
            <div class="mcq-opt" style="font-family:\'IBM Plex Arabic\',sans-serif">أ. تنظيف وتسوية الجذور</div>
            <div class="mcq-opt correct" style="font-family:\'IBM Plex Arabic\',sans-serif">ب. رفع السديلة الجراحي ✓</div>
            <div class="mcq-opt wrong" style="font-family:\'IBM Plex Arabic\',sans-serif">ج. التجديد الموجَّه للأنسجة</div>
            <div class="mcq-opt" style="font-family:\'IBM Plex Arabic\',sans-serif">د. الخلع</div>
          </div>
          <div class="mcq-cite">📖 Carranza\'s Clinical Periodontology, 13th ed.</div>
          <div style="margin-top:8px;padding:8px 10px;background:rgba(74,143,163,.12);border-radius:7px;font-size:10px;color:rgba(255,255,255,.65);line-height:1.65;font-family:\'IBM Plex Arabic\',sans-serif"><span style="color:#93c5d9;font-weight:700">الشرح: </span>الجيوب اللثوية بعمق ≥6mm لا تستجيب بشكل كافٍ للعلاج التحفظي وحده؛ رفع السديلة الجراحي يُتيح وصولاً مباشراً لتنظيف السطح الجذري وتقليل عمق الجيب.</div>
        </div>'''
)

# 2. Footer year
ar = ar.replace('© 2025 Dall Academy. جميع الحقوق محفوظة.', '© 2026 Dall Academy. جميع الحقوق محفوظة.')

AR.write_text(ar, encoding='utf-8')
print(f'AR: saved ({AR.stat().st_size} bytes)')

# ─── EN FIXES ─────────────────────────────────────────────────────────────────
en = EN.read_text(encoding='utf-8')

# 1. Hero stat label
en = en.replace('<span class="hero-stat-label">مرجع SCFHS</span>', '<span class="hero-stat-label">SCFHS References</span>')

# 2. Stats band — remove Arabic "من"
en = en.replace('Passing Score من 800', 'Passing Score out of 800')

# 3. Pricing currency ر.س → SAR
en = en.replace('<span class="price-unit">ر.س</span>', '<span class="price-unit">SAR</span>')

# 4. "لمدة 3 Months" → "3 Months"
en = en.replace('<div class="price-period">لمدة 3 Months</div>', '<div class="price-period">3 Months</div>')

# 5. Arabic in Dall Life features
en = en.replace('<li><span class="chk">✓</span> كل مميزات الAnnual</li>', '<li><span class="chk">✓</span> Everything in Annual</li>')

# 6. "Referenced Q-Bank كامل" → "Full Referenced Q-Bank"
en = en.replace('<li><span class="chk">✓</span> Referenced Q-Bank كامل</li>', '<li><span class="chk">✓</span> Full Referenced Q-Bank</li>')

# 7. Update EN MCQ to a stronger SDLE-style question with clear answer
en = en.replace(
    '''        <div class="mcq-preview">
          <div class="mcq-q-text">A 35-year-old patient presents with sensitivity to sweets. Examination reveals caries on the mesial surface of tooth 26. What is the MOST appropriate treatment?</div>
          <div class="mcq-opts">
            <div class="mcq-opt wrong">A. Monitor without intervention</div>
            <div class="mcq-opt">B. Deep scaling</div>
            <div class="mcq-opt correct">C. Composite restoration ✓</div>
            <div class="mcq-opt">D. Root canal treatment</div>
          </div>
          <div class="mcq-cite">📖 Sturdevant\'s Operative Dentistry, 5th ed., p.231</div>
          <div style="margin-top:8px;padding:8px 10px;background:rgba(74,143,163,.12);border-radius:7px;font-size:10px;color:rgba(255,255,255,.65);line-height:1.65;"><span style="color:#93c5d9;font-weight:700">Explanation: </span>Interproximal caries at this stage requires composite restoration for both structural and aesthetic reasons.</div>
        </div>''',
    '''        <div class="mcq-preview">
          <div class="mcq-q-text">A 28-year-old patient has a 6mm periodontal pocket on the mesial of tooth #14 with 25% bone loss. Initial therapy gave no improvement. What is the MOST appropriate next step?</div>
          <div class="mcq-opts">
            <div class="mcq-opt wrong">A. Repeat scaling and root planing</div>
            <div class="mcq-opt correct">B. Periodontal flap surgery ✓</div>
            <div class="mcq-opt">C. Guided tissue regeneration</div>
            <div class="mcq-opt">D. Extraction</div>
          </div>
          <div class="mcq-cite">📖 Carranza\'s Clinical Periodontology, 13th ed., p.591</div>
          <div style="margin-top:8px;padding:8px 10px;background:rgba(74,143,163,.12);border-radius:7px;font-size:10px;color:rgba(255,255,255,.65);line-height:1.65;"><span style="color:#93c5d9;font-weight:700">Explanation: </span>Pockets ≥5mm that persist after non-surgical therapy require open flap debridement for direct root surface access and pocket reduction.</div>
        </div>'''
)

# 8. Footer year
en = en.replace('© 2025 Dall Academy. All rights reserved.', '© 2026 Dall Academy. All rights reserved.')

EN.write_text(en, encoding='utf-8')
print(f'EN: saved ({EN.stat().st_size} bytes)')
print('All done.')
