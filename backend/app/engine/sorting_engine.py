from typing import List
from app.schemas.sorting import SortingStep

class SortingEngine:

    @staticmethod
    def bubble_sort(initial_array: List[int]) -> List[SortingStep]:

        timeline: List[SortingStep] = []
        arr = initial_array
        n = len(arr)

        sorted_indices = []

        timeline.append(
            SortingStep(
                array = arr.copy(),
                highlighted_indices=[],
                swapped_indices=[],
                sorted_indices=sorted_indices.copy(),
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
                        sorted_indices=sorted_indices.copy(),
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
                            sorted_indices=sorted_indices.copy(),
                            action_description=f"Swapped {arr[j]} and {arr[j+1]} because {arr[j]} > {arr[j+1]}"
                        )
                    )

                
            sorted_indices.append(n - i - 1)

            
            if not swapped:
                break

        
        timeline.append(
            SortingStep(
                array = arr.copy(),
                highlighted_indices=[],
                swapped_indices=[],
                sorted_indices=sorted_indices.copy(),
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

    @staticmethod
    def quick_sort(initial_array: List[int]) -> List[SortingStep]:

        timeline:List[SortingStep] = []
        arr = initial_array.copy()
        n = len(arr)
        
        depths = [0] * n
        sorted_indices = []

        def append_step(highlighted, swapped, active_range, action):
            timeline.append(
                SortingStep(
                    array=arr.copy(),
                    highlighted_indices=highlighted,
                    swapped_indices=swapped,
                    active_range=active_range,
                    depths=depths.copy(),
                    sorted_indices=sorted_indices.copy(),
                    action_description=action
                )
            )

        def partition(low:int, high:int) ->int:
            pivot = arr[high]
            i = low - 1

            for j in range(low,high):

                append_step([i, j, high], [], [low, high], f"Comparing pivot {pivot} with {arr[j]} at index {j}. Shifting {arr[j]} right.")

                if arr[j] <= pivot:
                    i += 1
                    arr[i], arr[j] = arr[j], arr[i]

                    append_step([i, j], [i, j], [low, high], f"Swapped {arr[j]} and {arr[i]} because {arr[j]} <= {pivot}")
            
            arr[i + 1], arr[high] = arr[high], arr[i + 1]
            
            append_step([i + 1, high], [i + 1, high], [low, high], f"Placed pivot element {pivot} back into its correct position at index {i + 1}.")

            return i + 1

        def quick_sort_recursive(low:int, high:int, depth:int):
            if low < high:
                for k in range(low, high + 1):
                    if k not in sorted_indices:
                        depths[k] = depth
                        
                pi = partition(low, high)
                
                sorted_indices.append(pi)
                depths[pi] = 0
                
                append_step([pi], [], None, f"Pivot element {arr[pi]} is now in its final sorted position.")

                quick_sort_recursive(low, pi - 1, depth + 1)
                quick_sort_recursive(pi + 1, high, depth + 1)
            elif low == high:
                sorted_indices.append(low)
                depths[low] = 0
                append_step([low], [], None, f"Element {arr[low]} is trivially sorted.")

        append_step([], [], None, "Initialized unsorted array. Preparing to start Quick Sort.")

        quick_sort_recursive(0, n - 1, 1)

        append_step([], [], None, "Quick sort complete.")

        return timeline

        
    @staticmethod
    def selection_sort(initial_array: List[int]) -> List[SortingStep]:

        timeline: List[SortingStep] = []
        arr = initial_array.copy()
        n = len(arr)
        sorted_indices = []
        timeline.append(
            SortingStep(
                array = arr.copy(),
                highlighted_indices=[],
                swapped_indices=[],
                sorted_indices=[],
                action_description="Initialized unsorted array. Preparing to start selection sort."
            )
        )

        for i in range(n):
            minIndx = i

            for j in range(i + 1, n):
                timeline.append(
                    SortingStep(
                        array=arr.copy(),
                        highlighted_indices=[i,minIndx,j],
                        swapped_indices=[],
                        sorted_indices=sorted_indices.copy(),
                        action_description=f"Comparing element at index {i} with element at index {j}. If element at {j} is smaller than element at {i}, swap them."
                    )
                )
                if arr[j] < arr[minIndx]:
                    minIndx = j
                    timeline.append(
                        SortingStep(
                            array=arr.copy(),
                            highlighted_indices=[i,minIndx,j],
                            swapped_indices=[],
                            sorted_indices=sorted_indices.copy(),
                            action_description=f"Found a new minimum element at index {j}"
                        )
                    )
            
            arr[i], arr[minIndx] = arr[minIndx], arr[i]

            timeline.append(
                SortingStep(
                    array=arr.copy(),
                    highlighted_indices=[i, minIndx],
                    swapped_indices=[i, minIndx],
                    sorted_indices=sorted_indices.copy(),
                    action_description=f"Swapped element at index {i} with element at index {minIndx} because {arr[j]} < {arr[minIndx]}"
                )
            )
            sorted_indices.append(i)

        

        timeline.append(
            SortingStep(
                array=arr.copy(),
                highlighted_indices=[],
                swapped_indices=[],
                action_description="Algorithm finished. Array is completely sorted."
            )
        )

        return timeline