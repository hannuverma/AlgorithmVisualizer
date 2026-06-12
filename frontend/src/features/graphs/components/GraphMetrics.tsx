import React from 'react';
import { useGraphStore } from '../../../store/useGraphStore';

export const GraphMetrics: React.FC = () => {
    const { timeline, currentStepIndex, startNodeId, endNodeId, selectedGraphAlgorithm } = useGraphStore();
    const currentStep = timeline[currentStepIndex];

    if (!currentStep) return null;

    const totalNodes = currentStep.nodes.length;
    const totalEdges = currentStep.edges.length;
    
    // Density calculation: E / (V * (V - 1) / 2)
    const maxEdges = (totalNodes * (totalNodes - 1)) / 2;
    const density = maxEdges > 0 ? (totalEdges / maxEdges) * 100 : 0;

    // Check if the current step is the final step of a Dijkstra search and has a path
    const isDijkstra = selectedGraphAlgorithm === 'dijkstra';
    const isFinalStep = currentStepIndex === timeline.length - 1;
    
    // Calculate path cost if path edges are present
    let pathCost = 0;
    if (isFinalStep && currentStep.path_edges.length > 0) {
        currentStep.path_edges.forEach(edgeId => {
            const edge = currentStep.edges.find(e => e.id === edgeId);
            if (edge) pathCost += edge.weight;
        });
        // Handle floating point imprecision
        pathCost = Math.round(pathCost * 10) / 10;
    }

    return (
        <div className="glass-card w-full p-5 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
            </div>
            
            <h3 className="text-[13px] font-mono text-slate-400 border-b border-slate-800 pb-2 flex justify-between items-center">
                Network Topology
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-900/50 text-indigo-400 border border-indigo-800">
                    {totalNodes > 0 ? 'ACTIVE' : 'IDLE'}
                </span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col bg-slate-900/50 p-3 rounded-lg border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">Total Nodes</span>
                    <span className="text-xl font-bold text-blue-400 font-mono">{totalNodes}</span>
                </div>
                
                <div className="flex flex-col bg-slate-900/50 p-3 rounded-lg border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">Total Edges</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">{totalEdges}</span>
                </div>
                
                <div className="flex flex-col bg-slate-900/50 p-3 rounded-lg border border-slate-800/60 col-span-2">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">Network Density</span>
                            <span className="text-xl font-bold text-amber-400 font-mono">{density.toFixed(1)}%</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">Algorithm</span>
                            <span className="text-sm font-bold text-slate-300 font-mono uppercase">{selectedGraphAlgorithm}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col bg-slate-900/50 p-3 rounded-lg border border-slate-800/60 col-span-2">
                    <h4 className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-2 border-b border-slate-800/60 pb-1">Traversal Configuration</h4>
                    
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] text-slate-400 font-mono">Start Node:</span>
                        {startNodeId ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-900/50 text-emerald-400 border border-emerald-800">{startNodeId}</span>
                        ) : (
                            <span className="text-[10px] text-slate-600 font-mono italic">Click a node</span>
                        )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-[11px] text-slate-400 font-mono">Target Node:</span>
                        {endNodeId ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-rose-900/50 text-rose-400 border border-rose-800">{endNodeId}</span>
                        ) : (
                            <span className="text-[10px] text-slate-600 font-mono italic">{isDijkstra ? 'Click a node' : 'Not required'}</span>
                        )}
                    </div>

                    {isDijkstra && isFinalStep && (
                        <div className="mt-3 pt-2 border-t border-slate-800/60 flex justify-between items-center">
                            <span className="text-[11px] text-slate-400 font-mono">Shortest Path Cost:</span>
                            <span className={`text-sm font-bold font-mono ${pathCost > 0 ? 'text-purple-400' : 'text-slate-500'}`}>
                                {pathCost > 0 ? pathCost : 'Unreachable'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
