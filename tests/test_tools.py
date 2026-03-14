"""Tests for domain tools."""

from __future__ import annotations

import json

import pytest


# ---------------------------------------------------------------------------
# knowledge_tools
# ---------------------------------------------------------------------------


class TestChromadbSearch:
    def test_fallback_returns_mock_chunks(self):
        """chromadb_search falls back to mock data when ChromaDB is unavailable."""
        from agents.tools.knowledge_tools import chromadb_search
        result = chromadb_search.invoke({"query": "composite resins"})
        chunks = json.loads(result)
        assert isinstance(chunks, list)
        assert len(chunks) > 0
        assert "content" in chunks[0]
        assert "book" in chunks[0]

    def test_caries_search_returns_relevant(self):
        from agents.tools.knowledge_tools import chromadb_search
        result = chromadb_search.invoke({"query": "caries bacteria demineralization"})
        chunks = json.loads(result)
        assert any("caries" in c["content"].lower() or "demineralization" in c["content"].lower() for c in chunks)

    def test_default_query_returns_chunks(self):
        from agents.tools.knowledge_tools import chromadb_search
        result = chromadb_search.invoke({"query": "periodontal ligament"})
        chunks = json.loads(result)
        assert len(chunks) > 0


class TestSourceIndexSearch:
    def test_verified_claim(self):
        from agents.tools.knowledge_tools import source_index_search
        result = source_index_search.invoke({"claim": "composite resin filler content"})
        data = json.loads(result)
        assert "verified" in data
        assert "confidence" in data
        assert isinstance(data["confidence"], float)

    def test_empty_claim_returns_not_verified(self):
        from agents.tools.knowledge_tools import source_index_search
        result = source_index_search.invoke({"claim": "xyznonexistent123"})
        data = json.loads(result)
        # Should return some result (even if not verified)
        assert "verified" in data


class TestCitationFormatter:
    def test_formats_single_claim(self):
        from agents.tools.knowledge_tools import citation_formatter
        claims = json.dumps([{
            "content": "Composite resins require incremental placement.",
            "source": "Sturdevant's, Ch. 8, p. 205"
        }])
        result = citation_formatter.invoke({"claims": claims})
        assert "[Source:" in result
        assert "Sturdevant's" in result

    def test_multiple_claims(self):
        from agents.tools.knowledge_tools import citation_formatter
        claims = json.dumps([
            {"content": "Claim one.", "source": "Book A, Ch. 1"},
            {"content": "Claim two.", "source": "Book B, Ch. 2"},
        ])
        result = citation_formatter.invoke({"claims": claims})
        assert "Claim one." in result
        assert "Claim two." in result

    def test_invalid_json_returns_input(self):
        from agents.tools.knowledge_tools import citation_formatter
        result = citation_formatter.invoke({"claims": "not json"})
        assert result == "not json"


# ---------------------------------------------------------------------------
# exam_tools
# ---------------------------------------------------------------------------


class TestExamStatsQuery:
    def test_all_topics_returned(self):
        from agents.tools.exam_tools import exam_stats_query
        result = exam_stats_query.invoke({"topic": ""})
        data = json.loads(result)
        assert "topic_distribution" in data
        assert "difficulty_breakdown" in data
        assert data["total_questions"] == 200
        assert data["exam_duration_hours"] == 4

    def test_specific_topic_filter(self):
        from agents.tools.exam_tools import exam_stats_query
        result = exam_stats_query.invoke({"topic": "Operative Dentistry"})
        data = json.loads(result)
        assert "Operative Dentistry" in data["topic_distribution"]

    def test_pass_rate_present(self):
        from agents.tools.exam_tools import exam_stats_query
        result = exam_stats_query.invoke({"topic": ""})
        data = json.loads(result)
        assert "pass_rate" in data
        assert 0 < data["pass_rate"] <= 100


class TestTopicFrequencyAnalyzer:
    def test_returns_ranked_topics(self):
        from agents.tools.exam_tools import topic_frequency_analyzer
        result = topic_frequency_analyzer.invoke({"weak_topics": "[]"})
        data = json.loads(result)
        assert "high_yield_topics" in data
        assert len(data["high_yield_topics"]) > 0

    def test_marks_weak_topics(self):
        from agents.tools.exam_tools import topic_frequency_analyzer
        weak = json.dumps(["Pharmacology", "Oral Pathology"])
        result = topic_frequency_analyzer.invoke({"weak_topics": weak})
        data = json.loads(result)
        weak_items = [t for t in data["high_yield_topics"] if t["is_weak_area"]]
        assert len(weak_items) == 2

    def test_invalid_json_handled_gracefully(self):
        from agents.tools.exam_tools import topic_frequency_analyzer
        result = topic_frequency_analyzer.invoke({"weak_topics": "not json"})
        data = json.loads(result)
        assert "high_yield_topics" in data  # Still returns, just with no weak areas marked


# ---------------------------------------------------------------------------
# quiz_tools
# ---------------------------------------------------------------------------


class TestQuestionSelector:
    def test_returns_question(self):
        from agents.tools.quiz_tools import question_selector
        result = question_selector.invoke({
            "topic_filter": "Operative Dentistry",
            "difficulty": "medium",
            "weak_topics": "[]",
        })
        data = json.loads(result)
        # Returns a session dict with a list of questions
        assert "questions" in data
        assert len(data["questions"]) > 0
        q = data["questions"][0]
        assert "id" in q
        assert "text" in q
        assert "options" in q

    def test_question_has_required_fields(self):
        from agents.tools.quiz_tools import question_selector
        result = question_selector.invoke({
            "topic_filter": "",
            "difficulty": "",
            "weak_topics": "[]",
        })
        data = json.loads(result)
        assert "questions" in data
        q = data["questions"][0]
        for field in ["id", "topic", "difficulty", "text", "options"]:
            assert field in q


