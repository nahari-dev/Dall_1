from pathlib import Path
import re

ar = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_AR 2.html').read_text(encoding='utf-8')
en = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_EN 2.html').read_text(encoding='utf-8')

# Strip base64 data src for display
def strip_b64(s):
    return re.sub(r'(src="data:image/[^;]+;base64,)[^"]{40,}(")', r'\1...BASE64...\2', s)

ar_nav_start = ar.find('<nav>')
ar_nav_end = ar.find('</nav>') + 6
print('=== AR NAV ===')
print(strip_b64(ar[ar_nav_start:ar_nav_end]))
print()
en_nav_start = en.find('<nav>')
en_nav_end = en.find('</nav>') + 6
print('=== EN NAV ===')
print(strip_b64(en[en_nav_start:en_nav_end]))

# Also check image src
ar_img = re.search(r'<img src="data:image/(\w+);base64,', ar)
en_img = re.search(r'<img src="data:image/(\w+);base64,', en)
print(f'\nAR img type: {ar_img.group(1) if ar_img else "not found"}')
print(f'EN img type: {en_img.group(1) if en_img else "not found"}')
