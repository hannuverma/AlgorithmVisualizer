import { create } from 'zustand';
import axios from 'axios';

export interface MazeCell {
    r: number;
    c: number;
    is_wall: boolean;
    is_start: boolean;
    is_end: boolean;
}

export interface MazeStep {
    grid: MazeCell[][];
    highlighted_cells: string[];
    visited_cells: string[];
    path_cells: string[];
    action_description: string;
}

interface MazeState {
    timeline: MazeStep[];
    currentStepIndex: number;
    isPlaying: boolean;
    playbackSpeed: number;
    isLoading: boolean;
    error: string | null;
    
    // Maze Config
    rows: number;
    cols: number;
    selectedAlgorithm: string;

    generateMaze: (rows: number, cols: number) => Promise<void>;
    runPathfinder: () => Promise<void>;

    setRows: (rows: number) => void;
    setCols: (cols: number) => void;
    setSelectedAlgorithm: (algo: string) => void;
    setCurrentStepIndex: (index: number) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setPlaybackSpeed: (speed: number) => void;
    setTimeline: (timeline: MazeStep[]) => void;
    nextStep: () => void;
    prevStep: () => void;
    resetPlayback: () => void;
}

export const useMazeStore = create<MazeState>((set, get) => ({
    timeline: [],
    currentStepIndex: 0,
    isPlaying: false,
    playbackSpeed: 10, // Fast playback by default for sweep
    isLoading: false,
    error: null,
    
    rows: 15,
    cols: 15,
    selectedAlgorithm: 'bfs',

    generateMaze: async (rows: number, cols: number) => {
        set({ isLoading: true, error: null, isPlaying: false, currentStepIndex: 0 });

        try {
            const response = await axios.post(`https://algorithmvisualizer-90xk.onrender.com/api/v1/mazes/generate`, {
                rows,
                cols
            });

            set({
                timeline: response.data.timeline,
                isLoading: false,
                isPlaying: true // Start sweeping animation
            });
        } catch (err: any) {
            set({
                error: err.response?.data?.detail || "Failed to generate maze.",
                isLoading: false,
                timeline: []
            });
        }
    },

    runPathfinder: async () => {
        const { selectedAlgorithm, timeline } = get();
        
        // Grab the final generated maze
        const currentMaze = timeline.length > 0 ? timeline[timeline.length - 1] : null;
        if (!currentMaze) return;

        // Find start and end cells
        let start_r = -1, start_c = -1, end_r = -1, end_c = -1;
        for (let r = 0; r < currentMaze.grid.length; r++) {
            for (let c = 0; c < currentMaze.grid[r].length; c++) {
                if (currentMaze.grid[r][c].is_start) {
                    start_r = r; start_c = c;
                }
                if (currentMaze.grid[r][c].is_end) {
                    end_r = r; end_c = c;
                }
            }
        }
        
        if (start_r === -1 || end_r === -1) return;

        set({ isLoading: true, error: null, isPlaying: false, currentStepIndex: 0 });

        try {
            const response = await axios.post(`https://algorithmvisualizer-90xk.onrender.com/api/v1/mazes/path/${selectedAlgorithm}`, {
                grid: currentMaze.grid,
                start_r,
                start_c,
                end_r,
                end_c
            });

            set({
                timeline: response.data.timeline,
                isLoading: false,
                isPlaying: true
            });
        } catch (err: any) {
            set({
                error: err.response?.data?.detail || "Failed to run pathfinder.",
                isLoading: false
            });
        }
    },
    
    setRows: (rows) => set({ rows }),
    setCols: (cols) => set({ cols }),
    setSelectedAlgorithm: (selectedAlgorithm) => set({ selectedAlgorithm }),
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
