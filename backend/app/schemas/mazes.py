from pydantic import BaseModel, Field
from typing import List, Optional

class MazeCell(BaseModel):
    r: int = Field(..., description="Row index")
    c: int = Field(..., description="Column index")
    is_wall: bool = Field(default=False, description="True if this cell is an impassable wall")
    is_start: bool = Field(default=False, description="True if this cell is the start point")
    is_end: bool = Field(default=False, description="True if this cell is the end point")

class MazeStep(BaseModel):
    grid: List[List[MazeCell]] = Field(..., description="The full 2D grid state")
    highlighted_cells: List[str] = Field(default_factory=list, description="Array of 'r,c' strings for currently evaluating cells (frontier)")
    visited_cells: List[str] = Field(default_factory=list, description="Array of 'r,c' strings for fully visited/closed cells")
    path_cells: List[str] = Field(default_factory=list, description="Array of 'r,c' strings representing the active or final path")
    action_description: str = Field(..., description="Log description of this snapshot")

class MazeGenerationRequest(BaseModel):
    rows: int = Field(default=15, ge=5, le=51)
    cols: int = Field(default=15, ge=5, le=51)

class MazeGenerationResponse(BaseModel):
    timeline: List[MazeStep]
    total_steps: int

class MazePathRequest(BaseModel):
    grid: List[List[MazeCell]]
    start_r: int
    start_c: int
    end_r: int
    end_c: int

class MazePathResponse(BaseModel):
    algorithm: str
    timeline: List[MazeStep]
    total_steps: int
    path_found: bool
    path_cost: int
