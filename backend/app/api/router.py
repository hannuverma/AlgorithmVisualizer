from fastapi import APIRouter
from app.api import sorting

api_router = APIRouter()

api_router.include_router(sorting.router, prefix="/sorting", tags=["Sorting Algorithms"])