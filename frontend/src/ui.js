// ui.js — Main canvas with custom edges, context menu, grid settings

import { useState, useRef, useCallback, useEffect } from 'react';

import ReactFlow, { Controls, Background, MiniMap, BackgroundVariant } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { NODE_TYPES, getNodeColor } from './nodes/nodeRegistry';
import { EditableEdge } from './edges/EditableEdge';
import { EmptyState } from './components/EmptyState';
import { ContextMenu } from './components/ContextMenu';
import { useLiveDAG } from './hooks/useLiveDAG';
import 'reactflow/dist/style.css';

const proOptions = { hideAttribution: true };

const edgeTypes = {
  editable: EditableEdge,
};

const selector = (s) => ({
  nodes: s.nodes,
  edges: s.edges,
  getNodeID: s.getNodeID,
  addNode: s.addNode,
  onNodesChange: s.onNodesChange,
  onEdgesChange: s.onEdgesChange,
  onConnect: s.onConnect,
  setCycleEdges: s.setCycleEdges,
});

export const PipelineUI = ({ gridSettings }) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const {
    nodes, edges, getNodeID, addNode,
    onNodesChange, onEdgesChange, onConnect, setCycleEdges,
  } = useStore(selector, shallow);

  // Live DAG detection — auto-highlight cycle edges
  const { cycleEdgeIds } = useLiveDAG();

  useEffect(() => {
    setCycleEdges(cycleEdgeIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleEdgeIds.join(',')]);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const raw = event.dataTransfer.getData('application/reactflow');
      if (!raw) return;
      const { nodeType } = JSON.parse(raw);
      if (!nodeType || !reactFlowInstance) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const nodeID = getNodeID(nodeType);
      addNode({
        id: nodeID,
        type: nodeType,
        position,
        data: { id: nodeID, nodeType },
      });
    },
    [reactFlowInstance, getNodeID, addNode]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Context menus
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({ type: 'node', x: event.clientX, y: event.clientY, targetId: node.id });
  }, []);

  const onEdgeContextMenu = useCallback((event, edge) => {
    event.preventDefault();
    setContextMenu({ type: 'edge', x: event.clientX, y: event.clientY, targetId: edge.id });
  }, []);

  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault();
    setContextMenu({ type: 'canvas', x: event.clientX, y: event.clientY });
  }, []);

  const onPaneClick = useCallback(() => setContextMenu(null), []);

  // Grid configuration
  const showBackground = gridSettings.gridType !== 'none';
  const backgroundVariant = gridSettings.gridType === 'lines'
    ? BackgroundVariant.Lines
    : BackgroundVariant.Dots;

  return (
    <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={NODE_TYPES}
        edgeTypes={edgeTypes}
        proOptions={proOptions}
        connectionLineType="smoothstep"
        connectionLineStyle={{ stroke: 'var(--accent-primary)', strokeWidth: 2 }}
        defaultEdgeOptions={{ type: 'editable' }}
        fitView
        snapToGrid={gridSettings.snapEnabled}
        snapGrid={[gridSettings.snapSize, gridSettings.snapSize]}
        deleteKeyCode={null}  // handled by shortcuts hook
        multiSelectionKeyCode="Shift"
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={onPaneClick}
        elevateEdgesOnSelect
      >
        {showBackground && (
          <Background
            variant={backgroundVariant}
            gap={20}
            size={gridSettings.gridType === 'lines' ? 1 : 1.5}
            color="var(--bg-dot)"
          />
        )}
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => getNodeColor(n.type)}
          maskColor="rgba(0,0,0,0.1)"
          pannable zoomable
        />
        {nodes.length === 0 && <EmptyState />}
      </ReactFlow>

      <ContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />
    </div>
  );
};
