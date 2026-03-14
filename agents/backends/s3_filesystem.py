"""S3 filesystem backend — durable storage for session logs and exports.

Uses an S3-compatible API (MinIO in development, AWS S3 in production) to
store session transcripts, exported study plans, and analytics reports.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import Any

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from agents.config import settings

logger = logging.getLogger(__name__)


def _get_s3_client():
    """Create an S3 client configured for the current environment."""
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )


def ensure_bucket() -> None:
    """Create the bucket if it doesn't exist."""
    s3 = _get_s3_client()
    try:
        s3.head_bucket(Bucket=settings.s3_bucket_name)
    except ClientError:
        s3.create_bucket(Bucket=settings.s3_bucket_name)
        logger.info("Created S3 bucket: %s", settings.s3_bucket_name)


async def save_session_log(
    session_id: str,
    student_id: str,
    messages: list[dict[str, Any]],
) -> str:
    """Save a complete session transcript to S3.

    Args:
        session_id: Chat session ID.
        student_id: Student UUID.
        messages: List of message dicts.

    Returns:
        The S3 object key.
    """
    key = f"sessions/{student_id}/{session_id}/{datetime.utcnow().isoformat()}.json"
    payload = json.dumps({
        "session_id": session_id,
        "student_id": student_id,
        "messages": messages,
        "exported_at": datetime.utcnow().isoformat(),
    })

    s3 = _get_s3_client()
    s3.put_object(
        Bucket=settings.s3_bucket_name,
        Key=key,
        Body=payload.encode(),
        ContentType="application/json",
    )
    logger.info("Saved session log: %s", key)
    return key


async def save_study_plan(student_id: str, plan: dict[str, Any]) -> str:
    """Export a study plan to S3 for later retrieval.

    Args:
        student_id: Student UUID.
        plan: The study plan dict.

    Returns:
        The S3 object key.
    """
    key = f"study-plans/{student_id}/{datetime.utcnow().date().isoformat()}.json"
    payload = json.dumps({
        "student_id": student_id,
        "plan": plan,
        "generated_at": datetime.utcnow().isoformat(),
    })

    s3 = _get_s3_client()
    s3.put_object(
        Bucket=settings.s3_bucket_name,
        Key=key,
        Body=payload.encode(),
        ContentType="application/json",
    )
    logger.info("Saved study plan: %s", key)
    return key


async def load_object(key: str) -> dict[str, Any] | None:
    """Load a JSON object from S3.

    Args:
        key: S3 object key.

    Returns:
        Parsed dict or ``None`` if not found.
    """
    s3 = _get_s3_client()
    try:
        resp = s3.get_object(Bucket=settings.s3_bucket_name, Key=key)
        return json.loads(resp["Body"].read().decode())
    except ClientError:
        return None
