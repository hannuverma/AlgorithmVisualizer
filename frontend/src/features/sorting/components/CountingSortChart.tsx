// frontend/src/features/sorting/components/CountingSortChart.tsx
import React from 'react';
import { useVisualizerStore } from '../../../store/useVisualizerStore';

export const CountingSortChart: React.FC = () => {
  const { timeline, currentStepIndex } = useVisualizerStore();

  if (!timeline || timeline.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 border border-dashed border-slate-700 rounded-xl">
        Generate or fetch an array to begin visualization
      </div>
    );
  }

  const currentStep = timeline[currentStepIndex];
  
  // Safe defaults if empty
  const originalArray = currentStep.array || [];
  const countsArray = currentStep.number_array || [];
  const sortedArray = currentStep.sorted_array || Array(originalArray.length).fill(0);

  const maxVal = originalArray.length > 0 ? Math.max(...originalArray) : 1;
  const maxCount = countsArray.length > 0 ? Math.max(...countsArray) : 1;

  // Determine active elements in the counts array based on the current step's action and highlighted original array elements
  let activeCountIndices: number[] = [];
  const action = currentStep.action_description || "";
  
  if (currentStep.highlighted_indices && currentStep.highlighted_indices.length > 0) {
      const origIdx = currentStep.highlighted_indices[0];
      const valAtOrig = originalArray[origIdx];
      if (action.includes("Phase 1") || action.includes("Phase 3")) {
          activeCountIndices = [valAtOrig];
      }
  }

  const renderContainerRow = (
    title: string, 
    arr: number[], 
    maxFill: number, 
    highlighted: number[], 
    swapped: number[], 
    sorted: number[] | undefined,
    showIndices: boolean = false
  ) => {
    return (
      <div className="mb-6">
        <h3 className="text-[13px] font-mono text-slate-400 mb-3 border-b border-slate-800 pb-1">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {arr.map((val, idx) => {
            const fillPct = maxFill > 0 ? (val / maxFill) * 100 : 0;
            const isHighlight = highlighted.includes(idx);
            const isSwapped = swapped.includes(idx);
            const isSorted = sorted?.includes(idx);

            let borderColor = 'border-slate-700';
            let fillColor = 'bg-slate-700/50';

            if (isSorted) {
              borderColor = 'border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] z-10';
              fillColor = 'bg-emerald-500/80';
            } else if (isSwapped) {
              borderColor = 'border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] z-10';
              fillColor = 'bg-rose-500/80';
            } else if (isHighlight) {
              borderColor = 'border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] z-10';
              fillColor = 'bg-amber-400/80';
            }

            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div className={`relative w-10 h-14 border-2 ${borderColor} rounded-sm overflow-hidden bg-slate-900 flex items-end justify-center transition-all duration-300`}>
                  {/* Fill background */}
                  <div 
                    className={`w-full transition-all duration-300 ${fillColor}`} 
                    style={{ height: `${fillPct}%` }}
                  />
                  {/* Number Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-white drop-shadow-md">
                    {val}
                  </div>
                </div>
                {showIndices && (
                  <span className="text-[10px] font-mono text-slate-500">{idx}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card w-full p-6 flex flex-col min-h-[400px]">
      <div className="mb-5 pb-3 border-b border-slate-800/50 flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-[18px] font-semibold tracking-tight">Counting Sort Visualization</h2>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px] text-amber-500 flex items-center gap-1.5"><div className="w-2 h-2 border-2 border-amber-500 rounded-sm"></div>Read</span>
          <span className="font-mono text-[12px] text-rose-500 flex items-center gap-1.5"><div className="w-2 h-2 border-2 border-rose-500 rounded-sm"></div>Write</span>
          <span className="font-mono text-[12px] text-emerald-500 flex items-center gap-1.5"><div className="w-2 h-2 border-2 border-emerald-500 rounded-sm"></div>Sorted</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Layer 1: Original Array */}
        {renderContainerRow(
          "Original Array (Input)", 
          originalArray, 
          maxVal, 
          currentStep.highlighted_indices || [], 
          [], 
          undefined,
          true
        )}

        {/* Layer 2: Number Array (Counts/Frequencies) */}
        {countsArray.length > 0 && renderContainerRow(
          "Counts Array (Frequencies & Prefix Sums)", 
          countsArray, 
          maxCount, 
          activeCountIndices, 
          [], 
          undefined,
          true // show indices for counts array
        )}

        {/* Layer 3: Sorted Array (Output) */}
        {sortedArray.length > 0 && renderContainerRow(
          "Sorted Array (Output)", 
          sortedArray, 
          maxVal, 
          [], 
          currentStep.swapped_indices || [], 
          currentStep.sorted_indices,
          true
        )}
      </div>
    </div>
  );
};