class TestAnswerEvaluator:
    def test_correct_answer_detected(self):
        from agents.tools.quiz_tools import answer_evaluator
        result = answer_evaluator.invoke({"question_id": "q001", "student_answer": "B"})
        data = json.loads(result)
        assert data["is_correct"] is True

    def test_wrong_answer_detected(self):
        from agents.tools.quiz_tools import answer_evaluator
        result = answer_evaluator.invoke({"question_id": "q001", "student_answer": "A"})
        data = json.loads(result)
        assert data["is_correct"] is False

    def test_case_insensitive(self):
        from agents.tools.quiz_tools import answer_evaluator
        result = answer_evaluator.invoke({"question_id": "q001", "student_answer": "b"})
        data = json.loads(result)
        assert data["is_correct"] is True

    def test_invalid_question_returns_error(self):
        from agents.tools.quiz_tools import answer_evaluator
        result = answer_evaluator.invoke({"question_id": "q999", "student_answer": "A"})
        data = json.loads(result)
        assert "error" in data


class TestExplanationBuilder:
    def test_correct_answer_explanation(self):
        from agents.tools.quiz_tools import explanation_builder
        result = explanation_builder.invoke({"question_id": "q001", "student_answer": "B"})
        data = json.loads(result)
        assert data["is_correct"] is True
        assert "explanation" in data
        assert len(data["explanation"]) > 10

    def test_wrong_answer_explanation(self):
        from agents.tools.quiz_tools import explanation_builder
        result = explanation_builder.invoke({"question_id": "q001", "student_answer": "A"})
        data = json.loads(result)
        assert data["is_correct"] is False
        assert data["correct_answer"] == "B"


class TestHintGenerator:
    def test_hint_for_valid_question(self):
        from agents.tools.quiz_tools import hint_generator
        result = hint_generator.invoke({"question_id": "q001", "hint_level": 1})
        data = json.loads(result)
        assert "hint" in data
        assert len(data["hint"]) > 5
        # Should NOT reveal the answer directly
        assert "B" not in data["hint"] or "oblique" not in data["hint"].lower()

    def test_invalid_question_returns_error(self):
        from agents.tools.quiz_tools import hint_generator
        result = hint_generator.invoke({"question_id": "q999", "hint_level": 1})
        data = json.loads(result)
        assert "error" in data


# ---------------------------------------------------------------------------
# profile_tools
# ---------------------------------------------------------------------------


class TestProfileReader:
    def test_returns_profile(self):
        from agents.tools.profile_tools import profile_reader
        result = profile_reader.invoke({"student_id": "student-001"})
        data = json.loads(result)
        assert "proficiency_level" in data
        assert "weak_topics" in data
        assert data["student_id"] == "student-001"

    def test_proficiency_levels_valid(self):
        from agents.tools.profile_tools import profile_reader
        result = profile_reader.invoke({"student_id": "test-student"})
        data = json.loads(result)
        assert data["proficiency_level"] in ("beginner", "intermediate", "advanced")


class TestProficiencyUpdater:
    def test_update_returns_confirmation(self):
        from agents.tools.profile_tools import proficiency_updater
        result = proficiency_updater.invoke({
            "student_id": "student-001",
            "topic": "Operative Dentistry",
            "new_score": 85.0,
        })
        data = json.loads(result)
        assert data["updated"] is True
        assert data["new_score"] == 85.0


# ---------------------------------------------------------------------------
# readiness_tools
# ---------------------------------------------------------------------------


class TestReadinessCalculator:
    def test_returns_overall_readiness(self):
        from agents.tools.readiness_tools import readiness_calculator
        result = readiness_calculator.invoke({"student_id": "student-001"})
        data = json.loads(result)
        assert "overall_readiness_pct" in data
        assert 0 <= data["overall_readiness_pct"] <= 100

    def test_on_track_field_present(self):
        from agents.tools.readiness_tools import readiness_calculator
        result = readiness_calculator.invoke({"student_id": "student-001"})
        data = json.loads(result)
        assert "on_track" in data
        assert isinstance(data["on_track"], bool)


class TestGapAnalyzer:
    def test_identifies_weak_topics(self):
        from agents.tools.readiness_tools import gap_analyzer
        result = gap_analyzer.invoke({"student_id": "student-001"})
        gaps = json.loads(result)
        # Returns a list of gap dicts, not a wrapper dict
        assert isinstance(gaps, list)
        assert len(gaps) > 0

    def test_gap_has_required_fields(self):
        from agents.tools.readiness_tools import gap_analyzer
        result = gap_analyzer.invoke({"student_id": "student-001"})
        gaps = json.loads(result)
        assert isinstance(gaps, list)
        if gaps:
            topic = gaps[0]
            assert "topic" in topic
            assert "score" in topic
            assert "gap" in topic


class TestStudyPlanGenerator:
    def test_generates_plan(self):
        from agents.tools.readiness_tools import study_plan_generator
        result = study_plan_generator.invoke({"student_id": "student-001"})
        plan = json.loads(result)
        assert isinstance(plan, list)
        assert len(plan) > 0

    def test_plan_entries_have_required_fields(self):
        from agents.tools.readiness_tools import study_plan_generator
        result = study_plan_generator.invoke({"student_id": "student-001"})
        plan = json.loads(result)
        if plan:
            entry = plan[0]
            assert "day" in entry
            assert "topic" in entry
            assert "activities" in entry
