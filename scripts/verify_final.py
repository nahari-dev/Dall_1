import re
from pathlib import Path

AR = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_AR 2.html')
EN = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_EN 2.html')

def check(path, checks):
    html = path.read_text(encoding='utf-8')
    print(f'\n=== {path.name} ===')
    for label, fn in checks:
        result = fn(html)
        print(f"{'OK' if result else 'FAIL'}  {label}")

ar_checks = [
    ('Logo updated (new base64)', lambda h: 'dall logo/logo.png' not in h and len(re.findall(r'data:image/png;base64,', h)) >= 2),
    ('Logo src present', lambda h: 'data:image/png;base64,' in h),
    ('Lang toggle CSS', lambda h: '.btn-lang' in h),
    ('Lang EN button in nav-right', lambda h: 'dall_platform_v5_EN 2.html' in h and 'btn-lang' in h),
    ('Mobile drawer lang link', lambda h: h.count('dall_platform_v5_EN 2.html') >= 2),
    ('AR MCQ correct', lambda h: 'جيب لثوي' in h),
    ('Year 2026', lambda h: '2026 Dall Academy' in h),
]

en_checks = [
    ('Logo src present', lambda h: 'data:image/png;base64,' in h),
    ('Lang toggle CSS', lambda h: '.btn-lang' in h),
    ('Lang AR button in nav-right', lambda h: 'dall_platform_v5_AR 2.html' in h and 'btn-lang' in h),
    ('Mobile drawer lang link', lambda h: h.count('dall_platform_v5_AR 2.html') >= 2),
    ('EN MCQ correct', lambda h: 'Periodontal flap surgery' in h),
    ('No Arabic ر.س', lambda h: 'ر.س' not in h),
    ('Year 2026', lambda h: '2026 Dall Academy' in h),
]

check(AR, ar_checks)
check(EN, en_checks)
