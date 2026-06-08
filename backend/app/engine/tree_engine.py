from ctypes.wintypes import HICON
from typing import List, Optional
from app.schemas.trees import TreeStep, TreeNodeSnapshot

class BSTNode:
    def __init__(self, node_id:str, value:int):
        self.value = value
        self.id = node_id
        self.left: Optional[BSTNode] = None
        self.right: Optional[BSTNode] = None


class TreeEngine:

    @classmethod
    def bst_insertion_pipeline(cls, values:List[int])-> List[TreeStep]:
        

        timeline: List[TreeStep] = []
        root: Optional[BSTNode] = None

        if not values:
            return []

        values_count = {}

        def calculate_coordinates(node:Optional[BSTNode], depth:int, counter:list, parent_id:Optional[str] = None) -> List[TreeNodeSnapshot]:
            if not node:
                return []

            snapshots = []

            snapshots.extend(calculate_coordinates(node.left, depth + 1, counter, node.id))

            x_pos = counter[0]*50
            y_pos = depth*60
            counter[0] += 1 #we used a list because its mutable (like using static in c++)
            is_leaf = node.left is None and node.right is None
            snapshots.append(
                TreeNodeSnapshot(
                    id = node.id,
                    value = node.value,
                    x=x_pos,
                    y=y_pos,
                    parent_id=parent_id,
                    height = depth,
                    is_leaf=is_leaf
                )
            )

            snapshots.extend(calculate_coordinates(node.right, depth + 1, counter, node.id))

            return snapshots
        
        def get_current_layout() -> List[TreeNodeSnapshot]:
            horizontal_counter =[0]
            return calculate_coordinates(root, depth = 1, counter=horizontal_counter)

        for val in values:

            occurrence = values_count.get(val, 0)
            values_count[val] = occurrence + 1

            unique_id = f"{val}_{occurrence}"

            new_node = BSTNode(node_id = unique_id, value = val)

            if root is None:
                root = new_node

                timeline.append(
                    TreeStep(
                        nodes = get_current_layout(),
                        highlighted_nodes=[],
                        mutated_nodes=[],
                        action_description=f"Tree root unallocated. Created root node with value {val}."
                    )
                )
                continue

            current = root
            inserted = False

            while not inserted:

                timeline.append(
                    TreeStep(
                        nodes = get_current_layout(),
                        highlighted_nodes=[current.id],
                        mutated_nodes=[],
                        action_description=f"Comparing insert key {val} against current node {current.value}."
                    )
                )
                if val < current.value:
                    if current.left is None:
                        current.left = new_node
                        inserted = True
                        timeline.append(
                            TreeStep(
                                nodes = get_current_layout(),
                                highlighted_nodes=[current.id, new_node.id],
                                mutated_nodes=[new_node.id],
                                action_description=f"Created left child node with value {val}."
                            )
                        )

                    else :
                         current = current.left

                else:
                    if current.right is None:
                        current.right = new_node
                        inserted = True

                        timeline.append(
                            TreeStep(
                                nodes = get_current_layout(),
                                highlighted_nodes=[current.id, new_node.id],
                                mutated_nodes=[new_node.id],
                                action_description=f"Created right child node with value {val}."
                            )
                        )

                    else:
                        current = current.right
        timeline.append(
            TreeStep(
                nodes=get_current_layout(),
                highlighted_nodes=[],
                mutated_nodes=[],
                action_description=f"Insertion completed."
            )
        )

        return timeline


            



        


