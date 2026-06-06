// frontend/src/App.tsx
import React from 'react';
import { HeaderControls } from './features/sorting/components/HeaderControls';
import { BarChart } from './features/sorting/components/BarChart';
import { ControlPanel } from './features/sorting/components/ControlPanel';
import { useVisualizerStore } from './store/useVisualizerStore';
import { useSortingPlayback } from './features/sorting/hooks/useSortingPlayback';
import { ComplexityChart } from './features/sorting/components/ComplexityChart';

export const App: React.FC = () => {
  const { error, isLoading, timeline } = useVisualizerStore();
  
  // Initialize the execution clock pulse frame loop
  useSortingPlayback();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-8 selection:bg-blue-500/30">
      <header className="max-w-5xl w-full mx-auto mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Arch Visualizer Core
        </h1>
        <p className="text-xs font-mono text-slate-500 mt-1">Production Level Decoupled Execution Network</p>
      </header>

      <main className="max-w-5xl w-full mx-auto flex flex-col gap-6 flex-1 justify-center">
        {/* Top Operational Commands Panel */}
        <HeaderControls />

        {/* Global Network Context State Intercepts */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-xl text-rose-400 font-mono text-xs">
            <span className="font-bold">[NETWORK ERROR]:</span> {error}
          </div>
        )}

        {/* Central Analytics Bar Canvas Visual Board */}
        <div className="relative">
          <div className="grid grid-col-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Columns hold the main sorting canvas visualizer */}
            <div className="lg:col-span-2">
              <BarChart />
            </div>

            {/* Right Column holds your advanced real-time telemetry card */}
            <div className="lg:col-span-1">
              <ComplexityChart />
            </div>
          </div>
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs rounded-xl flex items-center justify-center border border-slate-800">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono text-blue-400 animate-pulse">Invoking python state calculation models...</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Playback Sequence Ticker Center */}
        {timeline.length > 0 && <ControlPanel />}
      </main>
    </div>
  );
};

export default App;