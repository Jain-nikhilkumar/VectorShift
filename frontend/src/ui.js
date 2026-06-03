// ui.js — Main pipeline canvas

import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap, BackgroundVariant } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { NODE_TYPES, getNodeColor } from './nodes/nodeRegistry';
import { EmptyState } from './components/EmptyState';
import 'reactflow/dist/style.css';

const proOptions = { hideAttribution: true };

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const {
    nodes, edges, getNodeID, addNode,
    onNodesChange, onEdgesChange, onConnect,
  } = useStore(selector, shallow);

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
        proOptions={proOptions}
        connectionLineType="smoothstep"
        defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode={null}  // we handle delete via shortcuts hook
        multiSelectionKeyCode="Shift"
      >
        {/* Whiteboard-style dot grid */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="var(--bg-dot)"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => getNodeColor(n.type)}
          maskColor="rgba(0,0,0,0.1)"
          pannable
          zoomable
        />
        {nodes.length === 0 && <EmptyState />}
      </ReactFlow>
    </div>
  );
};
