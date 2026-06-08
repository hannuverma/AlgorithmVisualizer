from typing_inspection import introspection
import pytest
from app.engine.sorting_engine import SortingEngine

UNSORTED_CASES = [
    ([5, 2, 9, 1, 5, 6], [1, 2, 5, 5, 6, 9]),  # Standard duplicate case
    ([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]),        # Best case (already sorted)
    ([5, 4, 3, 2, 1], [1, 2, 3, 4, 5]),        # Worst case (reverse sorted)
    ([42], [42]),                              # Edge case: Single element
    ([], []),                                  # Edge case: Empty array
]


@pytest.mark.parametrize("sort_function",[
    SortingEngine.bubble_sort,
    SortingEngine.selection_sort,
    SortingEngine.quick_sort,
    SortingEngine.insertion_sort
])

@pytest.mark.parametrize("input_array, expected_sorted", UNSORTED_CASES)
def test_sorting_algorithms_functional_integrity(sort_function, input_array, expected_sorted):

    if len(input_array) == 0:
        timeline = sort_function(input_array)
        assert len(timeline) <= 2
        return

    timeline = sort_function(input_array)
    final_stop = timeline[-1]

    assert final_stop.array == expected_sorted      

    assert len(timeline) > 0

    for step in timeline:
        assert len(step.array) == len(input_array)
        assert isinstance(step.action_description, str)