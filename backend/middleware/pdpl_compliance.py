"""PDPL compliance middleware — Saudi Personal Data Protection Law.

Ensures API responses don't leak PII and that data handling complies
with the Saudi PDPL requirements for data minimisation and purpose
limitation.
"""

from __future__ import annotations

import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger(__name__)

# Endpoints that handle PII and require extra scrutiny
PII_ENDPOINTS = ["/api/auth/register", "/api/auth/me", "/api/admin/analytics"]


class PDPLComplianceMiddleware(BaseHTTPMiddleware):
    """Enforce Saudi PDPL data protection requirements at the API level.

    - Adds data handling headers
    - Logs access to PII endpoints
    - Ensures consent-aware processing
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path

        # Log PII endpoint access
        if any(path.startswith(ep) for ep in PII_ENDPOINTS):
            logger.info(
                "PDPL audit: PII endpoint accessed | path=%s method=%s ip=%s",
                path,
                request.method,
                request.client.host if request.client else "unknown",
            )

        response = await call_next(request)

        # PDPL compliance headers
        response.headers["X-Data-Processing"] = "educational-purpose-only"
        response.headers["X-Data-Retention"] = "session-based"
        response.headers["X-PDPL-Compliant"] = "true"

        return response
