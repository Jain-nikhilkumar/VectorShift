// store.js — Full state management with edge editing, selection, history

import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';

const MAX_HISTORY = 50;

// Default edge style
const DEFAULT_EDGE_STYLE = {
  type: 'editable',
  stroke: '#6366f1',
  strokeWidth: 2,
  strokeDasharray: '',
  animated: true,
  label: '',
};

export const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  nodeIDs: {},

  history: { past: [], future: [] },
  clipboard: null,

  selectedNodes: [],
  selectedEdges: [],

  cycleEdgeIds: [],

  // ---------- HISTORY ----------
  takeSnapshot: () => {
    const { nodes, edges, history } = get();
    const past = [
      ...history.past,
      { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) },
    ].slice(-MAX_HISTORY);
    set({ history: { past, future: [] } });
  },

  undo: () => {
    const { history, nodes, edges } = get();
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);
    set({
      nodes: previous.nodes,
      edges: previous.edges,
      history: {
        past: newPast,
        future: [
          { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) },
          ...history.future,
        ].slice(0, MAX_HISTORY),
      },
    });
  },

  redo: () => {
    const { history, nodes, edges } = get();
    if (history.future.length === 0) return;
    const next = history.future[0];
    const newFuture = history.future.slice(1);
    set({
      nodes: next.nodes,
      edges: next.edges,
      history: {
        past: [
          ...history.past,
          { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) },
        ].slice(-MAX_HISTORY),
        future: newFuture,
      },
    });
  },

  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,

  // ---------- NODES ----------
  getNodeID: (type) => {
    const newIDs = { ...get().nodeIDs };
    if (newIDs[type] === undefined) newIDs[type] = 0;
    newIDs[type] += 1;
    set({ nodeIDs: newIDs });
    return `${type}-${newIDs[type]}`;
  },

  addNode: (node) => {
    get().takeSnapshot();
    set({ nodes: [...get().nodes, node] });
  },

  onNodesChange: (changes) => {
    const impactful = changes.some(
      (c) => c.type === 'remove' || (c.type === 'position' && c.dragging === false)
    );
    if (impactful) get().takeSnapshot();
    set({ nodes: applyNodeChanges(changes, get().nodes) });

    // Update selection
    const allSelected = get().nodes.filter((n) => n.selected).map((n) => n.id);
    set({ selectedNodes: allSelected });
  },

  updateNodeField: (nodeId, fieldName, fieldValue) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, [fieldName]: fieldValue };
        }
        return node;
      }),
    });
  },

  updateNodeSize: (nodeId, width, height) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, width, height };
        }
        return node;
      }),
    });
  },

  setNodePosition: (nodeId, x, y) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, position: { x, y } } : node
      ),
    });
  },

  // ---------- EDGES ----------
  onEdgesChange: (changes) => {
    const impactful = changes.some((c) => c.type === 'remove');
    if (impactful) get().takeSnapshot();
    set({ edges: applyEdgeChanges(changes, get().edges) });

    const allSelected = get().edges.filter((e) => e.selected).map((e) => e.id);
    set({ selectedEdges: allSelected });
  },

  onConnect: (connection) => {
    get().takeSnapshot();
    const newEdge = {
      ...connection,
      id: `e-${connection.source}-${connection.target}-${Date.now()}`,
      type: DEFAULT_EDGE_STYLE.type,
      animated: DEFAULT_EDGE_STYLE.animated,
      style: {
        stroke: DEFAULT_EDGE_STYLE.stroke,
        strokeWidth: DEFAULT_EDGE_STYLE.strokeWidth,
      },
      data: {
        pathType: 'smoothstep',
        midpointOffset: { x: 0, y: 0 },
        strokeStyle: 'solid',
      },
      markerEnd: { type: MarkerType.ArrowClosed, height: 18, width: 18, color: DEFAULT_EDGE_STYLE.stroke },
    };
    set({ edges: addEdge(newEdge, get().edges) });
  },

  updateEdge: (edgeId, updates) => {
    set({
      edges: get().edges.map((e) => {
        if (e.id !== edgeId) return e;
        const merged = { ...e, ...updates };
        // Merge nested objects properly
        if (updates.style) merged.style = { ...e.style, ...updates.style };
        if (updates.data) merged.data = { ...e.data, ...updates.data };
        if (updates.markerEnd) merged.markerEnd = { ...e.markerEnd, ...updates.markerEnd };
        return merged;
      }),
    });
  },

  deleteEdge: (edgeId) => {
    get().takeSnapshot();
    set({
      edges: get().edges.filter((e) => e.id !== edgeId),
      selectedEdges: get().selectedEdges.filter((id) => id !== edgeId),
    });
  },

  // ---------- SELECTION ACTIONS ----------
  deleteSelected: () => {
    const { nodes, edges, selectedNodes, selectedEdges } = get();
    if (selectedNodes.length === 0 && selectedEdges.length === 0) return;
    get().takeSnapshot();

    const remainingNodes = nodes.filter((n) => !selectedNodes.includes(n.id));
    const remainingEdges = edges.filter(
      (e) =>
        !selectedEdges.includes(e.id) &&
        !selectedNodes.includes(e.source) &&
        !selectedNodes.includes(e.target)
    );
    set({
      nodes: remainingNodes,
      edges: remainingEdges,
      selectedNodes: [],
      selectedEdges: [],
    });
  },

  copySelected: () => {
    const { nodes, edges, selectedNodes } = get();
    if (selectedNodes.length === 0) return null;
    const copyNodes = nodes.filter((n) => selectedNodes.includes(n.id));
    const copyEdges = edges.filter(
      (e) => selectedNodes.includes(e.source) && selectedNodes.includes(e.target)
    );
    const clipboard = { nodes: copyNodes, edges: copyEdges };
    set({ clipboard });
    return clipboard;
  },

  paste: (offsetX = 30, offsetY = 30) => {
    const { clipboard, nodes, edges } = get();
    if (!clipboard) return;
    get().takeSnapshot();

    const idMap = {};
    const newNodes = clipboard.nodes.map((n) => {
      const newId = get().getNodeID(n.type);
      idMap[n.id] = newId;
      return {
        ...n,
        id: newId,
        position: { x: n.position.x + offsetX, y: n.position.y + offsetY },
        data: { ...n.data, id: newId },
        selected: true,
      };
    });

    const newEdges = clipboard.edges.map((e) => ({
      ...e,
      id: `e-${idMap[e.source]}-${idMap[e.target]}-${Date.now()}-${Math.random()}`,
      source: idMap[e.source],
      target: idMap[e.target],
      sourceHandle: e.sourceHandle?.replace(e.source, idMap[e.source]),
      targetHandle: e.targetHandle?.replace(e.target, idMap[e.target]),
    }));

    set({
      nodes: [...nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
      edges: [...edges, ...newEdges],
      selectedNodes: newNodes.map((n) => n.id),
    });
  },

  duplicateSelected: () => {
    get().copySelected();
    get().paste(30, 30);
  },

  // ---------- BULK ----------
  clearAll: () => {
    get().takeSnapshot();
    set({ nodes: [], edges: [], selectedNodes: [], selectedEdges: [], cycleEdgeIds: [] });
  },

  loadPipeline: ({ nodes, edges, nodeIDs }) => {
    get().takeSnapshot();
    set({
      nodes: nodes || [],
      edges: edges || [],
      nodeIDs: nodeIDs || {},
      selectedNodes: [],
      selectedEdges: [],
      cycleEdgeIds: [],
    });
  },

  setCycleEdges: (edgeIds) => {
    set({ cycleEdgeIds: edgeIds || [] });
    set({
      edges: get().edges.map((e) => ({
        ...e,
        className: edgeIds?.includes(e.id) ? 'cycle-edge' : '',
      })),
    });
  },
}));
