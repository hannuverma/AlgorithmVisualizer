from collections import deque
from pydantic import functional_validators
from operator import truediv
from typing import List, Optional
from app.schemas.trees import TreeStep, TreeNodeSnapshot

class BSTNode:
    def __init__(self, value: int, node_id: str):
        self.value = value
        self.id = node_id
        self.left: Optional[BSTNode] = None
        self.right: Optional[BSTNode] = None


class TreeEngine:

    @classmethod
    def _build_tree(cls, values: List[int]) -> Optional[BSTNode]:

        if not values:
            return None

        root: Optional[BSTNode] = None

        value_count = {}

        for val in values:
            occurrence = value_count.get(val, 0)
            value_count[val] = occurrence + 1

            node_id = f"{val}_{occurrence}"
            new_node = BSTNode(val, node_id)

            if root is None:
                root = new_node
                continue
            
            current = root

            while True:
                if val < current.value:
                    if current.left is None:
                        current.left = new_node
                        break
                    current = current.left
                else:
                    if current.right is None:
                        current.right = new_node
                        break
                    current = current.right
        
        return root

    @classmethod
    def _calculate_coordinates(cls, node: Optional[BSTNode], depth: int, counter: list, parent_id: Optional[str] = None) -> List[TreeNodeSnapshot]:             
        if node is None:
            return []
        
        snapshots = []

        snapshots.extend(cls._calculate_coordinates(node.left, depth + 1, counter, node.id))

        x_pos = counter[0] * 50
        y_pos = depth * 60

        counter[0] += 1

        is_leaf = node.left is None and node.right is None

        snapshots.append(
            TreeNodeSnapshot(
                id=node.id,
                value=node.value,
                x=x_pos,
                y=y_pos,
                height=depth,
                is_leaf=is_leaf,
                parent_id=parent_id
            )
        )

        snapshots.extend(cls._calculate_coordinates(node.right, depth + 1, counter, node.id))

        return snapshots

    @classmethod
    def _get_layout(cls, root: Optional[BSTNode]) -> List[TreeNodeSnapshot]:
        if root is None:
            return []
        
        return cls._calculate_coordinates(root, depth=1, counter=[0])

    @classmethod
    def bst_insertion_pipeline(cls, values: List[int]) -> List[TreeStep]:

        timeline: List[TreeStep] =[]
        root: Optional[BSTNode] = None

        if not values:
            return []

        value_count = {}

        for val in values:
            occurrence = value_count.get(val, 0)
            value_count[val] = occurrence + 1

            node_id = f"{val}_{occurrence}"
            new_node = BSTNode(val, node_id)

            if root is None:
                root = new_node
                timeline.append(
                    TreeStep(
                        nodes=cls._get_layout(root),
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
                        nodes=cls._get_layout(root),
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
                                nodes = cls._get_layout(root),
                                highlighted_nodes=[current.id, new_node.id],
                                mutated_nodes=[new_node.id],
                                action_description=f"Created left child node with value {val}."
                            )
                        )
                    else:
                        current = current.left
                    
                else:
                    if current.right is None:
                        current.right = new_node
                        inserted = True
                        timeline.append(
                            TreeStep(
                                nodes=cls._get_layout(root),
                                highlighted_nodes=[current.id, new_node.id],
                                mutated_nodes=[new_node.id],
                                action_description=f"Created right child node with value {val}."
                            )
                        )
                        
                    else:
                        current = current.right
        timeline.append(
            TreeStep(
                nodes=cls._get_layout(root),
                highlighted_nodes=[],
                mutated_nodes=[],
                action_description="Insertion completed."
            )
        )

        return timeline

    @classmethod
    def bst_search(cls, values: List[int], target: int) ->List[TreeStep]:

        if not values:
            return []

        timeline: List[TreeStep] = []
        root = cls._build_tree(values)
        static_nodes = cls._get_layout(root)
        current = root
        timeline.append(
            TreeStep(
                nodes=static_nodes,
                highlighted_nodes=[],
                mutated_nodes=[],
                action_description=f"Starting search for value {target}."
            )
        )

        visited_path = []

        while current is not None:


            visited_path.append(current.id)
            timeline.append(
                TreeStep(
                    nodes=static_nodes,
                    highlighted_nodes=list(visited_path),
                    mutated_nodes=[],
                    action_description=f"Comparing search key {target} against current node {current.value}."
                )
            )
            if current.value == target:
                timeline.append(
                    TreeStep(
                        nodes=static_nodes,
                        highlighted_nodes=list(visited_path),
                        mutated_nodes=[current.id],
                        action_description=f"Success! Found target node with value {current.value}."
                    )
                )
                break

            elif current.value > target:
                timeline.append(
                    TreeStep(
                        nodes=static_nodes,
                        highlighted_nodes=list(visited_path),
                        mutated_nodes=[],
                        action_description=f"Target {target} < {current.value}. Moving to LEFT child."
                    )
                )
                current = current.left

            else:
                timeline.append(
                    TreeStep(
                        nodes=static_nodes,
                        highlighted_nodes=list(visited_path),
                        mutated_nodes=[],
                        action_description=f"Target {target} > {current.value}. Moving to RIGHT child."
                    )
                )
                current = current.right

        if current is None:
            timeline.append(
                TreeStep(
                    nodes=static_nodes,
                    highlighted_nodes=list(visited_path),
                    mutated_nodes=[],
                    action_description=f"Reached empty leaf. Target {target} not found in the tree."
                )
            )
        return timeline

    @classmethod
    def inorder_traversal(cls, values: List[int]) -> List[TreeStep]:

        if not values:
            return []
        timeline: List[TreeStep] = []

        root = cls._build_tree(values)
        static_nodes = cls._get_layout(root)

        visited_sequence : List[str] = []

        def traverse(node : Optional[BSTNode] = None):

            if not node:
                return

            timeline.append(
                TreeStep(
                    nodes=static_nodes,
                    highlighted_nodes=[node.id],
                    mutated_nodes=[],
                    visited_sequence=list(visited_sequence),
                    action_description=f"In-order lookup on {node.value}. Exploring its LEFT subtree next."
                )
            )

            traverse(node.left)

            visited_sequence.append(node.id)
            timeline.append(
                TreeStep(
                    nodes=static_nodes,
                    highlighted_nodes=[node.id],
                    mutated_nodes=[node.id], # Flash node active to symbolize printing event
                    visited_sequence=list(visited_sequence),
                    action_description=f"Processing node key {node.value}. Added to output path history sequence."
                )
            )

            timeline.append(
                TreeStep(
                    nodes=static_nodes,
                    highlighted_nodes=[node.id],
                    mutated_nodes=[],
                    visited_sequence=list(visited_sequence),
                    action_description=f"Finished exploring left side of {node.value}. Moving to its RIGHT subtree next."
                )
            )

            traverse(node.right)

        traverse(root)

        timeline.append(
            TreeStep(
                nodes=static_nodes,
                highlighted_nodes=[],
                mutated_nodes=[],
                visited_sequence=list(visited_sequence),
                action_description=f"In-Order Traversal completed. Complete path route sequence generated."
            )
        )
        return timeline

    @classmethod
    def preorder_traversal(cls, values: List[int]) -> List[TreeStep]:
        if not values:
            return []
        timeline: List[TreeStep] = []
        root = cls._build_tree(values)
        static_nodes = cls._get_layout(root)
        visited_sequence: List[str] = []

        def traverse(node: Optional[BSTNode] = None):
            if not node:
                return

            visited_sequence.append(node.id)
            timeline.append(
                TreeStep(
                    nodes=static_nodes,
                    highlighted_nodes=[node.id],
                    mutated_nodes=[node.id],
                    visited_sequence=list(visited_sequence),
                    action_description=f"Processing node key {node.value}. Added to output path history sequence."
                )
            )

            timeline.append(
                TreeStep(
                    nodes=static_nodes,
                    highlighted_nodes=[node.id],
                    mutated_nodes=[],
                    visited_sequence=list(visited_sequence),
                    action_description=f"Exploring LEFT subtree of {node.value}."
                )
            )
            traverse(node.left)

            timeline.append(
                TreeStep(
                    nodes=static_nodes,
                    highlighted_nodes=[node.id],
                    mutated_nodes=[],
                    visited_sequence=list(visited_sequence),
                    action_description=f"Exploring RIGHT subtree of {node.value}."
                )
            )
            traverse(node.right)

        traverse(root)

        timeline.append(
            TreeStep(
                nodes=static_nodes,
                highlighted_nodes=[],
                mutated_nodes=[],
                visited_sequence=list(visited_sequence),
                action_description=f"Pre-Order Traversal completed. Complete path route sequence generated."
            )
        )
        return timeline

    @classmethod
    def postorder_traversal(cls, values: List[int]) -> List[TreeStep]:
        if not values:
            return []
        timeline: List[TreeStep] = []
        root = cls._build_tree(values)
        static_nodes = cls._get_layout(root)
        visited_sequence: List[str] = []

        def traverse(node: Optional[BSTNode] = None):
            if not node:
                return

            timeline.append(
                TreeStep(
                    nodes=static_nodes,
                    highlighted_nodes=[node.id],
                    mutated_nodes=[],
                    visited_sequence=list(visited_sequence),
                    action_description=f"Post-order lookup on {node.value}. Exploring LEFT subtree first."
                )
            )
            traverse(node.left)

            timeline.append(
                TreeStep(
                    nodes=static_nodes,
                    highlighted_nodes=[node.id],
                    mutated_nodes=[],
                    visited_sequence=list(visited_sequence),
                    action_description=f"Finished exploring left side of {node.value}. Exploring RIGHT subtree."
                )
            )
            traverse(node.right)

            visited_sequence.append(node.id)
            timeline.append(
                TreeStep(
                    nodes=static_nodes,
                    highlighted_nodes=[node.id],
                    mutated_nodes=[node.id],
                    visited_sequence=list(visited_sequence),
                    action_description=f"Both subtrees of {node.value} processed. Added to output path history sequence."
                )
            )

        traverse(root)

        timeline.append(
            TreeStep(
                nodes=static_nodes,
                highlighted_nodes=[],
                mutated_nodes=[],
                visited_sequence=list(visited_sequence),
                action_description=f"Post-Order Traversal completed. Complete path route sequence generated."
            )
        )
        return timeline


    @classmethod
    def level_order_traversal(cls, values: List[int]) -> List[TreeStep]:
        if not values:
            return []
        
        timeline: List[TreeStep] = []
        root = cls._build_tree(values)
        static_nodes = cls._get_layout(root)
        
        # FIX 1: Track actual integer node values printed, not TreeSteps
        visited_sequence: List[str] = []

        if not root:
            return timeline

        # FIX 2: Initialize standard Python collections deque container
        queue = deque([root])

        # Walk layer by layer
        while queue:
            # The number of elements currently in the queue is EXACTLY the size of this row level
            level_size = len(queue)
            
            timeline.append(
                TreeStep(
                    nodes=static_nodes,
                    highlighted_nodes=[n.id for n in queue],  # Highlight the entire current horizontal row layer
                    mutated_nodes=[],
                    visited_sequence=list(visited_sequence),
                    action_description=f"Approaching new tree layer. Level contains {level_size} frontier nodes."
                )
            )

            # Process all nodes belonging exclusively to the current level depth
            for _ in range(level_size):
                # FIX 3: Use idiomatic Python deque extraction popleft()
                node = queue.popleft()

                # Process/Print node item value updates
                visited_sequence.append(node.id)
                
                timeline.append(
                    TreeStep(
                        nodes=static_nodes,
                        highlighted_nodes=[node.id],
                        mutated_nodes=[node.id],  # Flash active node green/rose to show evaluation
                        visited_sequence=list(visited_sequence),
                        action_description=f"Processing node layer key {node.value}. Added to level output string stream."
                    )
                )

                # Add children to back of queue frontier for the NEXT row pass level down
                if node.left is not None:
                    queue.append(node.left)
                if node.right is not None:
                    queue.append(node.right)

            # Level completion check logic
            if queue:
                timeline.append(
                    TreeStep(
                        nodes=static_nodes,
                        highlighted_nodes=[],
                        mutated_nodes=[],
                        visited_sequence=list(visited_sequence),
                        action_description="Reached end of layer level block row. Shifting down to next depth tier."
                    )
                )

        # Final wrap up completion state trace frame
        timeline.append(
            TreeStep(
                nodes=static_nodes,
                highlighted_nodes=[],
                mutated_nodes=[],
                visited_sequence=list(visited_sequence),
                action_description="Level-Order Traversal completed. Complete path route sequence generated."
            )
        )

        return timeline

    @classmethod
    def min_value(cls, node: Optional[BSTNode] = None):
        if not node:
            return None

        while node.left is not None:
            node = node.left
        return node


    @classmethod
    def delete_bst_node(cls, values: List[int], target_id: str) -> List[TreeStep]:

        if not values:
            return []
        
        timeline: List[TreeStep] = []
        root = cls._build_tree(values)
        
        search_path =[]
        def get_layout():
            return cls._get_layout(root)
        try:
            target_value = int(target_id.split("_")[0])
        except (ValueError, IndexError):
            return []


        def delete_node(node: Optional[BSTNode], id_to_find: str, val_to_search: int) -> Optional[BSTNode]:

            nonlocal root

            if node is None:
                timeline.append(
                    TreeStep(
                        nodes=get_layout(),
                        highlighted_nodes=list(search_path),
                        mutated_nodes=[],
                        action_description=f"Deletion target ID '{id_to_find}' not found in the tree structural limits."
                    )
                )
                return None

            search_path.append(node.id)

            timeline.append(
                TreeStep(
                    nodes=get_layout(),
                    highlighted_nodes=list(search_path),
                    mutated_nodes=[],
                    action_description=f"Searching for node instance. Inspecting node {node.value} (ID: {node.id})."
                )
            )
            
            if val_to_search < node.value:
                node.left = delete_node(node.left, id_to_find, val_to_search)
                return node
            elif val_to_search > node.value:
                node.right = delete_node(node.right, id_to_find, val_to_search)
                return node

            else:

                if node.id != id_to_find:
                    node.right = delete_node(node.right, id_to_find, val_to_search)
                    return node
                
                timeline.append(
                    TreeStep(
                        nodes=get_layout(),
                        highlighted_nodes=list(search_path),
                        mutated_nodes=[node.id],  # Highlight exactly the target instance node red
                        action_description=f"Target element matched on unique instance ID '{node.id}'. Executing deletion structural routines."
                    )
                )

                if node.left is None:
                    action_text = (
                        f"Node {node.value} is a leaf node. Severing parent pointer reference."
                        if node.right is None else
                        f"Node {node.value} has a single right child subtree. Advancing subtree up to parent branch link."
                    ) 
                    timeline.append(
                        TreeStep(
                            nodes=get_layout(),
                            highlighted_nodes=list(search_path),
                            mutated_nodes=[node.id],
                            action_description=action_text
                        )
                    )

                    return node.right

                elif node.right is None:
                    timeline.append(
                        TreeStep(
                            nodes=get_layout(),
                            highlighted_nodes=list(search_path),
                            mutated_nodes=[node.id],
                            action_description=f"Node {node.value} has a single left child subtree. Advancing subtree up to parent branch link."
                        )
                    )

                    return node.left

                else:
                    timeline.append(
                        TreeStep(
                            nodes=get_layout(),
                            highlighted_nodes=list(search_path),
                            mutated_nodes=[node.id],
                            action_description=f"Node has two child vectors. Tracking In-Order Successor (smallest node in right branch)."
                        )
                    )

                    successor = node.right
                    successor_path = [node.id]

                    while successor.left is not None:
                        successor = successor.left
                        successor_path.append(successor.id)

                        timeline.append(
                            TreeStep(
                                nodes=get_layout(),
                                highlighted_nodes=list(search_path) + successor_path,
                                mutated_nodes=[],
                                action_description=f"Crawling left to find successor boundary. Checking node {successor.value}."
                            )
                        )
                    timeline.append(
                        TreeStep(
                            nodes=get_layout(),
                            highlighted_nodes=list(search_path) + [successor.id],
                            mutated_nodes=[node.id, successor.id],
                            action_description=f"Successor instance identified: Node {successor.value} (ID: {successor.id}). Copying values across."
                        )
                    )
                    node.value = successor.value
                    node.id = f"{successor.value}_swapped"
                    timeline.append(
                        TreeStep(
                            nodes=get_layout(),
                            highlighted_nodes=[node.id],
                            mutated_nodes=[node.id],
                            action_description=f"Value replicated. Recursively slicing out duplicated successor identity node from right child tree path."
                        )
                    )

                    node.right = delete_node(node.right, successor.id, successor.value)
                    return node


        root = delete_node(root, target_id, target_value)

        timeline.append(
            TreeStep(
                nodes=get_layout(),
                highlighted_nodes=[],
                mutated_nodes=[],
                action_description=f"Deletion complete. Node '{target_id}' has been removed from the tree."
            )
        )
        return timeline

                    


            
        
            
            

            



        
