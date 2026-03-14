"""Logo management service — System branding uploads."""

from __future__ import annotations

import logging
import mimetypes

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from agents.config import settings

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".svg"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


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


async def upload_logo(file_content: bytes, filename: str) -> tuple[str, int]:
    """Upload a logo to S3 storage.

    Args:
        file_content: Binary file content.
        filename: Original filename.

    Returns:
        Tuple of (logo_url, file_size).

    Raises:
        ValueError: If file is invalid.
    """
    # Validate file extension
    ext = "." + filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Invalid file type. Allowed: {ALLOWED_EXTENSIONS}")

    # Validate file size
    file_size = len(file_content)
    if file_size > MAX_FILE_SIZE:
        raise ValueError(f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024}MB")

    # Upload to S3
    s3 = _get_s3_client()
    key = f"branding/logo{ext}"
    mime_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"

    try:
        s3.put_object(
            Bucket=settings.s3_bucket_name,
            Key=key,
            Body=file_content,
            ContentType=mime_type,
        )
        logger.info("Uploaded logo: %s (%d bytes)", key, file_size)

        # Generate signed URL for retrieval
        logo_url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.s3_bucket_name, "Key": key},
            ExpiresIn=604800,  # 7 days
        )
        return logo_url, file_size

    except ClientError as e:
        logger.error("Failed to upload logo: %s", e)
        raise ValueError("Failed to upload logo to storage") from e


async def delete_logo() -> None:
    """Delete the current logo from S3 storage."""
    s3 = _get_s3_client()
    key = "branding/logo"

    try:
        # Try to delete common logo formats
        for ext in ALLOWED_EXTENSIONS:
            try:
                s3.delete_object(Bucket=settings.s3_bucket_name, Key=f"branding/logo{ext}")
            except ClientError:
                pass

        logger.info("Deleted logo")

    except ClientError as e:
        logger.error("Failed to delete logo: %s", e)
        raise ValueError("Failed to delete logo from storage") from e


async def get_logo_url() -> str | None:
    """Get the current logo URL from S3 storage.

    Returns:
        Signed URL for the logo, or None if not found.
    """
    s3 = _get_s3_client()

    try:
        # Try to find logo in common formats
        for ext in ALLOWED_EXTENSIONS:
            key = f"branding/logo{ext}"
            try:
                s3.head_object(Bucket=settings.s3_bucket_name, Key=key)
                # Logo exists, generate signed URL
                logo_url = s3.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": settings.s3_bucket_name, "Key": key},
                    ExpiresIn=604800,  # 7 days
                )
                return logo_url
            except ClientError:
                continue

        return None

    except ClientError as e:
        logger.error("Failed to retrieve logo URL: %s", e)
        return None
