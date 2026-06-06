// frontend/src/App.tsx
import React from 'react';
import { HeaderControls } from './features/sorting/components/HeaderControls';
import { BarChart } from './features/sorting/components/BarChart';
import { ControlPanel } from './features/sorting/components/ControlPanel';
import { ConsoleLayer } from './features/sorting/components/ConsoleLayer';
import { useVisualizerStore } from './store/useVisualizerStore';
import { useSortingPlayback } from './features/sorting/hooks/useSortingPlayback';
import { ComplexityChart } from './features/sorting/components/ComplexityChart';

export const App: React.FC = () => {
  const { error, isLoading, timeline } = useVisualizerStore();
  
  // Initialize the execution clock pulse frame loop
  useSortingPlayback();

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-500/30 font-sans">
      
      {/* Global Navigation and Controls */}
      <HeaderControls />

      {/* Main Content Area */}
      <main className="max-w-[1400px] w-full mx-auto flex flex-col gap-6 flex-1 px-4 py-6">
        
        {/* Global Network Context State Intercepts */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-xl text-rose-400 font-mono text-xs shadow-lg">
            <span className="font-bold">[NETWORK ERROR]:</span> {error}
          </div>
        )}

        {/* Central Analytics Bar Canvas Visual Board */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
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
            <div className="absolute inset-0 bg-[#0f1115]/70 backdrop-blur-sm rounded-xl flex items-center justify-center border border-slate-800 z-50">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono text-blue-400 animate-pulse">Invoking python state calculation models...</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Panel and Console Output */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bottom Playback Sequence Ticker Center */}
          <div className="lg:col-span-2">
            {timeline.length > 0 && <ControlPanel />}
          </div>
          {/* Dynamic Console Output & Code Editor Placeholder */}
          <div className="lg:col-span-1 mt-[-65px] w-110">
            <ConsoleLayer />
          </div>
        </div>

        
      </main>
    </div>
  );
};

export default App;