import React, { useMemo } from 'react';
import { useMazeStore } from '../../../store/useMazeStore';

export const MazeVisualizer: React.FC = () => {
    const { timeline, currentStepIndex } = useMazeStore();
    const currentStep = timeline[currentStepIndex];

    const { grid, highlighted_cells, visited_cells, path_cells } = useMemo(() => {
        if (!currentStep) return { grid: [], highlighted_cells: new Set(), visited_cells: new Set(), path_cells: new Set() };
        return {
            grid: currentStep.grid,
            highlighted_cells: new Set(currentStep.highlighted_cells),
            visited_cells: new Set(currentStep.visited_cells),
            path_cells: new Set(currentStep.path_cells)
        };
    }, [currentStep]);

    if (!currentStep || grid.length === 0) {
        return (
            <div className="w-full h-[500px] flex items-center justify-center border border-slate-800/50 rounded-xl bg-[#0a0c10] shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzMzQxNTUiLz48L3N2Zz4=')] opacity-20"></div>
                <div className="z-10 flex flex-col items-center gap-3">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="3" y1="15" x2="21" y2="15"></line>
                        <line x1="9" y1="3" x2="9" y2="21"></line>
                        <line x1="15" y1="3" x2="15" y2="21"></line>
                    </svg>
                    <p className="text-slate-500 font-mono text-sm tracking-wide">Awaiting maze generation...</p>
                    <p className="text-slate-600 font-mono text-[10px]">Set dimensions and click Generate Maze</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-[500px] border border-slate-800/50 rounded-xl bg-[#050608] shadow-inner flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Legend Overlay */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-3 pointer-events-none z-10">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div><span className="text-[10px] font-mono text-slate-400">Start</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></div><span className="text-[10px] font-mono text-slate-400">End</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-slate-800 rounded-sm"></div><span className="text-[10px] font-mono text-slate-400">Wall</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-slate-300 rounded-sm"></div><span className="text-[10px] font-mono text-slate-400">Passage</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-purple-500 rounded-sm"></div><span className="text-[10px] font-mono text-slate-400">Frontier</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div><span className="text-[10px] font-mono text-slate-400">Visited</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)] rounded-sm"></div><span className="text-[10px] font-mono text-slate-400">Path</span></div>
            </div>

            <div className="w-full h-full flex items-center justify-center pt-8 pb-2 overflow-hidden pr-20 pl-20">
                <div 
                    className="grid gap-[1px] bg-slate-900 border border-slate-700 shadow-2xl transition-all duration-300 ease-in-out"
                    style={{
                        gridTemplateRows: `repeat(${grid.length}, minmax(0, 1fr))`,
                        gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))`,
                        width: '100%',
                        height: 'auto',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        aspectRatio: `${grid[0].length} / ${grid.length}`
                    }}
                >
                {grid.map((row, r) => 
                    row.map((cell, c) => {
                        const cellId = `${r},${c}`;
                        const isHighlighted = highlighted_cells.has(cellId);
                        const isVisited = visited_cells.has(cellId);
                        const isPath = path_cells.has(cellId);

                        let bgColor = 'bg-slate-300'; // Passage
                        let extraStyles = '';

                        if (cell.is_wall) {
                            bgColor = 'bg-slate-800';
                        } else if (cell.is_start) {
                            bgColor = 'bg-emerald-500';
                            extraStyles = 'shadow-[0_0_12px_rgba(16,185,129,0.8)] z-10';
                        } else if (cell.is_end) {
                            bgColor = 'bg-rose-500';
                            extraStyles = 'shadow-[0_0_12px_rgba(244,63,94,0.8)] z-10';
                        } else if (isPath) {
                            bgColor = 'bg-yellow-400';
                            extraStyles = 'shadow-[0_0_12px_rgba(250,204,21,0.8)] z-10';
                        } else if (isHighlighted) {
                            bgColor = 'bg-purple-500';
                            extraStyles = 'shadow-[0_0_8px_rgba(168,85,247,0.6)] z-10';
                        } else if (isVisited) {
                            bgColor = 'bg-blue-500/80';
                        }

                        // Cell rendering
                        return (
                            <div 
                                key={cellId}
                                className={`w-full h-full min-w-[6px] min-h-[6px] transition-colors duration-[50ms] ${bgColor} ${extraStyles}`}
                            />
                        );
                    })
                )}
            </div>
            </div>
        </div>
    );
};
