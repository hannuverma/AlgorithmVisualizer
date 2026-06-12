import React, { useMemo } from 'react';
import { useMazeStore } from '../../../store/useMazeStore';

export const MazeMetrics: React.FC = () => {
    const { timeline, currentStepIndex, selectedAlgorithm } = useMazeStore();
    const currentStep = timeline[currentStepIndex];

    const { visitedCount, frontierCount, pathCount } = useMemo(() => {
        if (!currentStep) return { visitedCount: 0, frontierCount: 0, pathCount: 0 };
        return {
            visitedCount: currentStep.visited_cells.length,
            frontierCount: currentStep.highlighted_cells.length,
            pathCount: currentStep.path_cells.length,
        };
    }, [currentStep]);

    return (
        <div className="glass-card w-full p-5 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
            </div>
            <h3 className="text-[13px] font-mono text-slate-400 border-b border-slate-800 pb-2 flex justify-between items-center">
                Pathfinding Metrics
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                    {selectedAlgorithm}
                </span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col bg-slate-900/50 p-3 rounded-lg border border-slate-800/60 z-10">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">Visited Cells</span>
                    <span className="text-xl font-bold text-blue-400 font-mono">{visitedCount}</span>
                </div>
                <div className="flex flex-col bg-slate-900/50 p-3 rounded-lg border border-slate-800/60 z-10">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">Frontier</span>
                    <span className="text-xl font-bold text-purple-400 font-mono">{frontierCount}</span>
                </div>
                <div className="flex flex-col bg-slate-900/50 p-3 rounded-lg border border-slate-800/60 col-span-2 z-10">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">Path Length</span>
                    <span className="text-xl font-bold text-yellow-400 font-mono">{pathCount > 0 ? pathCount : '-'}</span>
                </div>
            </div>
        </div>
    );
};
