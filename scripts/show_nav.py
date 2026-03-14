from pathlib import Path

ar = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_AR 2.html').read_text(encoding='utf-8')
en = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_EN 2.html').read_text(encoding='utf-8')

ar_nav_start = ar.find('<nav>')
ar_nav_end = ar.find('</nav>') + 6
print('=== AR NAV ===')
print(ar[ar_nav_start:ar_nav_end])
print()
en_nav_start = en.find('<nav>')
en_nav_end = en.find('</nav>') + 6
print('=== EN NAV ===')
print(en[en_nav_start:en_nav_end])
