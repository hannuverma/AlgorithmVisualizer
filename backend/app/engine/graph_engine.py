import random
import math
import collections
import heapq
from typing import List, Tuple, Dict
from app.schemas.graphs import GraphNodeSnapshot, GraphEdgeSnapshot, GraphStep

class GraphEngine:
    
    @staticmethod
    def generate_graph_timeline(num_nodes: int, edge_probability: float = 0.3, width: float = 800.0, height: float = 600.0, depth: float = 600.0) -> List[GraphStep]:
        """
        Generates a random graph in 3D space and builds an animated timeline showing
        each node and edge being added to the canvas sequentially.
        """
        nodes: List[GraphNodeSnapshot] = []
        edges: List[GraphEdgeSnapshot] = []
        timeline: List[GraphStep] = []
        
        # Step 0: Initial empty state
        timeline.append(GraphStep(
            nodes=[],
            edges=[],
            action_description=f"Initializing 3D graph generation with {num_nodes} nodes and {edge_probability} edge probability..."
        ))
        
        # Generate nodes one by one in 3D space
        half_w = width / 2
        half_h = height / 2
        half_d = depth / 2
        
        for i in range(num_nodes):
            node_id = chr(65 + i) if i < 26 else f"N{i}" # A, B, C...
            
            # Spread nodes in a 3D volume centered at origin
            x = round(random.uniform(-half_w, half_w), 2)
            y = round(random.uniform(-half_h, half_h), 2)
            z = round(random.uniform(-half_d, half_d), 2)
            
            new_node = GraphNodeSnapshot(id=node_id, x=x, y=y, z=z)
            nodes.append(new_node)
            
            timeline.append(GraphStep(
                nodes=list(nodes),
                edges=list(edges),
                highlighted_nodes=[node_id],
                action_description=f"Placed node {node_id} at ({x}, {y}, {z})"
            ))
            
        # Clear highlights before adding edges
        timeline.append(GraphStep(
            nodes=list(nodes),
            edges=list(edges),
            action_description="All nodes placed. Computing connective layout..."
        ))
            
        # Generate edges using 3D Euclidean distance for weights
        for i in range(num_nodes):
            for j in range(i + 1, num_nodes):
                if random.random() <= edge_probability:
                    source = nodes[i]
                    target = nodes[j]
                    
                    # 3D Euclidean distance
                    dx = source.x - target.x
                    dy = source.y - target.y
                    dz = source.z - target.z
                    distance = math.sqrt(dx*dx + dy*dy + dz*dz)
                    weight = round(distance / 10.0, 1)
                    
                    edge_id = f"edge_{source.id}_{target.id}"
                    new_edge = GraphEdgeSnapshot(
                        id=edge_id,
                        source=source.id,
                        target=target.id,
                        weight=max(1.0, weight)
                    )
                    edges.append(new_edge)
                    
                    timeline.append(GraphStep(
                        nodes=list(nodes),
                        edges=list(edges),
                        highlighted_nodes=[source.id, target.id],
                        action_description=f"Connected {source.id} ↔ {target.id} with weight {new_edge.weight}"
                    ))
                    
        # Ensure the graph is at least weakly connected by connecting orphans
        for i in range(1, num_nodes):
            has_edge = any(e.source == nodes[i].id or e.target == nodes[i].id for e in edges)
            if not has_edge:
                target_idx = random.randint(0, i - 1)
                source = nodes[i]
                target = nodes[target_idx]
                
                dx = source.x - target.x
                dy = source.y - target.y
                dz = source.z - target.z
                distance = math.sqrt(dx*dx + dy*dy + dz*dz)
                weight = max(1.0, round(distance / 10.0, 1))
                
                edge_id = f"edge_{source.id}_{target.id}"
                new_edge = GraphEdgeSnapshot(
                    id=edge_id,
                    source=source.id,
                    target=target.id,
                    weight=weight
                )
                edges.append(new_edge)
                
                timeline.append(GraphStep(
                    nodes=list(nodes),
                    edges=list(edges),
                    highlighted_nodes=[source.id, target.id],
                    action_description=f"Connected isolated node {source.id} to {target.id} to ensure network continuity"
                ))
                
        # Final Step
        timeline.append(GraphStep(
            nodes=list(nodes),
            edges=list(edges),
            visited_nodes=[n.id for n in nodes],
            action_description="3D graph generation sequence completed successfully."
        ))
                    
        return timeline

    @staticmethod
    def _build_adjacency_list(nodes: List[GraphNodeSnapshot], edges: List[GraphEdgeSnapshot], directed: bool = False) -> Dict[str, List[Tuple[str, float, str]]]:
        adj = collections.defaultdict(list)
        for e in edges:
            adj[e.source].append((e.target, e.weight, e.id))
            if not directed:
                adj[e.target].append((e.source, e.weight, e.id))
        return adj

    @staticmethod
    def bfs(nodes: List[GraphNodeSnapshot], edges: List[GraphEdgeSnapshot], start_node_id: str) -> List[GraphStep]:
        adj = GraphEngine._build_adjacency_list(nodes, edges)
        timeline = []
        visited = []
        queue = collections.deque([start_node_id])
        visited_set = set([start_node_id])
        path_edges = []
        
        timeline.append(GraphStep(
            nodes=nodes, edges=edges,
            highlighted_nodes=[start_node_id], visited_nodes=[], path_edges=[],
            action_description=f"Starting Breadth-First Search from node {start_node_id}"
        ))
        
        while queue:
            curr = queue.popleft()
            visited.append(curr)
            
            timeline.append(GraphStep(
                nodes=nodes, edges=edges,
                highlighted_nodes=[curr], visited_nodes=list(visited), path_edges=list(path_edges),
                action_description=f"Dequeued node {curr}. Exploring neighbors..."
            ))
            
            for neighbor, weight, edge_id in adj[curr]:
                if neighbor not in visited_set:
                    visited_set.add(neighbor)
                    queue.append(neighbor)
                    path_edges.append(edge_id)
                    
                    timeline.append(GraphStep(
                        nodes=nodes, edges=edges,
                        highlighted_nodes=[curr, neighbor], visited_nodes=list(visited), path_edges=list(path_edges),
                        action_description=f"Discovered unvisited neighbor {neighbor}. Enqueuing into frontier..."
                    ))
                    
        timeline.append(GraphStep(
            nodes=nodes, edges=edges,
            highlighted_nodes=[], visited_nodes=list(visited), path_edges=list(path_edges),
            action_description="BFS Traversal Complete."
        ))
        return timeline

    @staticmethod
    def dfs(nodes: List[GraphNodeSnapshot], edges: List[GraphEdgeSnapshot], start_node_id: str) -> List[GraphStep]:
        adj = GraphEngine._build_adjacency_list(nodes, edges)
        timeline = []
        visited = []
        visited_set = set()
        path_edges = []
        
        # Iterative DFS
        stack = [(start_node_id, None)] # (node, edge_from_parent)
        
        timeline.append(GraphStep(
            nodes=nodes, edges=edges,
            highlighted_nodes=[start_node_id], visited_nodes=[], path_edges=[],
            action_description=f"Starting Depth-First Search from node {start_node_id}"
        ))
        
        while stack:
            curr, edge_id = stack.pop()
            
            if curr not in visited_set:
                visited_set.add(curr)
                visited.append(curr)
                if edge_id:
                    path_edges.append(edge_id)
                
                timeline.append(GraphStep(
                    nodes=nodes, edges=edges,
                    highlighted_nodes=[curr], visited_nodes=list(visited), path_edges=list(path_edges),
                    action_description=f"Popped {curr} from stack. Marking as visited..."
                ))
                
                # Add neighbors to stack
                for neighbor, weight, n_edge_id in adj[curr]:
                    if neighbor not in visited_set:
                        stack.append((neighbor, n_edge_id))
                        timeline.append(GraphStep(
                            nodes=nodes, edges=edges,
                            highlighted_nodes=[curr, neighbor], visited_nodes=list(visited), path_edges=list(path_edges),
                            action_description=f"Found unvisited neighbor {neighbor}. Pushing to stack..."
                        ))
                        
        timeline.append(GraphStep(
            nodes=nodes, edges=edges,
            highlighted_nodes=[], visited_nodes=list(visited), path_edges=list(path_edges),
            action_description="DFS Traversal Complete."
        ))
        return timeline

    @staticmethod
    def dijkstra(nodes: List[GraphNodeSnapshot], edges: List[GraphEdgeSnapshot], start_node_id: str, end_node_id: str = None) -> Tuple[List[GraphStep], float, List[str]]:
        adj = GraphEngine._build_adjacency_list(nodes, edges)
        timeline = []
        
        distances = {n.id: float('inf') for n in nodes}
        distances[start_node_id] = 0
        
        previous = {n.id: None for n in nodes}
        previous_edge = {n.id: None for n in nodes}
        
        pq = [(0, start_node_id)]
        visited = []
        visited_set = set()
        
        timeline.append(GraphStep(
            nodes=nodes, edges=edges,
            highlighted_nodes=[start_node_id], visited_nodes=[], path_edges=[],
            action_description=f"Starting Dijkstra's Shortest Path from {start_node_id} to {end_node_id if end_node_id else 'all nodes'}."
        ))
        
        while pq:
            curr_dist, curr_node = heapq.heappop(pq)
            
            if curr_node in visited_set:
                continue
                
            visited_set.add(curr_node)
            visited.append(curr_node)
            
            # Reconstruct path edges up to current node for visual feedback
            curr_path_edges = []
            temp = curr_node
            while previous_edge[temp]:
                curr_path_edges.append(previous_edge[temp])
                temp = previous[temp]
            
            timeline.append(GraphStep(
                nodes=nodes, edges=edges,
                highlighted_nodes=[curr_node], visited_nodes=list(visited), path_edges=list(curr_path_edges),
                action_description=f"Selected {curr_node} with shortest known distance {round(curr_dist, 1)}. Exploring neighbors..."
            ))
            
            if end_node_id and curr_node == end_node_id:
                timeline.append(GraphStep(
                    nodes=nodes, edges=edges,
                    highlighted_nodes=[curr_node], visited_nodes=list(visited), path_edges=list(curr_path_edges),
                    action_description=f"Reached target node {end_node_id}! Shortest path found."
                ))
                return timeline, curr_dist, curr_path_edges
                
            for neighbor, weight, edge_id in adj[curr_node]:
                if neighbor in visited_set:
                    continue
                    
                new_dist = curr_dist + weight
                
                timeline.append(GraphStep(
                    nodes=nodes, edges=edges,
                    highlighted_nodes=[curr_node, neighbor], visited_nodes=list(visited), path_edges=list(curr_path_edges) + [edge_id],
                    action_description=f"Checking edge to {neighbor}. Current dist {round(distances[neighbor], 1)}, Potential dist {round(new_dist, 1)}"
                ))
                
                if new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    previous[neighbor] = curr_node
                    previous_edge[neighbor] = edge_id
                    heapq.heappush(pq, (new_dist, neighbor))
                    
                    timeline.append(GraphStep(
                        nodes=nodes, edges=edges,
                        highlighted_nodes=[neighbor], visited_nodes=list(visited), path_edges=list(curr_path_edges) + [edge_id],
                        action_description=f"Found shorter path to {neighbor}. Updating distance to {round(new_dist, 1)}"
                    ))
                    
        # Reconstruct path if end_node exists and was reached
        final_path_edges = []
        final_cost = distances.get(end_node_id, float('inf')) if end_node_id else -1
        
        if end_node_id and final_cost != float('inf'):
            temp = end_node_id
            while previous_edge[temp]:
                final_path_edges.append(previous_edge[temp])
                temp = previous[temp]
        else:
            final_cost = -1
            
        timeline.append(GraphStep(
            nodes=nodes, edges=edges,
            highlighted_nodes=[], visited_nodes=list(visited), path_edges=list(final_path_edges),
            action_description="Dijkstra's traversal complete." + (" No path found." if end_node_id and final_cost == -1 else "")
        ))
        
        return timeline, final_cost, final_path_edges
