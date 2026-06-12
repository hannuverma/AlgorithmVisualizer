from fastapi import APIRouter
from app.api import sorting
from app.api import tree
from app.api import graphs
from app.api import mazes

api_router = APIRouter()

api_router.include_router(sorting.router, prefix="/sorting", tags=["Sorting Algorithms"])
api_router.include_router(tree.router, prefix="/tree", tags=["Tree Algorithms"])
api_router.include_router(graphs.router, prefix="/graphs", tags=["Graph Algorithms"])
api_router.include_router(mazes.router, prefix="/mazes", tags=["Maze Algorithms"])