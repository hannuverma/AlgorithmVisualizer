from fastapi import APIRouter
from app.api import sorting
from app.api import tree
api_router = APIRouter()

api_router.include_router(sorting.router, prefix="/sorting", tags=["Sorting Algorithms"])
api_router.include_router(tree.router, prefix="/tree", tags=["Tree Algorithms"])