import { create } from 'zustand';
import axios from 'axios';

interface TreeNode{
    id: string;
    value: number;
    x: number;
    y: number;
    parent_id: string | null;
    is_leaf?: boolean;
    height?: number;
}

interface TreeStep{
    nodes: TreeNode[];
    highlighted_nodes: string[];
    mutated_nodes: string[];
    action_description: string;
    visited_sequence?: string[];
}

interface TreeState{
    inputValues: number[];
    timeline: TreeStep[];
    currentStepIndex: number;
    isPlaying: boolean;
    playbackSpeed: number;
    isLoading: boolean;
    error: string | null;
    treeType: string;
    treeAction: string;

    generateTreeTimeline: (values: number[], treeType: string, treeAction: string, targetValue?: number, targetId?: string) => Promise<void>;
    nextStep: () => void;
    prevStep: () => void;
    setIsPlaying: (isPlaying: boolean) =>void;
    setPlaybackSpeed: (speed: number) => void;
    resetPlayback: () => void;
} 

export const useTreeStore = create<TreeState>((set,get) => ({
    inputValues: [],
    timeline:[],
    currentStepIndex: 0,
    isPlaying: false,
    playbackSpeed: 500,
    isLoading: false,
    error: null,
    treeType: 'bst',
    treeAction: 'insert',

    generateTreeTimeline: async (values: number[], treeType: string, treeAction: string, targetValue?: number, targetId?: string) => {
    // Don't overwrite the stored treeAction for transient operations (search/delete)
    // so the user's dropdown selection (insert/traversals) is preserved
    const stateUpdate: any = { inputValues: values, treeType, isLoading: true, error: null, isPlaying: false, currentStepIndex: 0 };
    if (treeAction !== 'search' && treeAction !== 'delete') {
      stateUpdate.treeAction = treeAction;
    }
    set(stateUpdate);
    try {
      const payload: any = { values: values };
      if (targetValue !== undefined) payload.target_value = targetValue;
      if (targetId !== undefined) payload.target_id = targetId;
      
      const response = await axios.post(`http://127.0.0.1:8000/api/v1/tree/${treeType}-${treeAction}`, payload);
      set({ timeline: response.data.timeline, isLoading: false });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.detail || "Failed to sync with the Tree Layout Engine.", 
        isLoading: false 
      });
    }
  },

  nextStep: () => set((state) => ({
    currentStepIndex: Math.min(state.currentStepIndex + 1, state.timeline.length - 1)
  })),

  prevStep: () => set((state) => ({
    currentStepIndex: Math.max(state.currentStepIndex - 1, 0)
  })),

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  resetPlayback: () => set({ currentStepIndex: 0, isPlaying: false })
}))