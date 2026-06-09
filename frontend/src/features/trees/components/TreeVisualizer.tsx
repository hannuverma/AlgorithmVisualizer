import React, { useRef, useState, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { useTreeStore } from '../../../store/useTreeStore';

export const TreeVisualizer: React.FC = () => {
  const { timeline, currentStepIndex, generateTreeTimeline, inputValues, treeType, setIsPlaying } = useTreeStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

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
    // Only start drag if the click target is the container itself, not a node or button
    if ((e.target as HTMLElement).closest('[data-tree-node]')) return;
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
  const visitedSequence = currentStep.visited_sequence || [];

  const NODE_RADIUS = 20;

  return (
    <div className="glass-card w-full p-6 flex flex-col h-[500px] overflow-hidden select-none">
      <div className="mb-5 pb-3 border-b border-slate-800/50 flex flex-wrap justify-between items-center gap-4 z-10">
        <h2 className="text-[18px] font-semibold tracking-tight">Binary Search Tree</h2>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px] text-amber-500 flex items-center gap-1.5"><div className="w-2 h-2 border-2 border-amber-500 rounded-sm"></div>Comparing/Active</span>
          <span className="font-mono text-[12px] text-emerald-500 flex items-center gap-1.5"><div className="w-2 h-2 border-2 border-emerald-500 rounded-sm"></div>Inserted/Mutated</span>
          {visitedSequence.length > 0 && (
            <span className="font-mono text-[12px] text-blue-400 flex items-center gap-1.5"><div className="w-2 h-2 border-2 border-blue-400 rounded-sm"></div>Visited</span>
          )}
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

            const isChildActive = highlighted_nodes.includes(node.id) || mutated_nodes.includes(node.id);
            const isParentActive = highlighted_nodes.includes(parent.id) || mutated_nodes.includes(parent.id);
            const isActiveEdge = isChildActive && isParentActive;

            let edgeColor = "#334155"; // slate-700
            let edgeWidth = "2";
            let zIndex = 0;
            
            if (isActiveEdge) {
              zIndex = 5;
              if (mutated_nodes.includes(node.id)) {
                edgeColor = "#10b981"; // emerald-500
                edgeWidth = "3";
              } else {
                edgeColor = "#f59e0b"; // amber-500
                edgeWidth = "3";
              }
            }

            return (
              <line
                key={`edge-${node.id}-${parent.id}`}
                x1={node.x + NODE_RADIUS}
                y1={node.y + NODE_RADIUS}
                x2={parent.x + NODE_RADIUS}
                y2={parent.y + NODE_RADIUS}
                stroke={edgeColor}
                strokeWidth={edgeWidth}
                className="transition-all duration-300"
                style={{ zIndex }}
              />
            );
          })}
        </svg>

        {/* Nodes Layer (DOM) */}
        {nodes.map(node => {
          const isHighlighted = highlighted_nodes.includes(node.id);
          const isMutated = mutated_nodes.includes(node.id);
          const isVisited = visitedSequence.includes(node.value) && !isMutated && !isHighlighted;

          let borderClass = 'border-slate-600';
          let bgClass = 'bg-slate-800';

          if (isMutated) {
            borderClass = 'border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]';
            bgClass = 'bg-emerald-900/80';
          } else if (isHighlighted) {
            borderClass = 'border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]';
            bgClass = 'bg-amber-900/80';
          } else if (isVisited) {
            borderClass = 'border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.4)]';
            bgClass = 'bg-blue-900/70';
          }

          return (
            <div
              key={node.id}
              data-tree-node
              className="absolute"
              style={{
                left: node.x - 6,
                top: node.y - 6,
                width: NODE_RADIUS * 2 + 12,
                height: NODE_RADIUS * 2 + 12,
                zIndex: (isHighlighted || isMutated || hoveredNodeId === node.id) ? 20 : 1
              }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              {/* Visual circle */}
              <div
                className={`absolute flex items-center justify-center rounded-full border-2 transition-all duration-300 text-white font-mono text-sm ${borderClass} ${bgClass}`}
                style={{
                  left: 6,
                  top: 6,
                  width: NODE_RADIUS * 2,
                  height: NODE_RADIUS * 2,
                }}
              >
                {node.value}
              </div>
              {/* Delete button */}
              {hoveredNodeId === node.id && (
                <button
                  className="absolute bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] cursor-pointer shadow-md transition-colors"
                  style={{ top: 0, right: 0, zIndex: 30 }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={async (e) => {
                    e.stopPropagation();
                    setHoveredNodeId(null);
                    await generateTreeTimeline(inputValues, treeType, 'delete', undefined, node.id);
                    setIsPlaying(true);
                    
                    // Update input values so the deleted node doesn't respawn on next action
                    const store = useTreeStore.getState();
                    if (store.timeline && store.timeline.length > 0) {
                      const finalNodes = store.timeline[store.timeline.length - 1].nodes;
                      const newValues = [...finalNodes]
                        .sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x)
                        .map(n => n.value);
                      useTreeStore.setState({ inputValues: newValues });
                    }
                  }}
                  title="Delete node"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};
