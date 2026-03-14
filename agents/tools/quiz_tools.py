"""Quiz engine tools for the quiz-agent."""

from __future__ import annotations

import json
import logging
import uuid

from langchain_core.tools import tool

from agents.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Mock question bank (in production, loaded from PostgreSQL)
# ---------------------------------------------------------------------------

MOCK_QUESTIONS: list[dict] = [
    {
        "id": "q001",
        "topic": "Operative Dentistry",
        "subtopic": "Composite Resins",
        "difficulty": "medium",
        "text": (
            "A patient requires a Class II composite restoration on tooth #36. "
            "Which of the following techniques is MOST effective for reducing "
            "polymerization shrinkage stress?"
        ),
        "options": {
            "A": "Bulk fill technique with 4mm increments",
            "B": "Oblique layering technique with 2mm increments",
            "C": "Horizontal layering with 3mm increments",
            "D": "Single increment placement with high-intensity curing",
        },
        "correct_answer": "B",
        "explanation": (
            "The oblique layering technique (2mm increments) reduces the C-factor "
            "by directing polymerization shrinkage away from bonded surfaces. "
            "Bulk fill exceeding 2mm leads to inadequate cure depth and higher stress."
        ),
        "citations": [
            {"book": "Sturdevant's Art & Science of Operative Dentistry", "chapter": "8", "page": "205"}
        ],
        "sdle_year": "2023",
    },
    {
        "id": "q002",
        "topic": "Oral Pathology",
        "subtopic": "Oral Malignancies",
        "difficulty": "hard",
        "text": (
            "A 55-year-old male presents with a non-healing ulcer on the lateral "
            "border of the tongue that has been present for 3 months. He has a "
            "30-year smoking history. Biopsy reveals keratin pearls and "
            "epithelial dysplasia. What is the MOST likely diagnosis?"
        ),
        "options": {
            "A": "Traumatic ulcer",
            "B": "Squamous cell carcinoma",
            "C": "Verrucous carcinoma",
            "D": "Mucoepidermoid carcinoma",
        },
        "correct_answer": "B",
        "explanation": (
            "Squamous cell carcinoma (SCC) is the most common oral malignancy (~90%). "
            "Key features: non-healing ulcer, lateral tongue (most common site), "
            "smoking history, and histological findings of keratin pearls with "
            "dysplasia. Verrucous carcinoma is exophytic, not ulcerative."
        ),
        "citations": [
            {"book": "Neville's Oral and Maxillofacial Pathology", "chapter": "10", "page": "409"}
        ],
        "sdle_year": "2024",
    },
    {
        "id": "q003",
        "topic": "Periodontics",
        "subtopic": "Biological Width",
        "difficulty": "medium",
        "text": (
            "The biological width consists of the junctional epithelium and "
            "connective tissue attachment. What is the average total dimension "
            "of the biological width?"
        ),
        "options": {
            "A": "1.07 mm",
            "B": "2.04 mm",
            "C": "3.0 mm",
            "D": "0.97 mm",
        },
        "correct_answer": "B",
        "explanation": (
            "Biological width averages 2.04mm: connective tissue attachment "
            "(1.07mm) + junctional epithelium (0.97mm). This was established "
            "by Gargiulo et al. (1961). Violating this dimension causes chronic "
            "inflammation and bone loss."
        ),
        "citations": [
            {"book": "Carranza's Clinical Periodontology", "chapter": "2", "page": "38"}
        ],
        "sdle_year": "2023",
    },
    {
        "id": "q004",
        "topic": "Pharmacology",
        "subtopic": "Local Anesthetics",
        "difficulty": "easy",
        "text": (
            "Which local anesthetic is CONTRAINDICATED in patients with "
            "atypical plasma cholinesterase deficiency?"
        ),
        "options": {
            "A": "Lidocaine",
            "B": "Articaine",
            "C": "Procaine",
            "D": "Bupivacaine",
        },
        "correct_answer": "C",
        "explanation": (
            "Procaine (an ester-type local anesthetic) is metabolized by plasma "
            "cholinesterase. Patients with atypical cholinesterase have impaired "
            "metabolism of ester anesthetics, leading to prolonged and potentially "
            "toxic blood levels. Amide types (lidocaine, articaine, bupivacaine) "
            "are metabolized hepatically and are safe alternatives."
        ),
        "citations": [
            {"book": "Pharmacology and Therapeutics for Dentistry", "chapter": "16", "page": "242"}
        ],
        "sdle_year": "2024",
    },
    {
        "id": "q005",
        "topic": "Prosthodontics",
        "subtopic": "Complete Dentures",
        "difficulty": "medium",
        "text": (
            "During the jaw relation record for a complete denture, the vertical "
            "dimension of occlusion (VDO) is determined. If the VDO is set too "
            "high, which of the following is the MOST likely consequence?"
        ),
        "options": {
            "A": "Clicking of teeth during speech",
            "B": "Angular cheilitis",
            "C": "Gagging reflex",
            "D": "All of the above",
        },
        "correct_answer": "D",
        "explanation": (
            "Excessive VDO causes: clicking during speech (teeth contact), "
            "angular cheilitis (lip stretching reduces commissure moisture), "
            "gagging (posterior extension), muscle fatigue, and TMJ discomfort. "
            "The interocclusal rest space is eliminated."
        ),
        "citations": [
            {"book": "Prosthodontic Treatment for Edentulous Patients (Zarb)", "chapter": "14", "page": "283"}
        ],
        "sdle_year": "2023",
    },
]


