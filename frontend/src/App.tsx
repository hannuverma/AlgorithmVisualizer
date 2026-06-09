// frontend/src/App.tsx
import React from 'react';
import { HeaderControls } from './features/sorting/components/HeaderControls';
import { BarChart } from './features/sorting/components/BarChart';
import { CountingSortChart } from './features/sorting/components/CountingSortChart';
import { ControlPanel } from './features/sorting/components/ControlPanel';
import { ConsoleLayer } from './features/sorting/components/ConsoleLayer';
import { useVisualizerStore } from './store/useVisualizerStore';
import { ComplexityChart } from './features/sorting/components/ComplexityChart';
import { useSortingPlayback } from './features/sorting/hooks/useSortingPlayback';
import { useTreeStore } from './store/useTreeStore';
import { useAppStore } from './store/useAppStore';
import { TreeVisualizer } from './features/trees/components/TreeVisualizer';
import { useTreePlayback } from './features/trees/hooks/useTreePlayback';

export const App: React.FC = () => {
  const { activeView } = useAppStore();
  const sortStore = useVisualizerStore();
  const treeStore = useTreeStore();
  
  useSortingPlayback();
  useTreePlayback();

  const isPlaying = activeView === 'sorting' ? sortStore.isPlaying : treeStore.isPlaying;
  const isLoading = activeView === 'sorting' ? sortStore.isLoading : treeStore.isLoading;
  const error = activeView === 'sorting' ? sortStore.error : treeStore.error;

  // Compute live tree metrics
  const currentTreeStep = treeStore.timeline[treeStore.currentStepIndex];
  const treeNodes = currentTreeStep?.nodes || [];
  const totalNodes = treeNodes.length;
  const leafNodes = treeNodes.filter((n: any) => n.is_leaf).length;
  const treeHeight = treeNodes.length > 0 ? Math.max(...treeNodes.map((n: any) => n.height || 1)) : 0;

  const isTreeBalanced = () => {
    if (treeNodes.length === 0) return true;
    const root = treeNodes.find((n: any) => !n.parent_id);
    if (!root) return true;
    let balanced = true;
    const checkHeight = (nodeId: string): number => {
        const children = treeNodes.filter((n: any) => n.parent_id === nodeId);
        const h1 = children.length > 0 ? checkHeight(children[0].id) : 0;
        const h2 = children.length > 1 ? checkHeight(children[1].id) : 0;
        if (Math.abs(h1 - h2) > 1) balanced = false;
        return Math.max(h1, h2) + 1;
    };
    checkHeight(root.id);
    return balanced;
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-500/30 font-sans">
      
      {/* Global Navigation and Controls */}
      <div className={`transition-all duration-500 overflow-hidden ${isPlaying ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
        <HeaderControls />
      </div>

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
          {activeView === 'sorting' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left 2 Columns hold the main sorting canvas visualizer */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {sortStore.algorithm === 'counting-sort' ? <CountingSortChart /> : <BarChart />}
                {sortStore.timeline.length > 0 && <ControlPanel 
                  isPlaying={sortStore.isPlaying}
                  setIsPlaying={sortStore.setIsPlaying}
                  currentStepIndex={sortStore.currentStepIndex}
                  timelineLength={sortStore.timeline.length}
                  playbackSpeed={sortStore.playbackSpeed}
                  setPlaybackSpeed={sortStore.setPlaybackSpeed}
                  nextStep={sortStore.nextStep}
                  prevStep={sortStore.prevStep}
                  resetPlayback={sortStore.resetPlayback}
                />}
              </div>

              {/* Right Column holds your advanced real-time telemetry card */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <ComplexityChart />
                <ConsoleLayer timeline={sortStore.timeline} currentStepIndex={sortStore.currentStepIndex} />
              </div>
            </div>
          ) : activeView === 'trees' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <TreeVisualizer />
                {treeStore.timeline.length > 0 && <ControlPanel 
                  isPlaying={treeStore.isPlaying}
                  setIsPlaying={treeStore.setIsPlaying}
                  currentStepIndex={treeStore.currentStepIndex}
                  timelineLength={treeStore.timeline.length}
                  playbackSpeed={treeStore.playbackSpeed}
                  setPlaybackSpeed={treeStore.setPlaybackSpeed}
                  nextStep={treeStore.nextStep}
                  prevStep={treeStore.prevStep}
                  resetPlayback={treeStore.resetPlayback}
                />}
              </div>
              <div className="lg:col-span-1 flex flex-col gap-3">
                <div className="glass-card w-full p-5 flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <h3 className="text-[13px] font-mono text-slate-400 border-b border-slate-800 pb-2 flex justify-between items-center">
                      Tree Metrics
                      <span className={`px-2 py-0.5 rounded text-[10px] ${isTreeBalanced() ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 'bg-rose-900/50 text-rose-400 border border-rose-800'}`}>
                        {isTreeBalanced() ? 'BALANCED' : 'UNBALANCED'}
                      </span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="flex flex-col bg-slate-900/50 p-3 rounded-lg border border-slate-800/60">
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">Total Nodes</span>
                          <span className="text-xl font-bold text-blue-400 font-mono">{totalNodes}</span>
                        </div>
                        <div className="flex flex-col bg-slate-900/50 p-3 rounded-lg border border-slate-800/60">
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">Leaf Nodes</span>
                          <span className="text-xl font-bold text-emerald-400 font-mono">{leafNodes}</span>
                        </div>
                        <div className="flex flex-col bg-slate-900/50 p-3 rounded-lg border border-slate-800/60 col-span-2">
                          <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">Tree Height (Depth)</span>
                              <span className="text-xl font-bold text-amber-400 font-mono">{treeHeight}</span>
                            </div>
                            <div className="flex flex-col text-right">
                              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">Type</span>
                              <span className="text-sm font-bold text-slate-300 font-mono uppercase">{treeStore.treeType} - {treeStore.treeAction}</span>
                            </div>
                          </div>
                        </div>
                    </div>
                </div>

                
                {['inorder', 'preorder', 'postorder', 'levelorder'].includes(treeStore.treeAction) ? (
                  <div className="glass-card w-full p-5 flex flex-col gap-2">
                    <h3 className="text-[13px] font-mono text-slate-400 border-b border-slate-800 pb-2">Output Sequence</h3>
                    <div className="flex flex-wrap gap-2 mt-2 min-h-[40px]">
                      {treeStore.timeline[treeStore.currentStepIndex]?.visited_sequence?.map((val: number, idx: number) => {
                        return (
                          <div key={idx} className="w-8 h-8 flex items-center justify-center font-mono text-xs rounded border transition-colors bg-amber-900/50 border-amber-500 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                            {val}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : treeStore.inputValues.length > 0 && (
                  <div className="glass-card w-full p-5 flex flex-col gap-2">
                    <h3 className="text-[13px] font-mono text-slate-400 border-b border-slate-800 pb-2">Input Sequence</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {treeStore.inputValues.map((val, idx) => {
                        const currentDesc = treeStore.timeline[treeStore.currentStepIndex]?.action_description || "";
                        // Highlight if the action description mentions "key {val}" or if it's the root node creation
                        const isActive = currentDesc.includes(`key ${val}`) || currentDesc.includes(`Created root node with value ${val}`);
                        
                        return (
                          <div key={idx} className={`w-8 h-8 flex items-center justify-center font-mono text-xs rounded border transition-colors ${isActive ? 'bg-amber-900/50 border-amber-500 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                            {val}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                <div className="glass-card w-full p-5 flex flex-col gap-2">
                    <h3 className="text-[13px] font-mono text-slate-400 border-b border-slate-800 pb-2">Tree Operations</h3>
                    <div className="flex gap-2 mt-2">
                        <input 
                            type="number" 
                            id="search-input-field"
                            placeholder="Enter value to search..." 
                            className="flex-1 bg-[#0f1115] text-slate-100 border border-slate-800 rounded px-3 py-1.5 text-[13px] font-mono focus:outline-none focus:border-blue-500"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = Number(e.currentTarget.value);
                                    if (!isNaN(val)) treeStore.generateTreeTimeline(treeStore.inputValues, treeStore.treeType, 'search', val);
                                    treeStore.setIsPlaying(!isPlaying)
                                }
                            }}
                        />
                        <button 
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-[13px] font-semibold transition-colors disabled:opacity-50"
                            disabled={isLoading || treeStore.inputValues.length === 0}
                            onClick={() => {
                                const input = document.getElementById('search-input-field') as HTMLInputElement;
                                if (input && !isNaN(Number(input.value))) {
                                    treeStore.generateTreeTimeline(treeStore.inputValues, treeStore.treeType, 'search', Number(input.value));
                                    treeStore.setIsPlaying(!isPlaying)
                                }
                            }}
                        >
                            Search
                        </button>
                    </div>
                </div>

                <ConsoleLayer timeline={treeStore.timeline} currentStepIndex={treeStore.currentStepIndex} />
              </div>
            </div>
          ) : (
             <div className="h-64 flex items-center justify-center text-slate-500 font-mono">
                View not implemented yet.
             </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-[#0f1115]/70 backdrop-blur-sm rounded-xl flex items-center justify-center border border-slate-800 z-50">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono text-blue-400 animate-pulse">Invoking python state calculation models...</p>
              </div>
            </div>
          )}
        </div>



        
      </main>
    </div>
  );
};

export default App;