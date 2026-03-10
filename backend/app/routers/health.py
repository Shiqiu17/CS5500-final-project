from fastapi import APIRouter

router = APIRouter()
@router.get("/health")
def health_check():
    """A simple health check endpoint to verify that the API is running."""
    return {"status": "healthy"}
