from typing import List
from app.schemas.sorting import SortingStep

class SortingEngine:

    @staticmethod
    def bubble_sort(initial_array: List[int]) -> List[SortingStep]:

        timeline: List[SortingStep] = []
        arr = initial_array
        n = len(arr)

        timeline.append(
            SortingStep(
                array = arr.copy(),
                highlighted_indices=[],
                swapped_indices=[],
                action_description="Initialized unsorted array. Preparing to start Bubble Sort."
                )
        )

        for i in range(n):
            swapped = False

            for j in range(0, n - i -1):
                timeline.append(
                    SortingStep(
                        array = arr.copy(),
                        highlighted_indices=[j, j+1],
                        swapped_indices=[],
                        action_description=f"Comparing elements at index {j} ({arr[j]}) and index {j+1} ({arr[j+1]})"
                    )
                )

                if arr[j] > arr[j + 1]:
                    arr[j], arr[j + 1] = arr[j + 1], arr[j]
                    swapped = True

                    timeline.append(
                        SortingStep(
                            array=arr.copy(),
                            highlighted_indices=[j, j + 1],
                            swapped_indices=[j, j + 1],
                            action_description=f"Swapped {arr[j]} and {arr[j+1]} because {arr[j]} > {arr[j+1]}"
                        )
                    )
            
            if not swapped:
                break

        
        timeline.append(
            SortingStep(
                array = arr.copy(),
                highlighted_indices=[],
                swapped_indices=[],
                action_description="Bubble sort complete."
            )
        )

        return timeline

    @staticmethod
    def insertion_sort(initial_array: List[int]) -> List[SortingStep]:
        
        timeline: List[SortingStep] = []
        arr = initial_array.copy()
        n = len(arr)

        timeline.append(
            SortingStep(
                array=arr.copy(),
                highlighted_indices=[],
                swapped_indices=[],
                action_description="Initialized unsorted array. Preparing to start Insertion Sort."
            )
        )

        for i in range(1,n):
            key = arr[i]

            j = i - 1

            timeline.append(
                SortingStep(
                    array=arr.copy(),
                    highlighted_indices=[i,j],
                    swapped_indices=[],
                    action_description=f"Picked key element {key} at index {i} to find its correct position."
                )
            )

            while j >= 0 and arr[j] > key:

                timeline.append(
                    SortingStep(
                        array=arr.copy(),
                        highlighted_indices=[j, j + 1],
                        swapped_indices=[],
                        action_description=f"Comparing key {key} with {arr[j]} at index {j}. Shifting {arr[j]} right."
                    )
                )
                
                arr[j + 1] = arr[j]
                
                timeline.append(
                    SortingStep(
                        array=arr.copy(),
                        highlighted_indices=[j, j + 1],
                        swapped_indices=[j, j + 1],
                        action_description=f"Shifted element at index {j} to index {j+1}."
                    )
                )
                j -= 1
                
            arr[j + 1] = key
            
            timeline.append(
                SortingStep(
                    array=arr.copy(),
                    highlighted_indices=[j + 1],
                    swapped_indices=[],
                    action_description=f"Placed key element {key} back into its correct position at index {j + 1}."
                )
            )
            
        timeline.append(
            SortingStep(
                array=arr.copy(),
                highlighted_indices=[],
                swapped_indices=[],
                action_description="Algorithm finished. Array is completely sorted."
            )
        )
        
        return timeline