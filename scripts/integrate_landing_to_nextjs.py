#!/usr/bin/env python3
"""
Copy landing pages into dall-academy/public/ and fix all internal links
so they work inside Next.js at localhost:3000.
"""
import os
import re
import shutil

SRC_AR = "/tmp/dall-landing/dall_platform_v5_AR 2.html"
SRC_EN = "/tmp/dall-landing/dall_platform_v5_EN 2.html"
PUBLIC_DIR = "/Users/alinaahari/Downloads/Dall-Agents-main/dall-academy/public"
DST_AR = os.path.join(PUBLIC_DIR, "landing-ar.html")
DST_EN = os.path.join(PUBLIC_DIR, "landing-en.html")

os.makedirs(PUBLIC_DIR, exist_ok=True)

# ── Process EN page ──────────────────────────────────────────────────────────
with open(SRC_EN, encoding="utf-8") as f:
    en = f.read()

# Language toggle links
en = en.replace('href="dall_platform_v5_AR 2.html"', 'href="/landing-ar.html"')
en = en.replace("href='dall_platform_v5_AR 2.html'", "href='/landing-ar.html'")

# Sign In button → link
en = en.replace(
    '<button class="btn-ghost">Sign In</button>',
    '<a href="/login" class="btn-ghost">Sign In</a>'
)

# Hero CTA buttons → link to /register
en = en.replace(
    '<button class="btn-primary">Start Free Trial →</button>',
    '<a href="/register" class="btn-primary">Start Free Trial →</a>'
)

# Mobile drawer CTA (links to #pricing, make it go to /register instead)
en = en.replace(
    '<a href="#pricing" class="mob-cta">Try Free for 7 Days</a>',
    '<a href="/register" class="mob-cta">Try Free for 7 Days</a>'
)

with open(DST_EN, "w", encoding="utf-8") as f:
    f.write(en)
print(f"Written: {DST_EN}")

# ── Process AR page ──────────────────────────────────────────────────────────
with open(SRC_AR, encoding="utf-8") as f:
    ar = f.read()

# Language toggle links
ar = ar.replace('href="dall_platform_v5_EN 2.html"', 'href="/landing-en.html"')
ar = ar.replace("href='dall_platform_v5_EN 2.html'", "href='/landing-en.html'")

# Sign In button → link
ar = ar.replace(
    '<button class="btn-ghost">تسجيل الدخول</button>',
    '<a href="/login" class="btn-ghost">تسجيل الدخول</a>'
)

# Hero CTA buttons → link to /register
ar = ar.replace(
    '<button class="btn-primary">ابدأ تجربتك المجانية ←</button>',
    '<a href="/register" class="btn-primary">ابدأ تجربتك المجانية ←</a>'
)

with open(DST_AR, "w", encoding="utf-8") as f:
    f.write(ar)
print(f"Written: {DST_AR}")

# ── Verify ───────────────────────────────────────────────────────────────────
print("\n── Verification ──")
for path, label in [(DST_EN, "EN"), (DST_AR, "AR")]:
    with open(path, encoding="utf-8") as f:
        content = f.read()
    checks = {
        "lang toggle href fixed":  ("/landing-ar.html" in content or "/landing-en.html" in content),
        "old spaced filename gone": ("v5_AR 2.html" not in content and "v5_EN 2.html" not in content),
        "/login link present":      ('/login"' in content),
        "/register link present":   ('/register"' in content),
    }
    print(f"\n[{label}]")
    for desc, ok in checks.items():
        print(f"  {'✓' if ok else '✗'} {desc}")
