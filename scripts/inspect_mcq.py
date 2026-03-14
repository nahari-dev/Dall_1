from pathlib import Path

ar = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_AR 2.html').read_text(encoding='utf-8')
en = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_EN 2.html').read_text(encoding='utf-8')

# Find the mcq-preview block in AR and show exact bytes
idx = ar.find('mcq-preview')
if idx != -1:
    block = ar[idx-10 : idx+600]
    print('=== AR mcq-preview raw ===')
    print(repr(block))
    print()

idx2 = en.find('mcq-preview')
if idx2 != -1:
    block2 = en[idx2-10 : idx2+600]
    print('=== EN mcq-preview raw ===')
    print(repr(block2))
