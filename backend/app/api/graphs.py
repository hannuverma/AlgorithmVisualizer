from fastapi import APIRouter
from app.schemas.graphs import GraphGenerationRequest, GraphGenerationResponse, GraphPathRequest, GraphPathResponse
from app.engine.graph_engine import GraphEngine

router = APIRouter()

@router.post("/generate", response_model=GraphGenerationResponse)
def generate_graph(payload: GraphGenerationRequest):
    timeline = GraphEngine.generate_graph_timeline(
        num_nodes=payload.num_nodes,
        edge_probability=payload.edge_probability,
        width=payload.width,
        height=payload.height,
        depth=payload.depth
    )
    
    return GraphGenerationResponse(
        timeline=timeline,
        total_steps=len(timeline)
    )

@router.post("/traverse/bfs", response_model=GraphPathResponse)
def run_bfs(payload: GraphPathRequest):
    timeline = GraphEngine.bfs(payload.nodes, payload.edges, payload.start_node_id)
    return GraphPathResponse(
        algorithm="bfs",
        timeline=timeline,
        total_steps=len(timeline)
    )

@router.post("/traverse/dfs", response_model=GraphPathResponse)
def run_dfs(payload: GraphPathRequest):
    timeline = GraphEngine.dfs(payload.nodes, payload.edges, payload.start_node_id)
    return GraphPathResponse(
        algorithm="dfs",
        timeline=timeline,
        total_steps=len(timeline)
    )

@router.post("/path/dijkstra", response_model=GraphPathResponse)
def run_dijkstra(payload: GraphPathRequest):
    timeline, cost, path = GraphEngine.dijkstra(payload.nodes, payload.edges, payload.start_node_id, payload.end_node_id)
    return GraphPathResponse(
        algorithm="dijkstra",
        timeline=timeline,
        total_steps=len(timeline),
        shortest_path_cost=cost,
        final_path=path
    )
