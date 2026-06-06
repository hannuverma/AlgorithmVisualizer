from fastapi import APIRouter, HTTPException, status
from app.schemas.sorting import SortingRequest, SortingResponse
from app.engine.sorting_engine import SortingEngine
router = APIRouter()

@router.post("/bubble-sort", response_model=SortingResponse, status_code=status.HTTP_200_OK)
async def run_bubble_sort(payload: SortingRequest):
    try:
        timeline = SortingEngine.bubble_sort(payload.array)
        return SortingResponse(
            algorithm="bubble_sort",
            total_steps=len(timeline),
            timeline=timeline
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred executing the algorithm engine: {str(e)}"
        )

@router.post("/insertion-sort", response_model=SortingResponse, status_code=status.HTTP_200_OK)
async def run_insertion_sort(payload: SortingRequest):
    try:
        timeline = SortingEngine.insertion_sort(payload.array)
        return SortingResponse(
            algorithm="insertion_sort",
            total_steps=len(timeline),
            timeline=timeline
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred executing the algorithm engine: {str(e)}"
        )

@router.post("/quick-sort", response_model=SortingResponse, status_code=status.HTTP_200_OK)
def run_quick_sort(payload: SortingRequest):
    try:
        timeline = SortingEngine.quick_sort(payload.array)
        return SortingResponse(
            algorithm="quick_sort",
            total_steps=len(timeline),
            timeline=timeline
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred executing the algorithm engine: {str(e)}"
        )

@router.post("/selection-sort", response_model=SortingResponse, status_code=status.HTTP_200_OK)
def run_selection_sort(payload: SortingRequest):
    try:
        timeline = SortingEngine.selection_sort(payload.array)
        return SortingResponse(
            algorithm="selection_sort",
            total_steps=len(timeline),
            timeline=timeline
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred executing the algorithm engine: {str(e)}"
        )