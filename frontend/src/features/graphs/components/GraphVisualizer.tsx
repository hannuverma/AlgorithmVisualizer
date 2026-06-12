import React, { useRef, useMemo, useCallback, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { useGraphStore } from '../../../store/useGraphStore';

// Node type matching the store's GraphNodeSnapshot + force-graph internal fields
interface FGNode {
    id: string;
    x: number;
    y: number;
    z: number;
    value?: number | null;
    fx?: number;
    fy?: number;
    fz?: number;
    __highlighted?: boolean;
    __visited?: boolean;
}

export const GraphVisualizer: React.FC = () => {
    const { timeline, currentStepIndex, startNodeId, endNodeId, setStartNodeId, setEndNodeId } = useGraphStore();
    const currentStep = timeline[currentStepIndex];
    const fgRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Build graph data from current timeline step
    const graphData = useMemo(() => {
        if (!currentStep) return { nodes: [], links: [] };

        const highlightSet = new Set(currentStep.highlighted_nodes || []);
        const visitedSet = new Set(currentStep.visited_nodes || []);

        const nodes: FGNode[] = currentStep.nodes.map(n => ({
            ...n,
            __highlighted: highlightSet.has(n.id),
            __visited: visitedSet.has(n.id),
        }));

        const links = currentStep.edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            weight: e.weight,
        }));

        return { nodes, links };
    }, [currentStep]);

    // Auto-rotate camera gently on mount
    useEffect(() => {
        if (fgRef.current) {
            // Start a slow orbit
            const controls = fgRef.current.controls();
            if (controls) {
                controls.autoRotate = true;
                controls.autoRotateSpeed = 0.5;
            }
        }
    }, [graphData]);

    // Custom node rendering: glowing 3D spheres with ID labels
    const nodeThreeObject = useCallback((node: any) => {
        const n = node as FGNode;
        const group = new THREE.Group();

        // Determine color
        let color = 0x334155;     // slate-700 default
        let emissive = 0x000000;
        let emissiveIntensity = 0;

        if (n.__highlighted) {
            color = 0x3b82f6;     // blue-500
            emissive = 0x3b82f6;
            emissiveIntensity = 0.6;
        } else if (n.__visited) {
            color = 0x10b981;     // emerald-500
            emissive = 0x10b981;
            emissiveIntensity = 0.3;
        }

        // Core sphere
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(5, 16, 16),
            new THREE.MeshPhongMaterial({
                color,
                emissive,
                emissiveIntensity,
                transparent: true,
                opacity: 0.9,
                shininess: 80,
            })
        );
        group.add(sphere);

        // Selection rings (Start = Green, End = Red)
        if (n.id === startNodeId) {
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(6, 8, 32),
                new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
            );
            group.add(ring);
        } else if (n.id === endNodeId) {
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(6, 8, 32),
                new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
            );
            group.add(ring);
        } else if (n.__highlighted) {
            // Glow ring for highlighted nodes
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(6, 8, 32),
                new THREE.MeshBasicMaterial({
                    color: 0x3b82f6,
                    transparent: true,
                    opacity: 0.4,
                    side: THREE.DoubleSide,
                })
            );
            group.add(ring);
        }

        // Text sprite for node label
        const canvas = document.createElement('canvas');
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, size, size);
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = n.__highlighted ? '#eff6ff' : n.__visited ? '#ecfdf5' : '#e2e8f0';
        ctx.fillText(n.id, size / 2, size / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(10, 10, 1);
        sprite.position.set(0, 8, 0); // Float label above sphere
        group.add(sprite);

        return group;
    }, [startNodeId, endNodeId]);

    // Custom link styling
    const linkColor = useCallback((link: any) => {
        const pathEdges = currentStep?.path_edges || [];
        if (pathEdges.includes(link.id)) return '#3b82f6';
        return 'rgba(100, 116, 139, 0.4)';
    }, [currentStep]);

    const linkWidth = useCallback((link: any) => {
        const pathEdges = currentStep?.path_edges || [];
        if (pathEdges.includes(link.id)) return 3;
        return 1;
    }, [currentStep]);

    const handleNodeClick = useCallback((node: any) => {
        const n = node as FGNode;
        if (!startNodeId) {
            setStartNodeId(n.id);
        } else if (startNodeId === n.id) {
            setStartNodeId(null);
            if (endNodeId) {
                setStartNodeId(endNodeId);
                setEndNodeId(null);
            }
        } else if (!endNodeId) {
            setEndNodeId(n.id);
        } else if (endNodeId === n.id) {
            setEndNodeId(null);
        } else {
            // If both set and click third node, replace end node
            setEndNodeId(n.id);
        }
    }, [startNodeId, endNodeId, setStartNodeId, setEndNodeId]);

    if (!currentStep || currentStep.nodes.length === 0) {
        return (
            <div className="w-full h-[500px] flex items-center justify-center border border-slate-800/50 rounded-xl bg-[#0a0c10] shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzMzQxNTUiLz48L3N2Zz4=')] opacity-20"></div>
                <div className="z-10 flex flex-col items-center gap-3">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    <p className="text-slate-500 font-mono text-sm tracking-wide">Awaiting 3D network generation...</p>
                    <p className="text-slate-600 font-mono text-[10px]">Configure nodes & density, then generate</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full h-[500px] border border-slate-800/50 rounded-xl bg-[#050608] shadow-inner relative overflow-hidden">
            <ForceGraph3D
                ref={fgRef}
                graphData={graphData}
                width={containerRef.current?.clientWidth || 800}
                height={500}
                backgroundColor="#050608"
                nodeThreeObject={nodeThreeObject}
                nodeThreeObjectExtend={false}
                linkColor={linkColor}
                linkWidth={linkWidth}
                linkOpacity={0.6}
                linkDirectionalParticles={0}
                enableNodeDrag={false}
                warmupTicks={100}
                cooldownTicks={0}
                onNodeClick={handleNodeClick}
            />
            {/* Overlay info badge */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-3 pointer-events-none">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Nodes</span>
                <span className="text-sm font-mono text-blue-400 font-bold">{currentStep.nodes.length}</span>
                <span className="text-slate-700">|</span>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Edges</span>
                <span className="text-sm font-mono text-emerald-400 font-bold">{currentStep.edges.length}</span>
            </div>
            {/* Camera controls hint */}
            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm border border-slate-800/50 rounded-lg px-2 py-1 pointer-events-none">
                <span className="text-[9px] font-mono text-slate-600">🖱️ Drag to orbit • Scroll to zoom • Right-click to pan</span>
            </div>
        </div>
    );
};
