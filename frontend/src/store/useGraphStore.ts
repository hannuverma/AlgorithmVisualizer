import { create } from 'zustand';
import axios from 'axios';

export interface GraphNodeSnapshot {
    id: string;
    x: number;
    y: number;
    z: number;
    value?: number | null;
}

export interface GraphEdgeSnapshot {
    id: string;
    source: string;
    target: string;
    weight: number;
}

export interface GraphStep {
    nodes: GraphNodeSnapshot[];
    edges: GraphEdgeSnapshot[];
    highlighted_nodes: string[];
    visited_nodes: string[];
    path_edges: string[];
    action_description: string;
}

interface GraphState {
    timeline: GraphStep[];
    currentStepIndex: number;
    isPlaying: boolean;
    playbackSpeed: number;
    isLoading: boolean;
    error: string | null;
    
    // Graph Config
    numNodes: number;
    edgeProbability: number;
    
    // Algorithm State
    selectedGraphAlgorithm: string;
    startNodeId: string | null;
    endNodeId: string | null;

    generateGraphTimeline: (numNodes: number, edgeProbability: number) => Promise<void>;
    runGraphAlgorithm: () => Promise<void>;

    setNumNodes: (num: number) => void;
    setEdgeProbability: (prob: number) => void;
    setSelectedGraphAlgorithm: (algo: string) => void;
    setStartNodeId: (id: string | null) => void;
    setEndNodeId: (id: string | null) => void;
    setCurrentStepIndex: (index: number) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setPlaybackSpeed: (speed: number) => void;
    setTimeline: (timeline: GraphStep[]) => void;
    nextStep: () => void;
    prevStep: () => void;
    resetPlayback: () => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
    timeline: [],
    currentStepIndex: 0,
    isPlaying: false,
    playbackSpeed: 100,
    isLoading: false,
    error: null,
    numNodes: 10,
    edgeProbability: 0.3,
    
    selectedGraphAlgorithm: 'bfs',
    startNodeId: null,
    endNodeId: null,

    generateGraphTimeline: async (numNodes: number, edgeProbability: number) => {
        set({ isLoading: true, error: null, isPlaying: false, currentStepIndex: 0, startNodeId: null, endNodeId: null });

        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/v1/graphs/generate`, {
                num_nodes: numNodes,
                edge_probability: edgeProbability,
                width: 600.0,
                height: 600.0,
                depth: 600.0
            });

            set({
                timeline: response.data.timeline,
                isLoading: false,
                isPlaying: true // Start playing automatically
            });
        } catch (err: any) {
            set({
                error: err.response?.data?.detail || "Failed to communicate with graph engine.",
                isLoading: false,
                timeline: []
            });
        }
    },

    runGraphAlgorithm: async () => {
        const { selectedGraphAlgorithm, startNodeId, endNodeId, timeline } = get();
        if (!startNodeId) return;
        if (selectedGraphAlgorithm === 'dijkstra' && !endNodeId) return;
        
        // Grab the final graph state (the last step of the current generation)
        // to use as the base for traversal.
        const currentGraph = timeline.length > 0 ? timeline[timeline.length - 1] : null;
        if (!currentGraph) return;

        set({ isLoading: true, error: null, isPlaying: false, currentStepIndex: 0 });

        try {
            let endpoint = '';
            if (selectedGraphAlgorithm === 'bfs') endpoint = '/api/v1/graphs/traverse/bfs';
            if (selectedGraphAlgorithm === 'dfs') endpoint = '/api/v1/graphs/traverse/dfs';
            if (selectedGraphAlgorithm === 'dijkstra') endpoint = '/api/v1/graphs/path/dijkstra';

            const response = await axios.post(`http://127.0.0.1:8000${endpoint}`, {
                nodes: currentGraph.nodes,
                edges: currentGraph.edges,
                start_node_id: startNodeId,
                end_node_id: endNodeId
            });

            set({
                timeline: response.data.timeline,
                isLoading: false,
                isPlaying: true
            });
        } catch (err: any) {
            set({
                error: err.response?.data?.detail || "Failed to run graph algorithm.",
                isLoading: false
            });
        }
    },
    
    setNumNodes: (numNodes) => set({ numNodes }),
    setEdgeProbability: (edgeProbability) => set({ edgeProbability }),
    setSelectedGraphAlgorithm: (selectedGraphAlgorithm) => set({ selectedGraphAlgorithm }),
    setStartNodeId: (startNodeId) => set({ startNodeId }),
    setEndNodeId: (endNodeId) => set({ endNodeId }),
    setCurrentStepIndex: (currentStepIndex) => set({ currentStepIndex }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
    setTimeline: (timeline) => set({ timeline, currentStepIndex: 0, isPlaying: false, error: null }),
    
    nextStep: () => set((state) => ({
        currentStepIndex: Math.min(state.currentStepIndex + 1, state.timeline.length - 1)
    })),

    prevStep: () => set((state) => ({
        currentStepIndex: Math.max(state.currentStepIndex - 1, 0)
    })),

    resetPlayback: () => set({ currentStepIndex: 0, isPlaying: false })
}));
