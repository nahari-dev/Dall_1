from pathlib import Path

ar = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_AR 2.html').read_text(encoding='utf-8')
en = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_EN 2.html').read_text(encoding='utf-8')

ar_idx = ar.find('<div class="mcq-preview">')
en_idx = en.find('<div class="mcq-preview">')

# Show 20 chars before so we can see indentation
print('=== AR: 20 chars before + 800 after ===')
print(repr(ar[ar_idx-20:ar_idx+900]))
print()
print('=== EN: 20 chars before + 800 after ===')
print(repr(en[en_idx-20:en_idx+900]))
