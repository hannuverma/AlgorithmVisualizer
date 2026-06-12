// frontend/src/features/sorting/components/ComplexityChart.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useVisualizerStore } from '../../../store/useVisualizerStore';

export const ComplexityChart: React.FC = () => {
  const { timeline, currentStepIndex, currentOpsCount, algorithm } = useVisualizerStore();

  const n = timeline.length > 0 ? timeline[0].array.length : 0;
  const max = timeline.length > 0 ? Math.max(...timeline[0].array) : 0;

  // 1. Generate theoretical data points up to size N
  // This builds our static comparison background curves
  const generateChartData = () => {
    if (n === 0) return [];
    const data = [];
    
    // We sample points across the scale of N to draw smooth curves
    for (let i = 1; i <= n; i++) {
      let bestCase = 0;
      let averageCase = 0;
      let worstCase = 0;

      if (algorithm === 'quick-sort') {
        bestCase = i * Math.log2(i);
        averageCase = i * Math.log2(i) * 1.5;
        worstCase = Math.pow(i, 2);
      } else if (algorithm === 'selection-sort') {
        bestCase = Math.pow(i, 2) * 0.5;
        averageCase = Math.pow(i, 2) * 0.75;
        worstCase = Math.pow(i, 2);
      } else if (algorithm === 'counting-sort') {
        bestCase = i + max;                   // O(N + K): one pass to count, one to place
        averageCase = 2 * i + max;              // O(2N + K): count + prefix sum + placement
        worstCase = 3 * i + max;                // O(3N + K): all phases with full iteration
      } else {
        // bubble-sort, insertion-sort
        bestCase = i;
        averageCase = Math.pow(i, 2) * 0.5;
        worstCase = Math.pow(i, 2);
      }

      data.push({
        name: `N=${i}`,
        bestCase,
        averageCase,
        worstCase,
        currentCase: i <= Math.ceil((currentStepIndex / timeline.length) * n) ? currentOpsCount : null
      });
    }
    return data;
  };

  const chartData = generateChartData();

  if (n === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-500 border border-slate-800 rounded-xl bg-slate-900/50">
        Waiting for telemetry sync...
      </div>
    );
  }

  return (
    <div className="glass-card w-full p-6 flex flex-col min-h-[400px]">
      <div className="mb-5 pb-3 border-b border-slate-800/50 flex justify-between items-center">
        <h2 className="text-[18px] font-semibold tracking-tight">Complexity Telemetry</h2>
      </div>
      
      <div className="h-56 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px' }}
              labelStyle={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px' }}
            />
            
            {/* Theoretical Boundary Lines */}
            <Line type="monotone" dataKey="worstCase" stroke="#ef4444" strokeDasharray="5 5" dot={false} name="Worst Case" strokeWidth={1.5} />
            <Line type="monotone" dataKey="averageCase" stroke="#94a3b8" strokeDasharray="3 3" dot={false} name="Average Case" strokeWidth={1.5} />
            <Line type="monotone" dataKey="bestCase" stroke="#10b981" strokeDasharray="5 5" dot={false} name="Best Case" strokeWidth={1.5} />
            
            {/* Live Active Case Execution Tracker Line */}
            <Line 
              type="monotone" 
              dataKey="currentCase" 
              stroke="#3b82f6" 
              dot={false} 
              strokeWidth={3} 
              name="Current Run"
              activeDot={{ r: 6, fill: "#fff" }}
              className="animate-pulse drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-rose-500 rounded-sm"></div> Worst Case {algorithm === 'counting-sort' ? 'O(N + K)' : 'O(N²)'}</div> <span>{algorithm === 'counting-sort' ? 'Linear' : 'Quadratic'}</span></div>
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-400 rounded-sm"></div> Average {algorithm === 'quick-sort' ? 'O(N log N)' : algorithm === 'counting-sort' ? 'O(N + K)' : 'O(N²)'}
          </div> 
          <span>{algorithm === 'quick-sort' ? 'Linearithmic' : algorithm === 'counting-sort' ? 'Linear' : 'Quadratic'}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-sm"></div> Best Case {algorithm === 'quick-sort' ? 'O(N log N)' : algorithm === 'selection-sort' ? 'O(N²)' : algorithm === 'counting-sort' ? 'O(N + K)' : 'O(N)'}
          </div> 
          <span>{algorithm === 'quick-sort' ? 'Linearithmic' : algorithm === 'selection-sort' ? 'Quadratic' : 'Linear'}</span>
        </div>
        <div className="flex justify-between items-center text-[11px] font-mono text-slate-200 mt-2 pt-2 border-t border-slate-800"><div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.8)] rounded-sm"></div> Current Run</div> <span className="font-bold">{currentOpsCount} Ops</span></div>
      </div>
    </div>
  );
};