import React, { useRef, useState, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { useTreeStore } from '../../../store/useTreeStore';

export const TreeVisualizer: React.FC = () => {
  const { timeline, currentStepIndex } = useTreeStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Determine the absolute max size of the tree from the final timeline step
    const finalNodes = timeline[timeline.length - 1]?.nodes || [];
    const maxTreeX = Math.max(...finalNodes.map(n => n.x), 500);
    const maxTreeY = Math.max(...finalNodes.map(n => n.y), 300);

    const clampPos = (x: number, y: number, currentScale: number) => {
      const cw = container.clientWidth || 800;
      const ch = container.clientHeight || 500;
      
      const minX = -(maxTreeX * currentScale) + 100;
      const maxX = cw - 100;
      
      const minY = -(maxTreeY * currentScale) + 100;
      const maxY = ch - 100;

      return {
        x: Math.min(Math.max(x, minX), maxX),
        y: Math.min(Math.max(y, minY), maxY)
      };
    };

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.altKey) {
        // Zoom
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setScale(prevScale => {
          const newScale = Math.min(Math.max(prevScale * zoomFactor, 0.1), 5);
          const actualZoom = newScale / prevScale;
          
          setPosition(prevPos => {
            const newX = mouseX - (mouseX - prevPos.x) * actualZoom;
            const newY = mouseY - (mouseY - prevPos.y) * actualZoom;
            return clampPos(newX, newY, newScale);
          });
          
          return newScale;
        });
      } else {
        // Pan
        setPosition(prev => clampPos(prev.x - e.deltaX, prev.y - e.deltaY, scale));
      }
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleNativeWheel);
  }, [timeline, scale]);

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const container = containerRef.current;
    if (!container) return;

    const finalNodes = timeline[timeline.length - 1]?.nodes || [];
    const maxTreeX = Math.max(...finalNodes.map(n => n.x), 500);
    const maxTreeY = Math.max(...finalNodes.map(n => n.y), 300);

    const clampPos = (x: number, y: number, currentScale: number) => {
      const cw = container.clientWidth || 800;
      const ch = container.clientHeight || 500;
      const minX = -(maxTreeX * currentScale) + 100;
      const maxX = cw - 100;
      const minY = -(maxTreeY * currentScale) + 100;
      const maxY = ch - 100;
      return {
        x: Math.min(Math.max(x, minX), maxX),
        y: Math.min(Math.max(y, minY), maxY)
      };
    };

    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    
    setPosition(prev => clampPos(prev.x + dx, prev.y + dy, scale));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 border border-dashed border-slate-700 rounded-xl">
        Generate a tree to begin visualization
      </div>
    );
  }

  const currentStep = timeline[currentStepIndex];
  const { nodes, highlighted_nodes, mutated_nodes } = currentStep;

  const NODE_RADIUS = 20;

  return (
    <div className="glass-card w-full p-6 flex flex-col h-[500px] overflow-hidden select-none">
      <div className="mb-5 pb-3 border-b border-slate-800/50 flex flex-wrap justify-between items-center gap-4 z-10">
        <h2 className="text-[18px] font-semibold tracking-tight">Binary Search Tree</h2>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px] text-amber-500 flex items-center gap-1.5"><div className="w-2 h-2 border-2 border-amber-500 rounded-sm"></div>Comparing/Active</span>
          <span className="font-mono text-[12px] text-emerald-500 flex items-center gap-1.5"><div className="w-2 h-2 border-2 border-emerald-500 rounded-sm"></div>Inserted/Mutated</span>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative flex-1 cursor-grab active:cursor-grabbing overflow-hidden border border-slate-800/50 rounded-lg bg-[#090a0c]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="absolute origin-top-left"
          style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
        >
          {/* Edges Layer (SVG) */}
          <svg className="absolute top-0 left-0 overflow-visible pointer-events-none">
            {nodes.map(node => {
            if (!node.parent_id) return null;
            const parent = nodes.find(n => n.id === node.parent_id);
            if (!parent) return null;

            return (
              <line
                key={`edge-${node.id}-${parent.id}`}
                x1={node.x + NODE_RADIUS}
                y1={node.y + NODE_RADIUS}
                x2={parent.x + NODE_RADIUS}
                y2={parent.y + NODE_RADIUS}
                stroke="#334155" // slate-700
                strokeWidth="2"
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* Nodes Layer (DOM) */}
        {nodes.map(node => {
          const isHighlighted = highlighted_nodes.includes(node.id);
          const isMutated = mutated_nodes.includes(node.id);

          let borderClass = 'border-slate-600';
          let bgClass = 'bg-slate-800';

          if (isMutated) {
            borderClass = 'border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]';
            bgClass = 'bg-emerald-900/80';
          } else if (isHighlighted) {
            borderClass = 'border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]';
            bgClass = 'bg-amber-900/80';
          }

          return (
            <div
              key={node.id}
              className={`absolute flex items-center justify-center rounded-full border-2 transition-all duration-300 text-white font-mono text-sm ${borderClass} ${bgClass}`}
              style={{
                left: node.x,
                top: node.y,
                width: NODE_RADIUS * 2,
                height: NODE_RADIUS * 2,
                zIndex: isHighlighted || isMutated ? 10 : 1
              }}
            >
              {node.value}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};
