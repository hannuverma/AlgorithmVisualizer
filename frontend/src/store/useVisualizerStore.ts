import {create} from 'zustand';
import axios from 'axios';


interface SortingStep{
    array: number[],
    highlighted_indices: number[];
    swapped_indices: number[];
    action_description: string;
}

interface VisualizerState{
    timeline: SortingStep[];
    currentStepIndex: number;
    isPlaying: boolean;
    playbackSpeed: number;
    isLoading: boolean;
    error: string | null;

    generateSortingTimeline: (algorithm: string, array: number[]) => Promise<void>;

    setCurrentStepIndex: (index: number) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setPlaybackSpeed: (speed: number) => void;
    setTimeline: (timeline: SortingStep[]) => void;
    nextStep: () =>void;
    prevStep: () => void;
    resetPlayback: () => void;
    
}

export const useVisualizerStore = create<VisualizerState>((set) => ({
    timeline: [],
    currentStepIndex: 0,
    isPlaying: false,
    playbackSpeed: 100,
    isLoading: false,
    error: null,

    generateSortingTimeline: async (algorithm: string, array: number[]) => {

        set({ isLoading: true, error: null, isPlaying: false, currentStepIndex: 0 });

        try {

            const response = await axios.post(`http://127.0.0.1:8000/api/v1/sorting/${algorithm}`, {
            array: array
            });
        
            set({ 
            timeline: response.data.timeline, 
            isLoading: false 
            });
        } catch (err: any) {
            set({ 
            error: err.response?.data?.detail || "Failed to communicate with execution server.", 
            isLoading: false,
            timeline: []
            });
        }
    },

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