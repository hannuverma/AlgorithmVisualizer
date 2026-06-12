import random
import collections
import heapq
import copy
from typing import List, Tuple, Dict
from app.schemas.mazes import MazeCell, MazeStep

class MazeEngine:
    
    @staticmethod
    def _create_grid(rows: int, cols: int, initial_wall: bool = True) -> List[List[MazeCell]]:
        grid = []
        for r in range(rows):
            row = []
            for c in range(cols):
                row.append(MazeCell(r=r, c=c, is_wall=initial_wall))
            grid.append(row)
        return grid

    @staticmethod
    def generate_maze(rows: int, cols: int) -> List[MazeStep]:
        # Ensure dimensions are odd for proper wall/passage carving
        if rows % 2 == 0: rows += 1
        if cols % 2 == 0: cols += 1
            
        grid = MazeEngine._create_grid(rows, cols, initial_wall=True)
        timeline = []
        
        # Start carving from (1, 1)
        start_r, start_c = 1, 1
        grid[start_r][start_c].is_wall = False
        
        stack = [(start_r, start_c)]
        
        # We record frames every N iterations to create a "fast sweep" effect
        # instead of a painfully slow cell-by-cell animation.
        iteration = 0
        frame_rate = max(1, (rows * cols) // 100)
        
        timeline.append(MazeStep(
            grid=copy.deepcopy(grid),
            action_description=f"Initializing {rows}x{cols} grid with solid walls..."
        ))
        
        while stack:
            r, c = stack.pop()
            
            # Find unvisited neighbors at distance 2
            neighbors = []
            directions = [(0, 2), (2, 0), (0, -2), (-2, 0)]
            random.shuffle(directions)
            
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 1 <= nr < rows - 1 and 1 <= nc < cols - 1 and grid[nr][nc].is_wall:
                    neighbors.append((nr, nc, r + dr//2, c + dc//2))
                    
            if neighbors:
                stack.append((r, c))
                nr, nc, wr, wc = neighbors[0] # Pick first random neighbor
                
                # Carve path
                grid[wr][wc].is_wall = False
                grid[nr][nc].is_wall = False
                stack.append((nr, nc))
                
                iteration += 1
                if iteration % frame_rate == 0:
                    timeline.append(MazeStep(
                        grid=copy.deepcopy(grid),
                        highlighted_cells=[f"{nr},{nc}"],
                        action_description="Carving passages via recursive backtracker..."
                    ))

        # Add loops/multiple paths by knocking down some random walls
        num_extra_paths = (rows * cols) // 20
        extra_paths_added = 0
        attempts = 0
        
        while extra_paths_added < num_extra_paths and attempts < 1000:
            r = random.randint(1, rows - 2)
            c = random.randint(1, cols - 2)
            
            if grid[r][c].is_wall:
                # Check if it separates two passages (horizontal or vertical)
                if (not grid[r-1][c].is_wall and not grid[r+1][c].is_wall and grid[r][c-1].is_wall and grid[r][c+1].is_wall) or \
                   (not grid[r][c-1].is_wall and not grid[r][c+1].is_wall and grid[r-1][c].is_wall and grid[r+1][c].is_wall):
                    grid[r][c].is_wall = False
                    extra_paths_added += 1
            attempts += 1
            
        timeline.append(MazeStep(
            grid=copy.deepcopy(grid),
            action_description="Adding extra paths to create multiple routes..."
        ))
                    
                    
        # Set start and end points
        grid[1][1].is_start = True
        grid[rows-2][cols-2].is_end = True
        
        timeline.append(MazeStep(
            grid=copy.deepcopy(grid),
            action_description="Maze generation complete. Start and End points placed."
        ))
        
        return timeline

    @staticmethod
    def _get_neighbors(grid: List[List[MazeCell]], r: int, c: int) -> List[Tuple[int, int]]:
        rows = len(grid)
        cols = len(grid[0])
        neighbors = []
        for dr, dc in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and not grid[nr][nc].is_wall:
                neighbors.append((nr, nc))
        return neighbors

    @staticmethod
    def bfs(grid: List[List[MazeCell]], start_r: int, start_c: int, end_r: int, end_c: int) -> Tuple[List[MazeStep], bool, int]:
        timeline = []
        queue = collections.deque([(start_r, start_c)])
        visited = set([(start_r, start_c)])
        visited_history = []
        
        parent = {}
        path_found = False
        
        timeline.append(MazeStep(
            grid=grid,
            highlighted_cells=[f"{start_r},{start_c}"],
            action_description="Starting BFS Traversal..."
        ))
        
        while queue:
            r, c = queue.popleft()
            visited_history.append(f"{r},{c}")
            
            if r == end_r and c == end_c:
                path_found = True
                break
                
            for nr, nc in MazeEngine._get_neighbors(grid, r, c):
                if (nr, nc) not in visited:
                    visited.add((nr, nc))
                    parent[(nr, nc)] = (r, c)
                    queue.append((nr, nc))
                    
            timeline.append(MazeStep(
                grid=grid,
                highlighted_cells=[f"{nr},{nc}" for nr, nc in queue],
                visited_cells=list(visited_history),
                action_description=f"Exploring node ({r},{c}) via BFS..."
            ))
            
        return MazeEngine._build_path_response(grid, timeline, parent, (start_r, start_c), (end_r, end_c), path_found, visited_history)

    @staticmethod
    def dfs(grid: List[List[MazeCell]], start_r: int, start_c: int, end_r: int, end_c: int) -> Tuple[List[MazeStep], bool, int]:
        timeline = []
        stack = [(start_r, start_c)]
        visited = set()
        visited_history = []
        
        parent = {}
        path_found = False
        
        timeline.append(MazeStep(
            grid=grid,
            highlighted_cells=[f"{start_r},{start_c}"],
            action_description="Starting DFS Traversal..."
        ))
        
        while stack:
            r, c = stack.pop()
            
            if (r, c) in visited:
                continue
                
            visited.add((r, c))
            visited_history.append(f"{r},{c}")
            
            if r == end_r and c == end_c:
                path_found = True
                break
                
            for nr, nc in MazeEngine._get_neighbors(grid, r, c):
                if (nr, nc) not in visited:
                    parent[(nr, nc)] = (r, c)
                    stack.append((nr, nc))
                    
            timeline.append(MazeStep(
                grid=grid,
                highlighted_cells=[f"{r},{c}"],
                visited_cells=list(visited_history),
                action_description=f"Exploring deep into ({r},{c}) via DFS..."
            ))
            
        return MazeEngine._build_path_response(grid, timeline, parent, (start_r, start_c), (end_r, end_c), path_found, visited_history)

    @staticmethod
    def dijkstra(grid: List[List[MazeCell]], start_r: int, start_c: int, end_r: int, end_c: int) -> Tuple[List[MazeStep], bool, int]:
        # On an unweighted grid, Dijkstra is basically BFS, but we'll use a Priority Queue anyway
        timeline = []
        pq = [(0, start_r, start_c)]
        distances = {(start_r, start_c): 0}
        visited = set()
        visited_history = []
        
        parent = {}
        path_found = False
        
        timeline.append(MazeStep(
            grid=grid,
            highlighted_cells=[f"{start_r},{start_c}"],
            action_description="Starting Dijkstra's Algorithm..."
        ))
        
        while pq:
            dist, r, c = heapq.heappop(pq)
            
            if (r, c) in visited:
                continue
                
            visited.add((r, c))
            visited_history.append(f"{r},{c}")
            
            if r == end_r and c == end_c:
                path_found = True
                break
                
            for nr, nc in MazeEngine._get_neighbors(grid, r, c):
                new_dist = dist + 1
                if (nr, nc) not in distances or new_dist < distances[(nr, nc)]:
                    distances[(nr, nc)] = new_dist
                    parent[(nr, nc)] = (r, c)
                    heapq.heappush(pq, (new_dist, nr, nc))
                    
            timeline.append(MazeStep(
                grid=grid,
                highlighted_cells=[f"{nr},{nc}" for _, nr, nc in pq],
                visited_cells=list(visited_history),
                action_description=f"Dijkstra evaluating ({r},{c}) with cost {dist}..."
            ))
            
        return MazeEngine._build_path_response(grid, timeline, parent, (start_r, start_c), (end_r, end_c), path_found, visited_history)

    @staticmethod
    def astar(grid: List[List[MazeCell]], start_r: int, start_c: int, end_r: int, end_c: int) -> Tuple[List[MazeStep], bool, int]:
        def manhattan(r1, c1, r2, c2):
            return abs(r1 - r2) + abs(c1 - c2)
            
        timeline = []
        pq = [(0 + manhattan(start_r, start_c, end_r, end_c), 0, start_r, start_c)] # (f, g, r, c)
        g_costs = {(start_r, start_c): 0}
        visited = set()
        visited_history = []
        
        parent = {}
        path_found = False
        
        timeline.append(MazeStep(
            grid=grid,
            highlighted_cells=[f"{start_r},{start_c}"],
            action_description="Starting A* Search with Manhattan heuristic..."
        ))
        
        while pq:
            f, g, r, c = heapq.heappop(pq)
            
            if (r, c) in visited:
                continue
                
            visited.add((r, c))
            visited_history.append(f"{r},{c}")
            
            if r == end_r and c == end_c:
                path_found = True
                break
                
            for nr, nc in MazeEngine._get_neighbors(grid, r, c):
                new_g = g + 1
                if (nr, nc) not in g_costs or new_g < g_costs[(nr, nc)]:
                    g_costs[(nr, nc)] = new_g
                    parent[(nr, nc)] = (r, c)
                    new_f = new_g + manhattan(nr, nc, end_r, end_c)
                    heapq.heappush(pq, (new_f, new_g, nr, nc))
                    
            timeline.append(MazeStep(
                grid=grid,
                highlighted_cells=[f"{nr},{nc}" for _, _, nr, nc in pq],
                visited_cells=list(visited_history),
                action_description=f"A* evaluating ({r},{c}). Best predicted cost: {f}..."
            ))
            
        return MazeEngine._build_path_response(grid, timeline, parent, (start_r, start_c), (end_r, end_c), path_found, visited_history)

    @staticmethod
    def _build_path_response(grid, timeline, parent, start, end, path_found, visited_history):
        path_cells = []
        if path_found:
            curr = end
            while curr != start:
                path_cells.append(f"{curr[0]},{curr[1]}")
                curr = parent[curr]
            path_cells.append(f"{start[0]},{start[1]}")
            path_cells.reverse()
            
        timeline.append(MazeStep(
            grid=grid,
            highlighted_cells=[],
            visited_cells=list(visited_history),
            path_cells=path_cells,
            action_description="Target reached! Path highlighted." if path_found else "No path exists to target."
        ))
        
        return timeline, path_found, len(path_cells) - 1 if path_found else 0
