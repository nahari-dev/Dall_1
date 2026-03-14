"""
Add new Dall logo (base64) + language toggle button to both landing pages.
"""
import base64, re
from pathlib import Path

LOGO_PATH = Path('/Users/alinaahari/Downloads/dall logo/logo.png')
AR_FILE   = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_AR 2.html')
EN_FILE   = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_EN 2.html')

# ── Encode logo ───────────────────────────────────────────────────────────────
logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_src  = f'data:image/png;base64,{logo_b64}'
print(f'Logo encoded: {len(logo_b64):,} chars')

# ── CSS for language toggle ───────────────────────────────────────────────────
LANG_BTN_CSS = '''
/* ─── Language Toggle ─── */
.btn-lang{font-family:\'DM Sans\';font-size:12px;font-weight:700;background:transparent;
  color:var(--teal);border:1.5px solid var(--teal);border-radius:8px;padding:7px 14px;
  cursor:pointer;transition:.2s;text-decoration:none;display:inline-flex;align-items:center;gap:5px;letter-spacing:.5px}
.btn-lang:hover{background:var(--teal);color:#fff}
'''

def process(path, lang_btn_html, other_nav_links_label, other_file_name):
    html = path.read_text(encoding='utf-8')

    # 1. Replace logo src (keep alt attribute)
    html = re.sub(
        r'<img src="data:image/[^"]+"\s*alt="Dall Academy">',
        f'<img src="{logo_src}" alt="Dall Academy" style="height:38px;object-fit:contain;display:block">',
        html
    )

    # 2. Inject lang button CSS before </style>
    if '.btn-lang' not in html:
        html = html.replace('</style>', LANG_BTN_CSS + '</style>', 1)

    # 3. Add lang button to desktop nav-right (before last </div> of nav-right)
    html = html.replace(
        '<div class="nav-right">',
        '<div class="nav-right" style="align-items:center;gap:10px">',
        1
    )
    # Insert lang button as first child of nav-right
    html = html.replace(
        '<div class="nav-right" style="align-items:center;gap:10px">',
        f'<div class="nav-right" style="align-items:center;gap:10px">\n    {lang_btn_html}',
        1
    )

    # 4. Add lang button to mobile drawer (before the .mob-cta)
    mob_cta_marker = '<a href="#pricing" class="mob-cta">'
    mob_lang = f'<a href="{other_file_name}" style="display:flex;align-items:center;gap:8px;color:var(--teal);font-weight:700;border-color:rgba(74,143,163,.3)">{lang_btn_html.replace("<a ","<span ").replace("</a>","</span>")}</a>\n  '
    if mob_cta_marker in html:
        html = html.replace(mob_cta_marker, mob_lang + mob_cta_marker, 1)

    path.write_text(html, encoding='utf-8')
    print(f'{path.name}: saved ({path.stat().st_size:,} bytes)')

# ── AR page: show "EN" button → links to EN file ──────────────────────────────
AR_LANG_BTN = '<a href="dall_platform_v5_EN 2.html" class="btn-lang">🌐 EN</a>'

# ── EN page: show "عربي" button → links to AR file ────────────────────────────
EN_LANG_BTN = '<a href="dall_platform_v5_AR 2.html" class="btn-lang">🌐 عربي</a>'

process(AR_FILE, AR_LANG_BTN, 'EN', 'dall_platform_v5_EN 2.html')
process(EN_FILE, EN_LANG_BTN, 'AR', 'dall_platform_v5_AR 2.html')
print('Done.')
