"""Fix annual price: set back to 499 (only the annual card, not Dall Life)."""
import re
from pathlib import Path

files = [
    Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_AR 2.html'),
    Path('/Users/alinaahari/Library/Mobile Documents/com~apple~CloudDocs/Downloads/dall_platform_v5_EN 2.html'),
]

for path in files:
    html = path.read_text(encoding='utf-8')

    # The annual card contains a unique period label — use it as anchor
    # AR: price-period contains "سنة كاملة" / EN: "Full year"
    # Strategy: find the annual price-card block and replace 899 → 499 only within it

    def fix_annual(html, anchor):
        """Find price-card containing anchor text and fix its price-amt from 899 to 499."""
        idx = html.find(anchor)
        if idx == -1:
            return html, False
        # Walk back to the start of this price-card div
        card_start = html.rfind('<div class="price-card', 0, idx)
        # Walk forward to find end of this card (next <div class="price-card or end of pricing-grid)
        next_card = html.find('<div class="price-card', card_start + 10)
        if next_card == -1:
            next_card = html.find('</div>', idx + 200)
        card_block = html[card_start:next_card]
        fixed_block = card_block.replace(
            '<div class="price-amt">899 <span class="price-unit">',
            '<div class="price-amt">499 <span class="price-unit">',
            1  # only first occurrence within this card
        )
        if fixed_block != card_block:
            html = html[:card_start] + fixed_block + html[next_card:]
            return html, True
        return html, False

    # AR anchor: "سنة كاملة" (annual period text), EN anchor: "Full year"
    html, ar_ok = fix_annual(html, 'سنة كاملة')
    html, en_ok = fix_annual(html, 'Full year')
    changed = ar_ok or en_ok

    path.write_text(html, encoding='utf-8')
    print(f'{path.name}: {"fixed" if changed else "no change"}')

# Sync to local server
import shutil
dest = Path('/tmp/dall-landing')
dest.mkdir(exist_ok=True)
for path in files:
    shutil.copy(path, dest / path.name)

# Verify
print()
for path in files:
    html = path.read_text(encoding='utf-8')
    prices = re.findall(r'class="price-amt">(\d+)', html)
    names  = re.findall(r'class="price-name">([^<]+)', html)
    for n, p in zip(names, prices):
        print(f'  {path.name[:2].upper()}  {n}: {p} SAR')
