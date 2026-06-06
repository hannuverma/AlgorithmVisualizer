// frontend/src/features/sorting/components/ControlPanel.tsx
import React from 'react';
import { useVisualizerStore } from '../../../store/useVisualizerStore';

export const ControlPanel: React.FC = () => {
  const { 
    isPlaying, 
    setIsPlaying, 
    currentStepIndex, 
    timeline, 
    playbackSpeed, 
    setPlaybackSpeed,
    nextStep,
    prevStep,
    resetPlayback 
  } = useVisualizerStore();

  const hasData = timeline.length > 0;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Playback Primary Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={prevStep}
          disabled={!hasData || currentStepIndex === 0 || isPlaying}
          className="px-3 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 disabled:opacity-40 font-semibold"
        >
          Step Back
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={!hasData}
          className={`px-6 py-2 rounded-lg font-bold transition-all text-white ${
            isPlaying 
              ? 'bg-amber-600 hover:bg-amber-500' 
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
          } disabled:opacity-40`}
        >
          {isPlaying ? 'Pause' : 'Play Execution'}
        </button>

        <button
          onClick={nextStep}
          disabled={!hasData || currentStepIndex === timeline.length - 1 || isPlaying}
          className="px-3 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 disabled:opacity-40 font-semibold"
        >
          Step Forward
        </button>

        <button
          onClick={resetPlayback}
          disabled={!hasData}
          className="ml-2 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Speed Slider Configuration */}
      <div className="flex items-center gap-3 w-full md:w-auto max-w-xs">
        <span className="text-xs font-mono text-slate-400 whitespace-nowrap">Delay: {playbackSpeed}ms</span>
        <input
          type="range"
          min="10"
          max="1000"
          step="10"
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      {/* Progress Metric Readout */}
      <div className="text-xs font-mono text-slate-400">
        Step: <span className="text-blue-400">{hasData ? currentStepIndex + 1 : 0}</span> / {timeline.length}
      </div>
    </div>
  );
};