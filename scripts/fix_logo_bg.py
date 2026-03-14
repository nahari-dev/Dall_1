"""Remove white background from logo by adding mix-blend-mode: multiply to the img."""
import re
from pathlib import Path

files = [
    Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_AR 2.html'),
    Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_EN 2.html'),
]

OLD_STYLE = 'style="height:38px;object-fit:contain;display:block"'
NEW_STYLE = 'style="height:38px;object-fit:contain;display:block;mix-blend-mode:multiply"'

for path in files:
    html = path.read_text(encoding='utf-8')
    if OLD_STYLE in html:
        html = html.replace(OLD_STYLE, NEW_STYLE)
        path.write_text(html, encoding='utf-8')
        print(f'OK  {path.name}')
    else:
        print(f'SKIP  {path.name} — style not found')
