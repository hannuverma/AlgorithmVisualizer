from pydantic import BaseModel, Field
from typing import List, Optional

class SortingStep(BaseModel):

    array: List[int] = Field(..., description="The current state of the array at this step")
    highlighted_indices: List[int] = Field(default_factory=list, description="Indices currently being processed")
    swapped_indices: List[int] = Field(default_factory=list, description="Indices that were just swapped")
    action_description: str = Field(..., description="Description of the operation performed")

class SortingRequest(BaseModel):

    array: List[int] = Field(..., min_length=3, max_length=100, description="Array of integers to sort")


class SortingResponse(BaseModel):
    algorithm: str
    total_steps: int
    timeline: List[SortingStep]