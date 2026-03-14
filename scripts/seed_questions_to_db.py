"""
Seed the Question table in PostgreSQL from data/seed_questions.json.

Connects directly to the running Docker Postgres (port 5433).
Skips questions whose qnum already exists (idempotent).
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime
from pathlib import Path

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    import sys
    sys.exit("Run: pip install psycopg2-binary")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

DB_URL = "postgresql://dall_user:dall_password@localhost:5433/dall_academy"

DATA_FILE = Path(__file__).parent.parent / "data" / "seed_questions.json"

# Map dataset topics → Prisma Section enum values
# (The Prisma enum has 5 values; we collapse the 10 dataset topics)
SECTION_MAP = {
    "Endodontics":              "ENDODONTICS",
    "Fixed Prosthodontics":     "RESTORATIVE",
    "Implantology":             "ORAL_MEDICINE",
    "Oral Medicine & Surgery":  "ORAL_MEDICINE",
    "Orthodontics":             "ORTHO_PEDO",
    "Pediatric Dentistry":      "ORTHO_PEDO",
    "Periodontics":             "PERIODONTICS",
    "Professionalism & Safety": "ORAL_MEDICINE",
    "Removable Prosthodontics": "RESTORATIVE",
    "Restorative Dentistry":    "RESTORATIVE",
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def build_options(raw: dict[str, str]) -> dict:
    """Lower-case the option keys to match seed.ts convention (a/b/c/d)."""
    return {k.lower(): v for k, v in raw.items()}


def main() -> None:
    questions = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    print(f"Loaded {len(questions)} questions from {DATA_FILE.name}")

    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    # Ensure the table exists (idempotent CREATE IF NOT EXISTS via Prisma
    # migrations should already have run; if not, we'll error clearly).
    cur.execute("SELECT to_regclass('public.\"Question\"')")
    if cur.fetchone()[0] is None:
        conn.close()
        raise RuntimeError(
            'Table "Question" does not exist. '
            "Run `prisma migrate deploy` or `prisma db push` inside dall-academy/ first."
        )

    inserted = 0
    skipped = 0

    for q in questions:
        qnum = q["id"].upper().replace("Q", "Q-", 1)  # q0001 → Q-0001
        section = SECTION_MAP.get(q["topic"], "ORAL_MEDICINE")
        options = build_options(q["options"])
        # correctKey: dataset has null answers — use empty string as placeholder
        correct_key = q.get("correct_answer") or ""
        explanation = q.get("explanation") or ""
        # reference: leave empty — textbook reference populated later via RAG/admin.
        # Never store the SDLE study PDF filename here.
        reference = ""
        tags: list[str] = [q["topic"].lower().replace(" ", "-").replace("&", "and")]
        if q.get("subtopic"):
            tags.append(q["subtopic"].lower().replace(" ", "-"))

        cur.execute(
            """
            INSERT INTO "Question"
                (id, qnum, section, difficulty, "textEn", options, "correctKey",
                 "explanationEn", reference, tags, "usageCount", "correctCount", "createdAt")
            VALUES (%s, %s, %s::"Section", %s::"Difficulty",
                    %s, %s, %s, %s, %s, %s, 0, 0, %s)
            ON CONFLICT (qnum) DO NOTHING
            """,
            (
                str(uuid.uuid4()),
                qnum,
                section,
                "INTERMEDIATE",
                q["text"],
                json.dumps(options),
                correct_key,
                explanation,
                reference,
                tags,
                datetime.utcnow(),
            ),
        )
        if cur.rowcount == 1:
            inserted += 1
        else:
            skipped += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"Done — inserted: {inserted}, skipped (already exists): {skipped}")


if __name__ == "__main__":
    main()
