"""Replace the Arabic MCQ in the AR landing page with English-only version."""
from pathlib import Path

AR = Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_AR 2.html')
html = AR.read_text(encoding='utf-8')

# Find the mcq-preview div and replace its inner content
idx_start = html.find('<div class="mcq-preview"')
idx_end   = html.find('</div>', html.find('</div>', idx_start) + 1)
# We need to close at the right level — find the closing </div> of the outer mcq-preview
# It ends with </div>\n        </div>
block_end_marker = '        </div>\n      </div>\n\n      <div class="float-card float1">'
idx_block_end = html.find(block_end_marker)

old_block = html[idx_start:idx_block_end + len('        </div>')]

new_block = '''<div class="mcq-preview">
          <div class="mcq-q-text">A 35-year-old patient has a 6mm periodontal pocket on the mesial surface of tooth #14. What is the MOST appropriate treatment?</div>
          <div class="mcq-opts">
            <div class="mcq-opt">A. Scaling and root planing</div>
            <div class="mcq-opt correct">B. Periodontal flap surgery ✓</div>
            <div class="mcq-opt wrong">C. Guided tissue regeneration</div>
            <div class="mcq-opt">D. Extraction</div>
          </div>
          <div class="mcq-cite">📖 Carranza's Clinical Periodontology, 13th ed.</div>
          <div style="margin-top:8px;padding:8px 10px;background:rgba(74,143,163,.12);border-radius:7px;font-size:10px;color:rgba(255,255,255,.65);line-height:1.65;"><span style="color:#93c5d9;font-weight:700">Explanation: </span>Pockets ≥6mm that do not respond to scaling and root planing require periodontal flap surgery for direct root surface access and pocket depth reduction.</div>
        </div>'''

if old_block in html:
    html = html.replace(old_block, new_block)
    AR.write_text(html, encoding='utf-8')
    print(f'OK — saved ({AR.stat().st_size:,} bytes)')
else:
    print('Block not found — trying simpler match...')
    # Fallback: replace just the content between mcq-preview tags using the Arabic text as anchor
    if 'جيب لثوي' in html:
        start = html.find('<div class="mcq-preview"')
        # find closing outer div
        depth = 0
        i = start
        while i < len(html):
            if html[i:i+4] == '<div':
                depth += 1
            elif html[i:i+6] == '</div>':
                depth -= 1
                if depth == 0:
                    end = i + 6
                    break
            i += 1
        old = html[start:end]
        html = html.replace(old, new_block)
        AR.write_text(html, encoding='utf-8')
        print(f'OK (fallback) — saved ({AR.stat().st_size:,} bytes)')
    else:
        print('Arabic MCQ not found')
