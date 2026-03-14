from pathlib import Path

ar = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_AR 2.html').read_text(encoding='utf-8')
en = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_EN 2.html').read_text(encoding='utf-8')

checks = [
    ('AR MCQ Arabic perio question', 'جيب لثوي' in ar),
    ('AR MCQ English caries removed', 'sensitivity to sweets' not in ar),
    ('AR correct answer shown', 'رفع السديلة الجراحي' in ar),
    ('AR year 2026', '2026 Dall Academy' in ar),
    ('EN hero stat English', 'SCFHS References' in en),
    ('EN stats band English', 'out of 800' in en),
    ('EN price 129 SAR', '129 <span class="price-unit">SAR</span>' in en),
    ('EN price 299 SAR', '299 <span class="price-unit">SAR</span>' in en),
    ('EN price 499 SAR', '499 <span class="price-unit">SAR</span>' in en),
    ('EN period no Arabic', 'لمدة 3 Months' not in en),
    ('EN Dall Life features English', 'Everything in Annual' in en),
    ('EN Q-Bank label English', 'Full Referenced Q-Bank' in en),
    ('EN MCQ perio question', 'Periodontal flap surgery' in en),
    ('EN year 2026', '2026 Dall Academy' in en),
    ('EN no Arabic ر.س', 'ر.س' not in en),
]

all_pass = True
for label, result in checks:
    icon = 'OK' if result else 'FAIL'
    print(f'{icon}  {label}')
    if not result:
        all_pass = False

print()
print('All checks passed!' if all_pass else 'Some checks FAILED.')
