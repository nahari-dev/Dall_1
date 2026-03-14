"""SQLAlchemy ORM models for the Dall Academy database.

All tables use UUID primary keys and UTC timestamps.  PII fields
(name, email) are stored in columns that should be encrypted at rest
via database-level or application-level encryption (see PII middleware).
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(AsyncAttrs, DeclarativeBase):
    """Base class for all ORM models."""

    pass


class Student(Base):
    """Registered student account."""

    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="student")
    tier: Mapped[str] = mapped_column(String(50), nullable=False, default="free")
    preferences_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    quiz_sessions: Mapped[list["QuizSession"]] = relationship(back_populates="student")
    topic_scores: Mapped[list["StudentTopicScore"]] = relationship(back_populates="student")
    study_plans: Mapped[list["StudyPlan"]] = relationship(back_populates="student")
    chat_sessions: Mapped[list["ChatSession"]] = relationship(back_populates="student")


class QuizSession(Base):
    """A completed quiz session."""

    __tablename__ = "quiz_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id"), nullable=False, index=True
    )
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)  # seconds
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    student: Mapped["Student"] = relationship(back_populates="quiz_sessions")
    answers: Mapped[list["QuizAnswer"]] = relationship(back_populates="session")


class QuizAnswer(Base):
    """Individual answer within a quiz session."""

    __tablename__ = "quiz_answers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quiz_sessions.id"), nullable=False, index=True
    )
    question_id: Mapped[str] = mapped_column(String(50), nullable=False)
    selected: Mapped[str] = mapped_column(String(10), nullable=False)
    correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    time_spent: Mapped[int] = mapped_column(Integer, nullable=False, default=0)  # seconds

    session: Mapped["QuizSession"] = relationship(back_populates="answers")


class Question(Base):
    """Question bank entry."""

    __tablename__ = "questions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    subtopic: Mapped[str] = mapped_column(String(255), nullable=True)
    difficulty: Mapped[str] = mapped_column(String(50), nullable=False, default="medium")
    text: Mapped[str] = mapped_column(Text, nullable=False)
    options_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    correct_answer: Mapped[str] = mapped_column(String(10), nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=True)
    citations_json: Mapped[list | None] = mapped_column(JSON, nullable=True)
    sdle_year: Mapped[str | None] = mapped_column(String(10), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class StudentTopicScore(Base):
    """Running per-topic score for adaptive learning."""

    __tablename__ = "student_topic_scores"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id"), primary_key=True
    )
    topic: Mapped[str] = mapped_column(String(255), primary_key=True)
    score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    last_updated: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("student_id", "topic"),)

    student: Mapped["Student"] = relationship(back_populates="topic_scores")


class StudyPlan(Base):
    """Generated personalised study plan."""

    __tablename__ = "study_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id"), nullable=False, index=True
    )
    plan_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    student: Mapped["Student"] = relationship(back_populates="study_plans")


class ChatSession(Base):
    """Chat conversation session."""

    __tablename__ = "chat_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id"), nullable=False, index=True
    )
    messages_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    student: Mapped["Student"] = relationship(back_populates="chat_sessions")


class TextbookSource(Base):
    """Indexed textbook chunk for RAG."""

    __tablename__ = "textbook_sources"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book: Mapped[str] = mapped_column(String(255), nullable=False)
    chapter: Mapped[str] = mapped_column(String(50), nullable=False)
    page: Mapped[str] = mapped_column(String(20), nullable=False)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    embedding_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
