// hooks/useLiveDAG.js
// Runs DAG check locally (no backend call) on every nodes/edges change.
// Shapes (diagram nodes) are EXCLUDED — they're visual annotations, not data pipelines.
// Only pipeline nodes are validated for cycles.

import { useMemo } from 'react';
import { useStore } from '../store';

// Shape nodes (rectangle, circle, etc.) are NOT part of the data pipeline
const isShapeNode = (type) => type?.startsWith('shape_');

export const useLiveDAG = () => {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);

  return useMemo(() => {
    // Only consider pipeline nodes — shapes are visual, not data flow
    const pipelineNodes = nodes.filter((n) => !isShapeNode(n.type));

    if (pipelineNodes.length === 0) return { isDag: true, cycleEdgeIds: [] };

    const nodeIds = new Set(pipelineNodes.map((n) => n.id));
    const adj = {};
    nodeIds.forEach((id) => (adj[id] = []));

    // Only count edges between pipeline nodes
    edges.forEach((e) => {
      if (nodeIds.has(e.source) && nodeIds.has(e.target)) {
        adj[e.source].push({ target: e.target, edgeId: e.id });
      }
    });

    const color = {};
    nodeIds.forEach((id) => (color[id] = 0));
    const cycleEdgeIds = [];

    const dfs = (u) => {
      color[u] = 1;
      for (const { target: v, edgeId } of adj[u]) {
        if (color[v] === 1) {
          cycleEdgeIds.push(edgeId);
        } else if (color[v] === 0) {
          dfs(v);
        }
      }
      color[u] = 2;
    };

    for (const id of nodeIds) {
      if (color[id] === 0) dfs(id);
    }

    return {
      isDag: cycleEdgeIds.length === 0,
      cycleEdgeIds,
    };
  }, [nodes, edges]);
};
