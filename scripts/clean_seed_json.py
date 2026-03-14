import json
import re
from pathlib import Path

path = Path(__file__).parent.parent / "data" / "seed_questions.json"
data = json.loads(path.read_text(encoding="utf-8"))
print(f"Before: {len(data)} questions")

def norm(t):
    return re.sub(r"\s+", " ", t).strip().lower()

seen = {}
deduped = []
for q in data:
    key = norm(q.get("text", ""))
    if key not in seen:
        seen[key] = True
        q.pop("source_file", None)
        q.pop("source_page", None)
        deduped.append(q)

removed = len(data) - len(deduped)
print(f"After dedup: {len(deduped)} questions (removed {removed} duplicates)")
remaining = sum(1 for q in deduped if "source_file" in q or "source_page" in q)
print(f"Remaining source fields: {remaining}")
path.write_text(json.dumps(deduped, ensure_ascii=False, indent=2), encoding="utf-8")
print("Done - file saved.")
