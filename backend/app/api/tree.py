from fastapi import APIRouter, HTTPException, status
from app.schemas.trees import TreeRequest, TreeResponse
from app.engine.tree_engine import TreeEngine
router = APIRouter()


@router.post("/{tree_type}-{action}", response_model=TreeResponse, status_code=status.HTTP_200_OK)
def run_tree_operation(tree_type: str, action: str, payload: TreeRequest):
    try:
        # Currently we only have TreeEngine for BSTs
        # When you add AVL/RBT, you can map tree_type to different engines here
        if tree_type == "bst":
            engine = TreeEngine
        else:
            raise ValueError(f"Unsupported tree type: {tree_type}")

        if action == "insert":
            timeline = engine.bst_insertion_pipeline(payload.values)
        elif action == "search":
            timeline = engine.bst_search(payload.values, payload.target_value)
        elif action == "inorder":
            timeline = engine.inorder_traversal(payload.values)
        elif action == "preorder":
            timeline = engine.preorder_traversal(payload.values)
        elif action == "postorder":
            timeline = engine.postorder_traversal(payload.values)
        elif action == "levelorder":
            timeline = engine.level_order_traversal(payload.values)
        else:
            raise ValueError(f"Unsupported tree action: {action}")

        return TreeResponse(
            algorithm=f"{tree_type}_{action}",
            total_steps=len(timeline),
            timeline=timeline
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred executing the algorithm engine: {str(e)}"
        )

