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
    <div className="glass-card w-full p-6 flex flex-col min-h-[400px]">
      {/* Card Header */}
      <div className="mb-5 pb-3 border-b border-slate-800/50 flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-[18px] font-semibold tracking-tight">Array Visualization</h2>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px] text-amber-500 flex items-center gap-1.5"><div className="w-2 h-0.5 bg-amber-500 rounded-sm"></div>Compare</span>
          <span className="font-mono text-[12px] text-rose-500 flex items-center gap-1.5"><div className="w-2 h-0.5 bg-rose-500 rounded-sm"></div>Swap</span>
          <span className="font-mono text-[12px] text-emerald-500 flex items-center gap-1.5"><div className="w-2 h-0.5 bg-emerald-500 rounded-sm"></div>Sorted</span>
        </div>
      </div>

      {/* Bars Container */}
      <div 
        className="flex items-end justify-center gap-1 sm:gap-2 px-2 border-b border-slate-800/80 transition-all duration-300 content-box bg-black/20 rounded-lg pt-4"
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

          let barColor = 'bg-slate-700 shadow-inner'; // Default safe color
          
          if (isSorted) {
            barColor = 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'; // Sorted state
          } else if (!isActivePartition) {
            barColor = 'bg-slate-800 opacity-30'; // Dim out elements
          } else if (isSwapped) {
            barColor = 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] scale-105 z-10'; // Active mutation
          } else if (isHighlighted) {
            barColor = 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)] z-10'; // Selection/Comparison
            if (currentStep.action_description.includes("Verifying")) {
                barColor = 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]';
            }
          }
          if (isSwapped && !currentStep.action_description.includes("Verifying")) {
            barColor = 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] scale-105';
          }

          const elementDepth = currentStep.depths ? currentStep.depths[idx] : 0;
          const depthOffset = elementDepth * 40;

          return (
            <div
              key={idx}
              className={`w-full transition-all duration-75 rounded-t-full relative group ${barColor}`}
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
    </div>
  );
};