
from pydantic import BaseModel, Field
from typing import List, Optional

class GraphNodeSnapshot(BaseModel):

    id: str = Field(..., description="Unique identifier for the node, e.g., 'A'")
    x: float = Field(..., description="X coordinate in 3D space")
    y: float = Field(..., description="Y coordinate in 3D space")
    z: float = Field(default=0.0, description="Z coordinate in 3D space")
    value: Optional[int] = Field(default=None, description="Node value")


class GraphEdgeSnapshot(BaseModel):

    id: str = Field(..., description="Unique edge identifier, e.g., 'edge_A_B'")
    source: str = Field(..., description="The ID of the origin vertex node")
    target: str = Field(..., description="The ID of the destination vertex node")
    weight: float = Field(default=1.0, description="Cost traversal weight of this link path")

class GraphStep(BaseModel):

    nodes: List[GraphNodeSnapshot] = Field(..., description="All vertices present on the canvas")
    edges: List[GraphEdgeSnapshot] = Field(..., description="All structural edges present on the canvas")
    highlighted_nodes: List[str] = Field(default_factory=list, description="Nodes currently inside the processing queue frontier")
    visited_nodes: List[str] = Field(default_factory=list, description="Nodes that have been completely evaluated and closed out")
    path_edges: List[str] = Field(default_factory=list, description="Edge IDs that are part of the actively calculated shortest path")
    action_description: str = Field(..., description="Terminal log entry string describing the execution snapshot frame")

class GraphPathRequest(BaseModel):

    nodes: List[GraphNodeSnapshot]
    edges: List[GraphEdgeSnapshot]
    start_node_id: str
    end_node_id: Optional[str] = None

class GraphPathResponse(BaseModel):

    algorithm: str
    timeline: List[GraphStep]
    total_steps: int
    shortest_path_cost: Optional[float] = None
    final_path: Optional[List[str]] = None
    
class GraphGenerationRequest(BaseModel):
    num_nodes: int = Field(default=10, ge=3, le=50)
    edge_probability: float = Field(default=0.3, ge=0.0, le=1.0)
    width: float = Field(default=800.0)
    height: float = Field(default=600.0)
    depth: float = Field(default=600.0)

class GraphGenerationResponse(BaseModel):
    timeline: List[GraphStep]
    total_steps: int