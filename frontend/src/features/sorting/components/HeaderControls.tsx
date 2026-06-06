// frontend/src/features/sorting/components/HeaderControls.tsx
import React, { useState } from 'react';
import { useVisualizerStore } from '../../../store/useVisualizerStore';

export const HeaderControls: React.FC = () => {
  const { generateSortingTimeline, isLoading } = useVisualizerStore();
  const [selectedAlgo, setSelectedAlgo] = useState('bubble-sort');
  const [inputType, setInputType] = useState<'random' | 'custom'>('random');
  const [arraySize, setArraySize] = useState(20);
  const [customArrayStr, setCustomArrayStr] = useState('15, 8, 25, 4, 30');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleGenerateArray = () => {
    setInputError(null);
    let newArray: number[] = [];

    if (inputType === 'random') {
      newArray = Array.from({ length: arraySize }, () => 
        Math.floor(Math.random() * 190) + 10 // Values between 10 and 200
      );
    } else {
      // Parse custom array
      const parsed = customArrayStr.split(',').map((s) => s.trim()).filter((s) => s !== '');
      if (parsed.length === 0) {
        setInputError('Array cannot be empty');
        return;
      }
      
      for (const str of parsed) {
        const num = Number(str);
        if (isNaN(num)) {
          setInputError(`Invalid number: "${str}"`);
          return;
        }
        newArray.push(num);
      }
    }
    
    // Pass the raw array to the backend to get the timeline execution sequence
    generateSortingTimeline(selectedAlgo, newArray);
  };

  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-2 flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Logo Area */}
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <div className="font-sans text-base font-semibold tracking-tight flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            Arch Visualizer Core
          </div>
        </div>

        {/* Segmented Control Tabs */}
        <div className="hidden lg:flex bg-black/30 border border-slate-800/80 rounded-lg p-1">
          <button className="bg-[#16191f] text-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.5)] border border-slate-700/50 px-4 py-1.5 text-[13px] font-medium rounded transition-all">Sorting Engines</button>
          <button className="text-slate-400 hover:text-slate-200 px-4 py-1.5 text-[13px] font-medium rounded transition-all">Network Graphs</button>
          <button className="text-slate-400 hover:text-slate-200 px-4 py-1.5 text-[13px] font-medium rounded transition-all">Tree Structures</button>
          <button className="text-slate-400 hover:text-slate-200 px-4 py-1.5 text-[13px] font-medium rounded transition-all">Telemetry Hub</button>
        </div>

        {/* Controls Area */}
        <div className="flex flex-wrap items-center gap-4 lg:gap-6 w-full lg:w-auto justify-between lg:justify-end">
          
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">Algorithm</span>
            <select
              value={selectedAlgo}
              onChange={(e) => setSelectedAlgo(e.target.value)}
              disabled={isLoading}
              className="bg-[#0f1115] text-slate-100 border border-slate-800 rounded px-3 py-1 text-[13px] font-mono focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              <option value="bubble-sort">Bubble Sort</option>
              <option value="insertion-sort">Insertion Sort</option>
              <option value="quick-sort">Quick Sort</option>
              <option value="selection-sort">Selection Sort</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
             <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">Mode</span>
             <select
              value={inputType}
              onChange={(e) => setInputType(e.target.value as 'random' | 'custom')}
              disabled={isLoading}
              className="bg-[#0f1115] text-slate-100 border border-slate-800 rounded px-3 py-1 text-[13px] font-mono focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              <option value="random">Random</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {inputType === 'random' ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">Size ({arraySize})</span>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                disabled={isLoading}
                className="w-20 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 relative">
              <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">Array</span>
              <input
                type="text"
                value={customArrayStr}
                onChange={(e) => {
                  setCustomArrayStr(e.target.value);
                  setInputError(null);
                }}
                disabled={isLoading}
                placeholder="10, 5, 20"
                className={`w-32 bg-[#0f1115] text-slate-100 border ${inputError ? 'border-rose-500' : 'border-slate-800'} rounded px-2 py-1 text-[13px] font-mono focus:outline-none focus:border-blue-500 disabled:opacity-50`}
              />
              {inputError && (
                <span className="absolute -bottom-4 left-10 text-[10px] text-rose-500 font-mono whitespace-nowrap">
                  {inputError}
                </span>
              )}
            </div>
          )}

          <button
            onClick={handleGenerateArray}
            disabled={isLoading}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded text-[13px] shadow-[0_0_12px_rgba(59,130,246,0.4)] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Computing...' : 'Generate & Sync Data'}
          </button>
        </div>
      </div>
    </header>
  );
};