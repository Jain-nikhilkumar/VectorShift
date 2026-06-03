// store.js — Enhanced with history (undo/redo), clipboard, selection, resize+position support

import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';

const MAX_HISTORY = 50;

export const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  nodeIDs: {},

  history: { past: [], future: [] },
  clipboard: null,
  selectedNodes: [],
  selectedEdges: [],
  cycleEdgeIds: [],

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

    const selected = changes.filter((c) => c.type === 'select');
    if (selected.length > 0) {
      const allSelected = get().nodes.filter((n) => n.selected).map((n) => n.id);
      set({ selectedNodes: allSelected });
    }
  },

  onEdgesChange: (changes) => {
    const impactful = changes.some((c) => c.type === 'remove');
    if (impactful) get().takeSnapshot();
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    get().takeSnapshot();
    set({
      edges: addEdge(
        {
          ...connection,
          type: 'smoothstep',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, height: 20, width: 20 },
        },
        get().edges
      ),
    });
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

  // NEW: used by 8-way resize when dragging from west/north edges
  updateNodePosition: (nodeId, x, y) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, position: { x, y } };
        }
        return node;
      }),
    });
  },

  deleteSelected: () => {
    const { nodes, edges, selectedNodes } = get();
    if (selectedNodes.length === 0) return;
    get().takeSnapshot();
    const remainingNodes = nodes.filter((n) => !selectedNodes.includes(n.id));
    const remainingEdges = edges.filter(
      (e) => !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target)
    );
    set({ nodes: remainingNodes, edges: remainingEdges, selectedNodes: [] });
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
      id: `e-${idMap[e.source]}-${idMap[e.target]}-${Date.now()}`,
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

  clearAll: () => {
    get().takeSnapshot();
    set({ nodes: [], edges: [], selectedNodes: [], cycleEdgeIds: [] });
  },

  loadPipeline: ({ nodes, edges, nodeIDs }) => {
    get().takeSnapshot();
    set({
      nodes: nodes || [],
      edges: edges || [],
      nodeIDs: nodeIDs || {},
      selectedNodes: [],
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
