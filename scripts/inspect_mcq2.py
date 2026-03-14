from pathlib import Path

ar = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_AR 2.html').read_text(encoding='utf-8')
en = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_EN 2.html').read_text(encoding='utf-8')

# Find the div in HTML (not CSS)
ar_idx = ar.find('<div class="mcq-preview">')
en_idx = en.find('<div class="mcq-preview">')

print('=== AR MCQ div (raw bytes, 700 chars) ===')
print(repr(ar[ar_idx:ar_idx+700]))
print()
print('=== EN MCQ div (raw bytes, 700 chars) ===')
print(repr(en[en_idx:en_idx+700]))
