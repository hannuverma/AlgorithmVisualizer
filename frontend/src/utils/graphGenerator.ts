export interface GraphNode {
    id: string;
    x: number;
    y: number;
    z: number;
    value?: number;
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    weight: number;
}

export interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

export const generateRandomGraph = (
    numNodes: number,
    edgeProbability: number = 0.3,
    width: number = 600,
    height: number = 600,
    depth: number = 600
): GraphData => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    
    // Generate nodes
    for (let i = 0; i < numNodes; i++) {
        const id = i < 26 ? String.fromCharCode(65 + i) : `N${i}`; // A, B, C...
        // Random placement in 3D space centered at origin
        const halfW = width / 2;
        const halfH = height / 2;
        const halfD = depth / 2;
        const x = Math.round((Math.random() * width - halfW) * 100) / 100;
        const y = Math.round((Math.random() * height - halfH) * 100) / 100;
        const z = Math.round((Math.random() * depth - halfD) * 100) / 100;
        
        nodes.push({ id, x, y, z });
    }
    
    // Generate edges
    for (let i = 0; i < numNodes; i++) {
        for (let j = i + 1; j < numNodes; j++) {
            if (Math.random() <= edgeProbability) {
                const source = nodes[i];
                const target = nodes[j];
                
                // Calculate 3D euclidean distance for edge weight
                const dx = source.x - target.x;
                const dy = source.y - target.y;
                const dz = source.z - target.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                const weight = Math.max(1, Math.round(distance / 10));
                
                edges.push({
                    id: `edge_${source.id}_${target.id}`,
                    source: source.id,
                    target: target.id,
                    weight
                });
            }
        }
    }
    
    // Ensure the graph is at least weakly connected (connect orphans)
    for (let i = 1; i < numNodes; i++) {
        const hasEdge = edges.some(e => e.source === nodes[i].id || e.target === nodes[i].id);
        if (!hasEdge) {
            const targetIdx = Math.floor(Math.random() * i);
            const source = nodes[i];
            const target = nodes[targetIdx];
            
            const dx = source.x - target.x;
            const dy = source.y - target.y;
            const dz = source.z - target.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const weight = Math.max(1, Math.round(distance / 10));
            
            edges.push({
                id: `edge_${source.id}_${target.id}`,
                source: source.id,
                target: target.id,
                weight
            });
        }
    }
    
    return { nodes, edges };
};
