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
    // Frames render BEHIND other nodes - prepend them
    if (node.type === 'shape_frame') {
      set({ nodes: [node, ...get().nodes] });
    } else {
      set({ nodes: [...get().nodes, node] });
    }
  },

  // ---------- FRAME / GROUP MANAGEMENT ----------

  // Create a frame around selected nodes (or empty frame if none selected)
  createFrameFromSelection: (centerX, centerY) => {
    get().takeSnapshot();
    const { nodes, selectedNodes, nodeIDs } = get();
    const newIDs = { ...nodeIDs };
    if (newIDs['shape_frame'] === undefined) newIDs['shape_frame'] = 0;
    newIDs['shape_frame'] += 1;
    const frameId = `shape_frame-${newIDs['shape_frame']}`;

    const targets = nodes.filter((n) => selectedNodes.includes(n.id) && n.type !== 'shape_frame');

    let frameNode;
    if (targets.length === 0) {
      // Empty frame at provided center
      frameNode = {
        id: frameId,
        type: 'shape_frame',
        position: { x: (centerX ?? 0) - 160, y: (centerY ?? 0) - 120 },
        data: { id: frameId, label: 'Frame', smartMode: false, width: 320, height: 240 },
      };
      set({ nodes: [frameNode, ...nodes], nodeIDs: newIDs });
    } else {
      // Compute bounding box of selected nodes
      const PADDING = 40;
      const minX = Math.min(...targets.map((n) => n.position.x));
      const minY = Math.min(...targets.map((n) => n.position.y));
      const maxX = Math.max(...targets.map((n) => n.position.x + (n.width || n.data?.width || 200)));
      const maxY = Math.max(...targets.map((n) => n.position.y + (n.height || n.data?.height || 100)));

      const frameX = minX - PADDING;
      const frameY = minY - PADDING - 24; // extra for label
      const frameW = (maxX - minX) + PADDING * 2;
      const frameH = (maxY - minY) + PADDING * 2 + 24;

      frameNode = {
        id: frameId,
        type: 'shape_frame',
        position: { x: frameX, y: frameY },
        data: { id: frameId, label: 'Frame', smartMode: false, width: frameW, height: frameH },
      };

      // Insert frame BEFORE other nodes (so it renders behind)
      const newNodes = [frameNode, ...nodes];
      set({ nodes: newNodes, nodeIDs: newIDs });
    }
    return frameId;
  },

  // Toggle a frame between simple (visual) and smart (parented children) mode
  toggleFrameSmartMode: (frameId) => {
    const { nodes } = get();
    const frame = nodes.find((n) => n.id === frameId);
    if (!frame || frame.type !== 'shape_frame') return;

    const newSmartMode = !(frame.data?.smartMode);
    const frameX = frame.position.x;
    const frameY = frame.position.y;
    const frameW = frame.data?.width || 320;
    const frameH = frame.data?.height || 240;

    if (newSmartMode) {
      // SIMPLE → SMART: find nodes whose center is inside the frame
      // Re-parent them and convert their absolute position to relative.
      const newNodes = nodes.map((n) => {
        if (n.id === frameId) {
          return { ...n, data: { ...n.data, smartMode: true } };
        }
        if (n.type === 'shape_frame' || n.parentNode) return n;  // skip other frames + already parented

        const cx = n.position.x + ((n.width || n.data?.width || 200) / 2);
        const cy = n.position.y + ((n.height || n.data?.height || 100) / 2);
        const isInside = cx >= frameX && cx <= frameX + frameW && cy >= frameY && cy <= frameY + frameH;

        if (isInside) {
          return {
            ...n,
            parentNode: frameId,
            extent: 'parent',
            position: { x: n.position.x - frameX, y: n.position.y - frameY },
          };
        }
        return n;
      });
      set({ nodes: newNodes });
    } else {
      // SMART → SIMPLE: detach children, convert relative position back to absolute
      const newNodes = nodes.map((n) => {
        if (n.id === frameId) {
          return { ...n, data: { ...n.data, smartMode: false } };
        }
        if (n.parentNode === frameId) {
          // Remove parent, restore absolute position
          // eslint-disable-next-line no-unused-vars
          const { parentNode, extent, ...rest } = n;
          return {
            ...rest,
            position: { x: n.position.x + frameX, y: n.position.y + frameY },
          };
        }
        return n;
      });
      set({ nodes: newNodes });
    }
  },

  onNodesChange: (changes) => {
    const impactful = changes.some(
      (c) => c.type === 'remove' || (c.type === 'position' && c.dragging === false)
    );
    if (impactful) get().takeSnapshot();

    // BEFORE applying removes: if a smart frame is being deleted, detach its children
    // (convert their position back to absolute and remove parentNode reference)
    const removingIds = new Set(
      changes.filter((c) => c.type === 'remove').map((c) => c.id)
    );

    let workingNodes = get().nodes;

    if (removingIds.size > 0) {
      // For each frame being removed, find its smart children and detach them
      const framesBeingRemoved = workingNodes.filter(
        (n) => removingIds.has(n.id) && n.type === 'shape_frame'
      );

      if (framesBeingRemoved.length > 0) {
        workingNodes = workingNodes.map((n) => {
          const parentFrame = framesBeingRemoved.find((f) => f.id === n.parentNode);
          if (parentFrame) {
            // Convert child position from relative → absolute, drop parent ref
            // eslint-disable-next-line no-unused-vars
            const { parentNode, extent, ...rest } = n;
            return {
              ...rest,
              position: {
                x: n.position.x + parentFrame.position.x,
                y: n.position.y + parentFrame.position.y,
              },
            };
          }
          return n;
        });
      }
    }

    set({ nodes: applyNodeChanges(changes, workingNodes) });

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

    const selectedSet = new Set(selectedNodes);

    // FIRST: For any smart frame being deleted, detach its children.
    // Convert their relative positions back to absolute coords, drop parentNode.
    const framesBeingDeleted = nodes.filter(
      (n) => selectedSet.has(n.id) && n.type === 'shape_frame'
    );
    const framePositions = new Map(framesBeingDeleted.map((f) => [f.id, f.position]));

    let workingNodes = nodes;
    if (framesBeingDeleted.length > 0) {
      workingNodes = nodes.map((n) => {
        // Child of a frame about to be deleted, and not itself being deleted
        if (n.parentNode && framePositions.has(n.parentNode) && !selectedSet.has(n.id)) {
          const framePos = framePositions.get(n.parentNode);
          // eslint-disable-next-line no-unused-vars
          const { parentNode, extent, ...rest } = n;
          return {
            ...rest,
            position: {
              x: n.position.x + framePos.x,
              y: n.position.y + framePos.y,
            },
          };
        }
        return n;
      });
    }

    // THEN: Remove the selected nodes and orphaned edges
    const remainingNodes = workingNodes.filter((n) => !selectedSet.has(n.id));
    const remainingEdges = edges.filter(
      (e) =>
        !selectedEdges.includes(e.id) &&
        !selectedSet.has(e.source) &&
        !selectedSet.has(e.target)
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
