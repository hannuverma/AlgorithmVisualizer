// frontend/src/features/sorting/components/ComplexityChart.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useVisualizerStore } from '../../../store/useVisualizerStore';

export const ComplexityChart: React.FC = () => {
  const { timeline, currentStepIndex, currentOpsCount } = useVisualizerStore();

  const n = timeline.length > 0 ? timeline[0].array.length : 0;

  // 1. Generate theoretical data points up to size N
  // This builds our static comparison background curves
  const generateChartData = () => {
    if (n === 0) return [];
    const data = [];
    
    // We sample points across the scale of N to draw smooth curves
    for (let i = 1; i <= n; i++) {
      data.push({
        name: `N=${i}`,
        bestCase: i,              // O(N) - Linear
        averageCase: Math.pow(i, 2) * 0.5, // O(N^2) Scaled down slightly for visual balance
        worstCase: Math.pow(i, 2),  // O(N^2) - Quadratic
        // The current case line only renders up to where our active pointer is running
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
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-2xl flex flex-col gap-2">
      <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
        Operational Complexity Telemetry
      </h3>
      
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px' }}
              labelStyle={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }} />
            
            {/* Theoretical Boundary Lines */}
            <Line type="monotone" dataKey="bestCase" stroke="#10b981" strokeDasharray="5 5" dot={false} name="Best: O(N)" strokeWidth={1.5} />
            <Line type="monotone" dataKey="averageCase" stroke="#f59e0b" strokeDasharray="3 3" dot={false} name="Avg: O(N²)" strokeWidth={1.5} />
            <Line type="monotone" dataKey="worstCase" stroke="#ef4444" strokeDasharray="5 5" dot={false} name="Worst: O(N²)" strokeWidth={1.5} />
            
            {/* Live Active Case Execution Tracker Line */}
            <Line 
              type="monotone" 
              dataKey="currentCase" 
              stroke="#3b82f6" 
              dot={false} 
              strokeWidth={3} 
              name="Current Run"
              activeDot={{ r: 6 }}
              className="animate-pulse"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};