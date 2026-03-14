"""Auth router — Registration, login, and token management."""

from __future__ import annotations

import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.models.schemas import (
    LoginRequest,
    RegisterRequest,
    StudentResponse,
    TokenResponse,
)
from backend.services.auth_service import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

# In-memory user store for development (replaced by PostgreSQL in production)
_users_db: dict[str, dict] = {}


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Extract and validate the current user from the JWT bearer token."""
    try:
        payload = decode_token(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id or user_id not in _users_db:
            raise HTTPException(status_code=401, detail="Invalid token")
        return _users_db[user_id]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(req: RegisterRequest):
    """Register a new student account.

    Returns JWT access and refresh tokens on success.
    """
    # Check for existing email
    for user in _users_db.values():
        if user["email"] == req.email:
            raise HTTPException(status_code=409, detail="Email already registered")

    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "name": req.name,
        "email": req.email,
        "password_hash": hash_password(req.password),
        "role": "student",
        "tier": "free",
    }
    _users_db[user_id] = user
    logger.info("Registered new user: %s", req.email)

    return TokenResponse(
        access_token=create_access_token({"sub": user_id, "role": "student", "tier": "free"}),
        refresh_token=create_refresh_token({"sub": user_id}),
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """Authenticate a student and return JWT tokens."""
    # Find user by email
    user = None
    for u in _users_db.values():
        if u["email"] == req.email:
            user = u
            break

    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    logger.info("User logged in: %s", req.email)

    return TokenResponse(
        access_token=create_access_token({
            "sub": user["id"],
            "role": user["role"],
            "tier": user["tier"],
        }),
        refresh_token=create_refresh_token({"sub": user["id"]}),
    )


@router.get("/me", response_model=StudentResponse)
async def get_me(user: dict = Depends(get_current_user)):
    """Get the current authenticated student's profile."""
    from datetime import datetime

    return StudentResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        tier=user["tier"],
        created_at=datetime.utcnow(),
    )
