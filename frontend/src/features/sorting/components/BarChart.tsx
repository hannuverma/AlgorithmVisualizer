// frontend/src/features/sorting/components/BarChart.tsx
import React from 'react';
import { useVisualizerStore } from '../../../store/useVisualizerStore';

export const BarChart: React.FC = () => {
  const { timeline, currentStepIndex } = useVisualizerStore();
  
  // Guard clause for safe empty rendering
  if (!timeline || timeline.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 border border-dashed border-slate-700 rounded-xl">
        Generate or fetch an array to begin visualization
      </div>
    );
  }

  const currentStep = timeline[currentStepIndex];
  const maxVal = Math.max(...currentStep.array);
  const maxDepth = currentStep.depths ? Math.max(...currentStep.depths, 0) : 0;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
      {/* Bars Container */}
      <div 
        className="flex items-end justify-center gap-1 sm:gap-2 px-2 border-b border-slate-800 transition-all duration-300 content-box"
        style={{ 
          height: '384px',
          paddingBottom: `${8 + (maxDepth * 40)}px` 
        }}
      >
        {currentStep.array.map((value, idx) => {
          // Calculate height proportion safely
          const heightPercentage = (value / maxVal) * 100;
          
          // Compute visual states
          const isHighlighted = currentStep.highlighted_indices.includes(idx);
          const isSwapped = currentStep.swapped_indices.includes(idx);
          const isSorted = currentStep.sorted_indices?.includes(idx);

          let isActivePartition = true;
          if (currentStep.active_range && currentStep.active_range.length === 2) {
              const [start, end] = currentStep.active_range;
              if (idx < start || idx > end) {
                  isActivePartition = false;
              }
          }

          let barColor = 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'; // Default stable state
          
          if (isSorted) {
            barColor = 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'; // Sorted state
          } else if (!isActivePartition) {
            barColor = 'bg-slate-800 opacity-30'; // Dim out elements not in the active partition
          } else if (isSwapped) {
            barColor = 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] scale-105 z-10'; // Active mutation
          } else if (isHighlighted) {
            barColor = 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)] z-10'; // Selection/Comparison
            if (currentStep.action_description.includes("Verifying")) {
                // If we are in the victory loop phase, paint everything verified green!
                barColor = 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]';
            } else {
                // Standard sorting comparison color
                barColor = 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]';
            }
          }
          if (isSwapped && !currentStep.action_description.includes("Verifying")) {
            // Standard sorting active swap color
            barColor = 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] scale-105';
          }

          const elementDepth = currentStep.depths ? currentStep.depths[idx] : 0;
          const depthOffset = elementDepth * 40;

          return (
            <div
              key={idx}
              className={`w-full transition-all duration-75 rounded-t-sm relative group ${barColor}`}
              style={{ 
                height: `${heightPercentage}%`,
                transform: `translateY(${depthOffset}px)`
              }}
            >
              {/* Floating Tooltip Indicator */}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-slate-700">
                {value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dynamic Terminal Output Text */}
      <div className="mt-4 font-mono text-sm bg-slate-950 text-emerald-400 p-3 rounded-lg border border-slate-800 h-16 overflow-y-auto">
        <span className="text-slate-500">&gt; </span>
        {currentStep.action_description}
      </div>
    </div>
  );
};