"""Update pricing in both landing pages and re-copy to /tmp/dall-landing."""
import re
from pathlib import Path

files = {
    'AR': Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_AR 2.html'),
    'EN': Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_EN 2.html'),
}

PRICES = [
    ('129', '399'),
    ('299', '499'),
    ('499', '899'),
]

for lang, path in files.items():
    html = path.read_text(encoding='utf-8')
    for old, new in PRICES:
        # Match price-amt div: e.g. >129 <span or >299 <span
        html = re.sub(
            rf'(<div class="price-amt">){old}(\s*<span)',
            rf'\g<1>{new}\2',
            html
        )
    path.write_text(html, encoding='utf-8')
    print(f'{lang}: updated')

# Re-copy to /tmp so localhost reflects changes
import shutil
dest = Path('/tmp/dall-landing')
dest.mkdir(exist_ok=True)
for path in files.values():
    shutil.copy(path, dest / path.name)
    print(f'Copied {path.name} → /tmp/dall-landing/')

print('Done.')
