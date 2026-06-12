from fastapi import APIRouter, HTTPException
from app.schemas.mazes import MazeGenerationRequest, MazeGenerationResponse, MazePathRequest, MazePathResponse
from app.engine.maze_engine import MazeEngine

router = APIRouter()

@router.post("/generate", response_model=MazeGenerationResponse)
def generate_maze(payload: MazeGenerationRequest):
    timeline = MazeEngine.generate_maze(rows=payload.rows, cols=payload.cols)
    return MazeGenerationResponse(
        timeline=timeline,
        total_steps=len(timeline)
    )

@router.post("/path/{algorithm}", response_model=MazePathResponse)
def solve_maze(algorithm: str, payload: MazePathRequest):
    if algorithm == "bfs":
        timeline, found, cost = MazeEngine.bfs(payload.grid, payload.start_r, payload.start_c, payload.end_r, payload.end_c)
    elif algorithm == "dfs":
        timeline, found, cost = MazeEngine.dfs(payload.grid, payload.start_r, payload.start_c, payload.end_r, payload.end_c)
    elif algorithm == "dijkstra":
        timeline, found, cost = MazeEngine.dijkstra(payload.grid, payload.start_r, payload.start_c, payload.end_r, payload.end_c)
    elif algorithm == "astar":
        timeline, found, cost = MazeEngine.astar(payload.grid, payload.start_r, payload.start_c, payload.end_r, payload.end_c)
    else:
        raise HTTPException(status_code=400, detail="Unknown algorithm")
        
    return MazePathResponse(
        algorithm=algorithm,
        timeline=timeline,
        total_steps=len(timeline),
        path_found=found,
        path_cost=cost
    )
