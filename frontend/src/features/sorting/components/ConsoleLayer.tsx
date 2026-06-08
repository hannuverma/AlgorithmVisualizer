// frontend/src/features/sorting/components/ConsoleLayer.tsx
import React, { useEffect, useRef } from 'react';
export interface ConsoleLayerProps {
  timeline: { action_description: string }[];
  currentStepIndex: number;
}

export const ConsoleLayer: React.FC<ConsoleLayerProps> = ({ timeline, currentStepIndex }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentStepIndex]);

  if (!timeline || timeline.length === 0) {
    return null;
  }

  const logs = timeline.slice(0, currentStepIndex + 1);

  return (
    <div className="w-full mt-6 h-[120px]">
      {/* Raw Terminal Logs */}
      <div 
        ref={containerRef}
        className="bg-[#090a0c] border border-slate-800 rounded-xl p-4 font-mono text-[12px] overflow-y-auto shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] flex flex-col gap-1.5 h-full no-scrollbar"
      >
        {logs.map((step, idx) => (
            <div key={idx} className="flex gap-3 leading-relaxed">
                <span className="text-slate-600 shrink-0 select-none">[{idx.toString().padStart(4, '0')}]</span>
                <span className={idx === currentStepIndex ? "text-emerald-400" : "text-slate-300"}>
                    {step.action_description}
                </span>
            </div>
        ))}
      </div>

    </div>
  );
};
