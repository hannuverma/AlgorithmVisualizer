from fastapi import APIRouter, HTTPException, status
from app.schemas.trees import TreeRequest, TreeResponse
from app.engine.tree_engine import TreeEngine
router = APIRouter()


@router.post("/bst-insert", response_model=TreeResponse, status_code=status.HTTP_200_OK)
def run_bst_insert(payload: TreeRequest):
    try:
        timeline = TreeEngine.bst_insertion_pipeline(payload.values)
        return TreeResponse(
            algorithm="bst_insert",
            total_steps=len(timeline),
            timeline=timeline
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred executing the algorithm engine: {str(e)}"
        )
    