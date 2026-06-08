from pydantic import BaseModel, Field
from typing import List, Optional

class SortingStep(BaseModel):

    array: List[int] = Field(..., description="The current state of the array at this step")
    highlighted_indices: List[int] = Field(default_factory=list, description="Indices currently being processed")
    swapped_indices: List[int] = Field(default_factory=list, description="Indices that were just swapped")
    active_range: Optional[List[int]] = Field(default=None, description="The [start, end] indices of the active subarray")
    depths: Optional[List[int]] = Field(default=None, description="The recursion depth for each element")
    sorted_indices: Optional[List[int]] = Field(default=None, description="Indices that are in their final sorted position")
    action_description: str = Field(..., description="Description of the operation performed")
    number_array: Optional[List[int]] = Field(default=None, description="Auxiliary data for Counting Sort")
    sorted_array: Optional[List[int]] = Field(default=None, description="Sorted array for counting sort")

class SortingRequest(BaseModel):

    array: List[int] = Field(..., min_length=3, max_length=100, description="Array of integers to sort")


class SortingResponse(BaseModel):
    algorithm: str
    total_steps: int
    timeline: List[SortingStep]