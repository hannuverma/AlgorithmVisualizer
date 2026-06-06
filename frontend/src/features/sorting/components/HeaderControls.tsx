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
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-end justify-between gap-4 shadow-xl relative">
      <div className="flex flex-wrap items-start gap-4">
        {/* Algorithm Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono text-slate-400">Algorithm</label>
          <select
            value={selectedAlgo}
            onChange={(e) => setSelectedAlgo(e.target.value)}
            disabled={isLoading}
            className="h-9 bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-3 py-1 text-sm font-medium focus:outline-none focus:border-blue-500 disabled:opacity-50"
          >
            <option value="bubble-sort">Bubble Sort</option>
            <option value="insertion-sort">Insertion Sort</option>
          </select>
        </div>

        {/* Input Mode Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono text-slate-400">Input Mode</label>
          <select
            value={inputType}
            onChange={(e) => setInputType(e.target.value as 'random' | 'custom')}
            disabled={isLoading}
            className="h-9 bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-3 py-1 text-sm font-medium focus:outline-none focus:border-blue-500 disabled:opacity-50"
          >
            <option value="random">Random</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Array Configuration */}
        {inputType === 'random' ? (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono text-slate-400">Size ({arraySize})</label>
            <div className="flex items-center h-9 w-32">
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                disabled={isLoading}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(59,130,246,0.8)] [&::-webkit-slider-thumb]:hover:bg-blue-400 [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-all [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(59,130,246,0.8)] [&::-moz-range-thumb]:hover:bg-blue-400 [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-all"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1 relative">
            <label className="text-xs font-mono text-slate-400">Custom Array (comma separated)</label>
            <input
              type="text"
              value={customArrayStr}
              onChange={(e) => {
                setCustomArrayStr(e.target.value);
                setInputError(null);
              }}
              disabled={isLoading}
              placeholder="e.g. 10, 5, 20, 8"
              className={`h-9 bg-slate-950 text-slate-200 border ${inputError ? 'border-rose-500' : 'border-slate-800'} rounded-lg px-3 py-1 text-sm font-mono focus:outline-none focus:border-blue-500 disabled:opacity-50 w-48 sm:w-64`}
            />
            {inputError && (
              <span className="absolute -bottom-5 left-0 text-[10px] text-rose-500 font-mono whitespace-nowrap">
                {inputError}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <button
        onClick={handleGenerateArray}
        disabled={isLoading}
        className="px-5 h-9 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm shadow-md shadow-blue-900/30 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none self-end"
      >
        {isLoading ? 'Computing...' : 'Generate & Sync Data'}
      </button>
    </div>
  );
};