@tool
def question_selector(
    weak_topics: str = "[]",
    difficulty: str = "medium",
    count: int = 5,
) -> str:
    """Select quiz questions from the bank, weighted toward weak topics.

    Args:
        weak_topics: JSON array of topic names the student struggles with.
        difficulty: Target difficulty level (easy, medium, hard).
        count: Number of questions to select.

    Returns:
        JSON array of selected question objects.
    """
    try:
        weak = json.loads(weak_topics) if weak_topics else []
    except (json.JSONDecodeError, TypeError):
        weak = []

    # Prioritise weak-topic questions
    weak_qs = [q for q in MOCK_QUESTIONS if q["topic"] in weak]
    other_qs = [q for q in MOCK_QUESTIONS if q["topic"] not in weak]

    selected = weak_qs[:count]
    remaining = count - len(selected)
    if remaining > 0:
        selected.extend(other_qs[:remaining])

    session_id = str(uuid.uuid4())
    return json.dumps({
        "session_id": session_id,
        "questions": selected[:count],
        "total_selected": len(selected[:count]),
        "time_per_question": settings.default_quiz_time_per_question,
    })


@tool
def hint_generator(question_id: str, hint_number: int = 1) -> str:
    """Generate a Socratic hint for a quiz question without revealing the answer.

    Args:
        question_id: The question ID to generate a hint for.
        hint_number: Which hint level (1=broad, 2=narrow, 3=strong).

    Returns:
        A Socratic hint string.
    """
    question = next((q for q in MOCK_QUESTIONS if q["id"] == question_id), None)
    if not question:
        return json.dumps({"error": f"Question {question_id} not found"})

    hints = {
        1: f"Think about the key concept behind {question['subtopic']}. "
           f"What fundamental principle applies here?",
        2: f"Consider the options carefully. Two of them can be eliminated "
           f"because they violate a core principle of {question['subtopic']}.",
        3: f"The answer relates specifically to how {question['subtopic']} "
           f"affects clinical outcomes. Focus on the most evidence-based option.",
    }

    hint_text = hints.get(
        min(hint_number, 3),
        "You've used all hints. Trust your knowledge and make your best choice.",
    )

    return json.dumps({
        "question_id": question_id,
        "hint_number": hint_number,
        "hint": hint_text,
        "hints_remaining": max(0, 3 - hint_number),
    })


@tool
def explanation_builder(question_id: str, student_answer: str) -> str:
    """Generate a detailed post-answer explanation with citations.

    Args:
        question_id: The question ID to explain.
        student_answer: The option key the student selected (A, B, C, or D).

    Returns:
        JSON object with correctness, explanation, and citations.
    """
    question = next((q for q in MOCK_QUESTIONS if q["id"] == question_id), None)
    if not question:
        return json.dumps({"error": f"Question {question_id} not found"})

    is_correct = student_answer.upper() == question["correct_answer"]

    citations_text = "; ".join(
        f"{c['book']}, Ch. {c['chapter']}, p. {c['page']}"
        for c in question.get("citations", [])
    )

    return json.dumps({
        "question_id": question_id,
        "is_correct": is_correct,
        "student_answer": student_answer.upper(),
        "correct_answer": question["correct_answer"],
        "explanation": question["explanation"],
        "citations": citations_text,
        "topic": question["topic"],
        "subtopic": question["subtopic"],
    })


@tool
def answer_evaluator(question_id: str, student_answer: str) -> str:
    """Evaluate a student's answer and update performance tracking.

    Args:
        question_id: The question ID being answered.
        student_answer: The option key the student selected.

    Returns:
        JSON object with evaluation result and performance update.
    """
    question = next((q for q in MOCK_QUESTIONS if q["id"] == question_id), None)
    if not question:
        return json.dumps({"error": f"Question {question_id} not found"})

    is_correct = student_answer.upper() == question["correct_answer"]

    return json.dumps({
        "question_id": question_id,
        "is_correct": is_correct,
        "topic": question["topic"],
        "difficulty": question["difficulty"],
        "points_earned": 1.0 if is_correct else 0.0,
        "feedback": "Correct!" if is_correct else f"The correct answer is {question['correct_answer']}.",
    })
