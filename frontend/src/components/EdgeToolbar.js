// components/EdgeToolbar.js — Canva-style floating toolbar
// FIXED: Uses v11.8-compatible API (manual viewport math instead of flowToScreenPosition)

import { useEffect, useState } from 'react';
import { useStore as useReactFlowStore } from 'reactflow';
import { useStore } from '../store';
import { Trash2, Settings2, Spline, Minus, MoveDown, CornerDownRight } from 'lucide-react';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#1e293b',
];

const PATH_TYPES = [
  { value: 'smoothstep', icon: <Spline size={14} />, label: 'Curved' },
  { value: 'straight',   icon: <Minus size={14} />, label: 'Straight' },
  { value: 'step',       icon: <CornerDownRight size={14} />, label: 'Step' },
  { value: 'bezier',     icon: <MoveDown size={14} />, label: 'Bezier' },
];

const WEIGHTS = [
  { value: 1, label: 'Thin' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Thick' },
  { value: 5, label: 'Heavy' },
];

const STROKE_STYLES = [
  { value: 'solid',  label: '━' },
  { value: 'dashed', label: '╌' },
  { value: 'dotted', label: '⋯' },
];

export const EdgeToolbar = ({ onOpenPanel }) => {
  const edges = useStore((s) => s.edges);
  const selectedEdges = useStore((s) => s.selectedEdges);
  const updateEdge = useStore((s) => s.updateEdge);
  const deleteEdge = useStore((s) => s.deleteEdge);

  // ✅ v11.8 API: use reactflow's store directly to get transform & nodeInternals
  const transform = useReactFlowStore((s) => s.transform);  // [x, y, zoom]
  const nodeInternals = useReactFlowStore((s) => s.nodeInternals);

  const [position, setPosition] = useState(null);

  const selectedEdge = selectedEdges.length === 1
    ? edges.find((e) => e.id === selectedEdges[0])
    : null;

  // Compute screen position from flow coords manually
  useEffect(() => {
    if (!selectedEdge) {
      setPosition(null);
      return;
    }

    const sourceNode = nodeInternals.get(selectedEdge.source);
    const targetNode = nodeInternals.get(selectedEdge.target);
    if (!sourceNode || !targetNode) return;

    const sx = sourceNode.positionAbsolute?.x ?? sourceNode.position.x;
    const sy = sourceNode.positionAbsolute?.y ?? sourceNode.position.y;
    const tx = targetNode.positionAbsolute?.x ?? targetNode.position.x;
    const ty = targetNode.positionAbsolute?.y ?? targetNode.position.y;
    const sw = sourceNode.width || 240;
    const sh = sourceNode.height || 120;
    const tw = targetNode.width || 240;
    const th = targetNode.height || 120;

    const sourceCenterX = sx + sw / 2;
    const sourceCenterY = sy + sh / 2;
    const targetCenterX = tx + tw / 2;
    const targetCenterY = ty + th / 2;

    const offset = selectedEdge.data?.midpointOffset || { x: 0, y: 0 };
    const midFlowX = (sourceCenterX + targetCenterX) / 2 + offset.x;
    const midFlowY = (sourceCenterY + targetCenterY) / 2 + offset.y;

    // ✅ Manual flow → screen conversion
    const [vx, vy, zoom] = transform;

    // Find the React Flow renderer container for absolute positioning
    const rfRenderer = document.querySelector('.react-flow');
    if (!rfRenderer) return;
    const bounds = rfRenderer.getBoundingClientRect();

    const screenX = bounds.left + midFlowX * zoom + vx;
    const screenY = bounds.top + midFlowY * zoom + vy;

    setPosition({ x: screenX, y: screenY });
  }, [selectedEdge, nodeInternals, transform, edges]);

  if (!selectedEdge || !position) return null;

  const pathType = selectedEdge.data?.pathType || 'smoothstep';
  const strokeWidth = selectedEdge.style?.strokeWidth || 2;
  const stroke = selectedEdge.style?.stroke || '#6366f1';
  const strokeStyle = selectedEdge.data?.strokeStyle || 'solid';

  const updatePathType = (type) => {
    updateEdge(selectedEdge.id, { data: { ...selectedEdge.data, pathType: type } });
  };

  const updateColor = (color) => {
    updateEdge(selectedEdge.id, {
      style: { stroke: color },
      markerEnd: { ...selectedEdge.markerEnd, color },
    });
  };

  const updateWeight = (weight) => {
    updateEdge(selectedEdge.id, { style: { strokeWidth: weight } });
  };

  const updateStrokeStyle = (style) => {
    updateEdge(selectedEdge.id, { data: { ...selectedEdge.data, strokeStyle: style } });
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y - 64,
        transform: 'translateX(-50%)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-lg)',
        padding: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        zIndex: 100,
        animation: 'fadeIn 0.15s ease',
      }}
      className="edge-toolbar"
    >
      {/* Path type */}
      <div style={{ display: 'flex', gap: '2px', padding: '0 2px' }}>
        {PATH_TYPES.map((p) => (
          <button
            key={p.value}
            className="tooltip"
            data-tooltip={p.label}
            onClick={() => updatePathType(p.value)}
            style={{
              width: 30, height: 30,
              border: 'none',
              borderRadius: '6px',
              background: pathType === p.value ? 'var(--accent-primary)' : 'transparent',
              color: pathType === p.value ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {p.icon}
          </button>
        ))}
      </div>

      <Divider />

      {/* Colors */}
      <div style={{ display: 'flex', gap: '3px', padding: '0 4px' }}>
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => updateColor(c)}
            style={{
              width: 18, height: 18,
              borderRadius: '50%',
              background: c,
              border: stroke === c ? '2px solid var(--text-primary)' : '2px solid transparent',
              cursor: 'pointer',
              padding: 0,
              transition: 'transform 0.1s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ))}
      </div>

      <Divider />

      {/* Weight */}
      <div style={{ display: 'flex', gap: '2px', padding: '0 2px' }}>
        {WEIGHTS.map((w) => (
          <button
            key={w.value}
            className="tooltip"
            data-tooltip={w.label}
            onClick={() => updateWeight(w.value)}
            style={{
              width: 30, height: 30,
              border: 'none',
              borderRadius: '6px',
              background: strokeWidth === w.value ? 'var(--accent-primary)' : 'transparent',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{
              width: 14,
              height: w.value,
              background: strokeWidth === w.value ? 'white' : 'var(--text-secondary)',
              borderRadius: '1px',
            }} />
          </button>
        ))}
      </div>

      <Divider />

      {/* Stroke style */}
      <div style={{ display: 'flex', gap: '2px', padding: '0 2px' }}>
        {STROKE_STYLES.map((s) => (
          <button
            key={s.value}
            onClick={() => updateStrokeStyle(s.value)}
            style={{
              minWidth: 30, height: 30,
              border: 'none',
              borderRadius: '6px',
              background: strokeStyle === s.value ? 'var(--accent-primary)' : 'transparent',
              color: strokeStyle === s.value ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 700,
              padding: 0,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <Divider />

      {/* Settings */}
      <button
        className="tooltip"
        data-tooltip="Advanced"
        onClick={onOpenPanel}
        style={iconBtnStyle}
      >
        <Settings2 size={14} />
      </button>

      {/* Delete */}
      <button
        className="tooltip"
        data-tooltip="Delete edge"
        onClick={() => deleteEdge(selectedEdge.id)}
        style={{ ...iconBtnStyle, color: 'var(--danger)' }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

const Divider = () => (
  <div style={{ width: 1, height: 22, background: 'var(--border-primary)' }} />
);

const iconBtnStyle = {
  width: 30, height: 30,
  border: 'none',
  borderRadius: '6px',
  background: 'transparent',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
