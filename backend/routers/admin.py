"""Admin router — Institutional analytics (admin role only)."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from backend.models.schemas import AdminAnalyticsResponse, LogoResponse
from backend.routers.auth import get_current_user
from backend.services.logo_service import upload_logo, delete_logo, get_logo_url
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """Dependency that enforces admin role."""
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/analytics", response_model=AdminAnalyticsResponse)
async def admin_analytics(user: dict = Depends(require_admin)):
    """Get institution-wide analytics.

    Only accessible to users with the ``admin`` role.
    """
    # Mock institutional data
    return AdminAnalyticsResponse(
        total_students=342,
        active_students_30d=187,
        average_score=64.2,
        top_topics=[
            {"topic": "Operative Dentistry", "avg_score": 72.1, "attempts": 890},
            {"topic": "Oral Pathology", "avg_score": 58.3, "attempts": 654},
            {"topic": "Prosthodontics", "avg_score": 63.7, "attempts": 521},
            {"topic": "Endodontics", "avg_score": 69.5, "attempts": 432},
            {"topic": "Periodontics", "avg_score": 66.8, "attempts": 398},
        ],
        tier_distribution={"free": 245, "pro": 78, "elite": 19},
    )


@router.post("/logo", response_model=LogoResponse)
async def upload_system_logo(
    file: UploadFile = File(...),
    user: dict = Depends(require_admin)
):
    """Upload system branding logo.

    Only accessible to users with the ``admin`` role.
    Admin must provide a valid image file (PNG, JPG, WEBP, or SVG).
    """
    try:
        content = await file.read()
        logo_url, file_size = await upload_logo(content, file.filename or "logo")

        return LogoResponse(
            logo_url=logo_url,
            uploaded_at=datetime.utcnow(),
            file_size=file_size,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Logo upload error: %s", e)
        raise HTTPException(status_code=500, detail="Failed to upload logo")


@router.get("/logo")
async def get_system_logo():
    """Get current system branding logo URL.

    Returns signed URL for public access to the system logo.
    """
    logo_url = await get_logo_url()

    if not logo_url:
        raise HTTPException(status_code=404, detail="Logo not found")

    return {"logo_url": logo_url}


@router.delete("/logo")
async def delete_system_logo(user: dict = Depends(require_admin)):
    """Delete current system branding logo.

    Only accessible to users with the ``admin`` role.
    """
    try:
        await delete_logo()
        return {"message": "Logo deleted successfully"}

    except Exception as e:
        logger.error("Logo deletion error: %s", e)
        raise HTTPException(status_code=500, detail="Failed to delete logo")
