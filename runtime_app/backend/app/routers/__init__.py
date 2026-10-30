from app.routers.documents import router as documents_router
from app.routers.claims import router as claims_router
from app.routers.verification import router as verification_router

__all__ = ["documents_router", "claims_router", "verification_router"]
