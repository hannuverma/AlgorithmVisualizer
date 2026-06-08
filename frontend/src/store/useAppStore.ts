// frontend/src/store/useAppStore.ts
import { create } from 'zustand';

export type AppView = 'sorting' | 'trees' | 'graphs' | 'telemetry';

interface AppState {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeView: 'sorting',
  setActiveView: (view) => set({ activeView: view })
}));
