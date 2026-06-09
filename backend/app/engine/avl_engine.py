from collections import deque
from typing import List, Optional
from app.schemas.trees import TreeStep, TreeNodeSnapshot
from app.engine.tree_engine import TreeEngine


class AVLTreeNode:
    def __init__(self, value:int, node_id:str):
        self.value = value
        self.id = node_id
        self.left:Optional[AVLTreeNode] = None
        self.right:Optional[AVLTreeNode] = None
        self.height: int = 1


class AVLEngine:

    @classmethod
    def get_height(cls, node:Optional[AVLTreeNode]) -> int:
        if not node:
            return 0
        return node.height
    
    @classmethod
    def get_balance_factor(cls, node:Optional[AVLTreeNode]) -> int:
        if not node:
            return 0
        return cls.get_height(node.left) - cls.get_height(node.right)
    
    @classmethod
    def _get_layout(cls, root: Optional[AVLTreeNode]) -> List[TreeNodeSnapshot]:
        return TreeEngine._calculate_coordinates(root, depth=1, counter=[0])

    @classmethod
    def rotate_right(cls, y:AVLTreeNode, timeline:List[TreeStep], root_container: list) -> AVLTreeNode:

        x = y.left
        T2 = x.right

        timeline.append(TreeStep(
            nodes=cls._get_layout(root_container[0]),
            highlighted_nodes=[y.id, x.id],
            mutated_nodes=[],
            action_description=f"Rotation Engine: Detaching left child {x.value} to lift it to sub-root position."
        ))

        x.right = y
        y.left = T2

        y.height = 1 + max(cls.get_height(y.left), cls.get_height(y.right))
        x.height = 1 + max(cls.get_height(x.left), cls.get_height(x.right))

        timeline.append(TreeStep(
            nodes=cls._get_layout(root_container[0]),
            highlighted_nodes=[x.id],
            mutated_nodes=[y.id, x.id],
            action_description=f"Rotation Engine: Pivot successful. Node {x.value} is now parent of {y.value}."
        ))
        return x

    @classmethod
    def rotate_left(cls, x:AVLTreeNode, timeline: List[TreeStep], root_container: list) -> AVLTreeNode:
        y = x.right
        T2 = y.left

        timeline.append(TreeStep(
            nodes=cls._get_layout(root_container[0]),
            highlighted_nodes=[y.id, x.id],
            mutated_nodes=[],
            action_description=f"Rotation Engine: Detaching right child {y.value} to lift it to sub-root position."
        ))

        y.left = x
        x.right = T2

        x.height = max(cls.get_height(x.left), cls.get_height(x.right)) + 1
        y.height = max(cls.get_height(y.left), cls.get_height(y.right)) + 1

        timeline.append(TreeStep(
            nodes=cls._get_layout(root_container[0]),
            highlighted_nodes=[y.id],
            mutated_nodes=[x.id, y.id],
            action_description=f"Rotation Engine: Pivot successful. Node {y.value} is now parent of {x.value}."
        ))
        
        return y

    @classmethod
    def _rotate_right_silent(cls, y: AVLTreeNode) -> AVLTreeNode:
        x = y.left
        T2 = x.right
        x.right = y
        y.left = T2
        y.height = 1 + max(cls.get_height(y.left), cls.get_height(y.right))
        x.height = 1 + max(cls.get_height(x.left), cls.get_height(x.right))
        return x

    @classmethod
    def _rotate_left_silent(cls, x: AVLTreeNode) -> AVLTreeNode:
        y = x.right
        T2 = y.left
        y.left = x
        x.right = T2
        x.height = 1 + max(cls.get_height(x.left), cls.get_height(x.right))
        y.height = 1 + max(cls.get_height(y.left), cls.get_height(y.right))
        return y

    @classmethod
    def _build_tree(cls, values: List[int]) -> Optional[AVLTreeNode]:
        """Silently build a balanced AVL tree (no timeline logging)."""
        if not values:
            return None

        value_count = {}
        root: Optional[AVLTreeNode] = None

        def recursive_insert(node: Optional[AVLTreeNode], key: int, unique_id: str) -> AVLTreeNode:
            if not node:
                return AVLTreeNode(value=key, node_id=unique_id)

            if key < node.value:
                node.left = recursive_insert(node.left, key, unique_id)
            else:
                node.right = recursive_insert(node.right, key, unique_id)

            node.height = 1 + max(cls.get_height(node.left), cls.get_height(node.right))
            balance = cls.get_balance_factor(node)

            if balance > 1:
                if cls.get_balance_factor(node.left) >= 0:
                    return cls._rotate_right_silent(node)
                else:
                    node.left = cls._rotate_left_silent(node.left)
                    return cls._rotate_right_silent(node)

            if balance < -1:
                if cls.get_balance_factor(node.right) <= 0:
                    return cls._rotate_left_silent(node)
                else:
                    node.right = cls._rotate_right_silent(node.right)
                    return cls._rotate_left_silent(node)

            return node

        for val in values:
            occurrence = value_count.get(val, 0)
            value_count[val] = occurrence + 1
            unique_id = f"{val}_{occurrence}"
            root = recursive_insert(root, val, unique_id)

        return root
    
    @classmethod
    def balance_node(cls, node:Optional[AVLTreeNode], timeline: List[TreeStep], root_container: list) -> AVLTreeNode:

        node.height = 1 + max(cls.get_height(node.left), cls.get_height(node.right))
        balance = cls.get_balance_factor(node)

        def capture_frame(action, target_ids=[]):
            timeline.append(TreeStep(
                nodes=cls._get_layout(root_container[0]),
                highlighted_nodes=target_ids,
                mutated_nodes=[node.id],
                action_description=action
            ))

        if balance > 1:
            if cls.get_balance_factor(node.left) >= 0:
                capture_frame(f"Imbalance detected at {node.value} (Factor: {balance}). Initiating Single Right Rotation.")
                return cls.rotate_right(node, timeline, root_container)
            else:
                capture_frame(f"Imbalance detected at {node.value} (Factor: {balance}). Initiating Double Rotation (Left-Right).")
                node.left = cls.rotate_left(node.left, timeline, root_container)
                return cls.rotate_right(node, timeline, root_container)
        
        if balance < -1:
            if cls.get_balance_factor(node.right) <= 0:
                capture_frame(f"Imbalance detected at {node.value} (Factor: {balance}). Initiating Single Left Rotation.")
                return cls.rotate_left(node, timeline, root_container)
            else:
                capture_frame(f"Imbalance detected at {node.value} (Factor: {balance}). Initiating Double Rotation (Right-Left).")
                node.right = cls.rotate_right(node.right, timeline, root_container)
                return cls.rotate_left(node, timeline, root_container)
        
        return node

    @classmethod
    def avl_insertion_pipeline(cls, values: List[int]) -> List[TreeStep]:

        timeline: List[TreeStep] = []
        root: Optional[AVLTreeNode] = None
        root_container = [None]
        value_count = {}
        
        def insert(node: Optional[AVLTreeNode], key: int, id: str) -> AVLTreeNode:

            if node is None:
                new_leaf = AVLTreeNode(key, id)

                if root_container[0] is None:
                    root_container[0] = new_leaf
                return new_leaf

            timeline.append(TreeStep(
                nodes=cls._get_layout(root_container[0]),
                highlighted_nodes=[node.id],
                mutated_nodes=[],
                action_description=f"AVL Insert: Comparing key {key} against node {node.value}."
            ))

            if key < node.value:
                node.left = insert(node.left, key, id)
            else:
                node.right = insert(node.right, key, id)

            node = cls.balance_node(node, timeline, root_container)
            return node

        for val in values:
            occurrence= value_count.get(val, 0)
            value_count[val] = occurrence + 1
            unique_id = f"{val}_{occurrence}"
            timeline.append(TreeStep(
                nodes=cls._get_layout(root_container[0]),
                highlighted_nodes=[],
                mutated_nodes=[],
                action_description=f"Injecting key {val} into the AVL compilation framework pipeline."
            ))

            root = insert(root, val, unique_id)
            root_container[0] = root
        timeline.append(TreeStep(
            nodes=cls._get_layout(root_container[0]),
            highlighted_nodes=[],
            mutated_nodes=[],
            action_description="AVL Tree generation pipeline complete. All allocations balanced successfully."
        ))
        return timeline
            
    @classmethod
    def avl_search(cls, values: List[int], target: int) ->List[TreeStep]:

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

        visited_sequence : List[TreeStep] = []

        def traverse(node : Optional[AVLTreeNode] = None):

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

            visited_sequence.append(node.value)
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
        visited_sequence: List[TreeStep] = []

        def traverse(node: Optional[AVLTreeNode] = None):
            if not node:
                return

            visited_sequence.append(node.value)
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
        visited_sequence: List[TreeStep] = []

        def traverse(node: Optional[AVLTreeNode] = None):
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

            visited_sequence.append(node.value)
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
        visited_sequence: List[int] = []

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
                visited_sequence.append(node.value)
                
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