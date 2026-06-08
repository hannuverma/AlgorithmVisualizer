from _pytest import doctest
from pydantic import BaseModel, Field
from typing import List, Optional


class TreeNodeSnapshot(BaseModel):
    
    id: str = Field(..., description="Unique identifier for the node")
    value: int = Field(..., description="The value of the node")
    height: int = Field(..., description="The height of the node")
    left: Optional["TreeNodeSnapshot"] = Field(None, description="Left child node snapshot")
    right: Optional["TreeNodeSnapshot"] = Field(None, description="Right child node snapshot")
    balance_factor: int = Field(0, description="Balance factor of the node")
    x: int = Field(..., description="X-coordinate of the node")
    y: int = Field(..., description="Y-coordinate of the node")
    parent_id: Optional[str] = Field(None, description="ID of the parent node")
    is_root : bool = Field(False, description="Whether the node is the root")

class TreeStep(BaseModel):

    nodes: List[TreeNodeSnapshot] = Field(..., description="List of node snapshots in the current tree state")
    highlighted_noes: List[TreeNodeSnapshot] = Field(..., description="List of all the highlighted nodes")
    mutated_nodes: List[str] = Field(default_factory=list, description="Nodes actively being modified, inserted, or rebalanced")
    action_description: str = Field(..., description="Description of the current action")



class TreeRequest(BaseModel):

    values: List[int] = Field(..., min_items=1, max_items=30, description="Sequence of integers to operate on")\

class TreeResponse(BaseModel):

    algorithm: str
    total_steps: int
    timeline: List[TreeStep]