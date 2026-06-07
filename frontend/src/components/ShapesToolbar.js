// components/ShapesToolbar.js
// Floating bottom toolbar with diagram shapes (Figma/Miro style)
// - Auto-centers on canvas
// - Click a shape → it's added to canvas center
// - Drag a shape → drop anywhere on canvas
// - Group shapes by category with subtle dividers

import { useState, useRef } from 'react';
import {
  Square, Circle as CircleIcon, Diamond, Hexagon, Triangle,
  ArrowRightLeft, Database, Cloud, StickyNote, Type, Image as ImageIcon,
  Shapes as ShapesIcon, ChevronUp, ChevronDown, Frame, Sparkles,
} from 'lucide-react';
import { useStore } from '../store';
import { useReactFlow } from 'reactflow';
import { IconLibraryModal } from './IconLibraryModal';

const SHAPE_ITEMS = [
  // Geometric
  { type: 'shape_rectangle',    label: 'Rectangle',  icon: <Square size={18} />, group: 'shapes' },
  { type: 'shape_roundedRect',  label: 'Rounded',    icon: <Square size={18} style={{ borderRadius: 4 }} />, group: 'shapes' },
  { type: 'shape_circle',       label: 'Circle',     icon: <CircleIcon size={18} />, group: 'shapes' },
  { type: 'shape_diamond',      label: 'Diamond',    icon: <Diamond size={18} />, group: 'shapes' },
  { type: 'shape_hexagon',      label: 'Hexagon',    icon: <Hexagon size={18} />, group: 'shapes' },
  { type: 'shape_triangle',     label: 'Triangle',   icon: <Triangle size={18} />, group: 'shapes' },
  { type: 'shape_parallelogram', label: 'Parallelogram', icon: <ArrowRightLeft size={18} />, group: 'shapes' },
  // Diagram
  { type: 'shape_cylinder',     label: 'Database',   icon: <Database size={18} />, group: 'diagram' },
  { type: 'shape_cloud',        label: 'Cloud',      icon: <Cloud size={18} />, group: 'diagram' },
  { type: 'shape_frame',        label: 'Frame / Group', icon: <Frame size={18} />, group: 'diagram', isFrame: true },
  // Annotate
  { type: 'shape_stickyNote',   label: 'Sticky Note', icon: <StickyNote size={18} />, group: 'annotate' },
  { type: 'shape_textHeading',  label: 'Heading',     icon: <Type size={18} />, group: 'annotate' },
  { type: 'shape_image',        label: 'Image',       icon: <ImageIcon size={18} />, group: 'annotate' },
];

export const ShapesToolbar = () => {
  const reactFlowInstance = useReactFlow();
  const addNode = useStore((s) => s.addNode);
  const getNodeID = useStore((s) => s.getNodeID);
  const createFrameFromSelection = useStore((s) => s.createFrameFromSelection);
  const selectedNodes = useStore((s) => s.selectedNodes);
  const [collapsed, setCollapsed] = useState(false);
  const [iconLibraryOpen, setIconLibraryOpen] = useState(false);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType }));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Compute center of current viewport in flow coords (used by click-to-add)
  const getViewportCenterFlow = () => {
    if (!reactFlowInstance) return { x: 0, y: 0 };
    const { x: vx, y: vy, zoom } = reactFlowInstance.getViewport();
    const wrapper = document.querySelector('.react-flow');
    if (!wrapper) return { x: 0, y: 0 };
    const bounds = wrapper.getBoundingClientRect();
    return {
      x: (bounds.width / 2 - vx) / zoom,
      y: (bounds.height / 2 - vy) / zoom,
    };
  };

  // Click → add shape to center of current viewport
  const onClick = (nodeType, isFrame) => {
    if (!reactFlowInstance) return;

    // Special: Frame uses smart creation that wraps selected nodes
    if (isFrame) {
      const { x: cx, y: cy } = getViewportCenterFlow();
      createFrameFromSelection(cx, cy);
      return;
    }

    const { x: cx, y: cy } = getViewportCenterFlow();
    // Add slight random offset so stacked shapes don't perfectly overlap
    const jitter = () => (Math.random() - 0.5) * 40;
    const nodeID = getNodeID(nodeType);
    addNode({
      id: nodeID,
      type: nodeType,
      position: { x: cx + jitter() - 100, y: cy + jitter() - 50 },
      data: { id: nodeID, nodeType },
    });
  };

  // Group dividers
  const groups = ['shapes', 'diagram', 'annotate'];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {/* Main toolbar */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          padding: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          pointerEvents: 'all',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          animation: 'fadeIn 0.2s ease',
          maxHeight: collapsed ? 44 : 60,
          overflow: 'hidden',
          transition: 'max-height 0.2s ease, padding 0.2s ease',
        }}
      >
        {/* Collapsed state: just an icon to expand */}
        {collapsed ? (
          <button
            className="btn btn-ghost btn-icon tooltip"
            data-tooltip="Show shapes"
            onClick={() => setCollapsed(false)}
            style={{ width: 32, height: 32 }}
          >
            <ShapesIcon size={16} />
          </button>
        ) : (
          <>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-tertiary)',
              padding: '0 6px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              alignSelf: 'stretch',
            }}>
              <ShapesIcon size={12} />
              <span style={{ marginRight: 2 }}>Insert</span>
            </div>

            <Divider />

            {groups.map((group, gi) => {
              const items = SHAPE_ITEMS.filter((s) => s.group === group);
              return (
                <div key={group} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {items.map((item) => {
                    const selectionCount = item.isFrame ? selectedNodes.filter((id) => !id.startsWith('shape_frame')).length : 0;
                    return (
                      <button
                        key={item.type}
                        className="tooltip"
                        data-tooltip={
                          item.isFrame && selectionCount > 0
                            ? `Group ${selectionCount} selected`
                            : item.label
                        }
                        draggable={!item.isFrame}
                        onDragStart={(e) => !item.isFrame && onDragStart(e, item.type)}
                        onClick={() => onClick(item.type, item.isFrame)}
                        style={{
                          width: 32,
                          height: 32,
                          background: item.isFrame && selectionCount > 0 ? 'var(--accent-primary)' : 'transparent',
                          color: item.isFrame && selectionCount > 0 ? 'var(--accent-fg)' : 'var(--text-secondary)',
                          border: 'none',
                          borderRadius: 6,
                          cursor: item.isFrame ? 'pointer' : 'grab',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.12s, color 0.12s, transform 0.1s',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          if (!(item.isFrame && selectionCount > 0)) {
                            e.currentTarget.style.background = 'var(--bg-hover)';
                            e.currentTarget.style.color = 'var(--accent-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!(item.isFrame && selectionCount > 0)) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }
                        }}
                        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        {item.icon}
                        {item.isFrame && selectionCount > 0 && (
                          <span style={{
                            position: 'absolute',
                            top: -3,
                            right: -3,
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: 'var(--accent-secondary)',
                            color: 'white',
                            fontSize: 9,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1.5px solid var(--bg-secondary)',
                          }}>
                            {selectionCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {gi < groups.length - 1 && <Divider />}
                </div>
              );
            })}

            <Divider />

            {/* Cloud / Tech Icons library button (opens modal) */}
            <button
              className="tooltip"
              data-tooltip="Cloud & Tech Icons Library"
              onClick={() => setIconLibraryOpen(true)}
              style={{
                height: 32,
                padding: '0 10px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontWeight: 700,
                transition: 'transform 0.1s, box-shadow 0.15s',
                boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(99, 102, 241, 0.3)';
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            >
              <Sparkles size={13} />
              <span>Icons</span>
            </button>

            <Divider />

            <button
              className="btn btn-ghost btn-icon tooltip"
              data-tooltip="Collapse"
              onClick={() => setCollapsed(true)}
              style={{ width: 30, height: 32 }}
            >
              <ChevronDown size={14} />
            </button>
          </>
        )}
      </div>

      {/* Hint label below */}
      {!collapsed && (
        <div
          style={{
            position: 'absolute',
            bottom: -22,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 10,
            color: 'var(--text-tertiary)',
            opacity: 0.6,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            fontWeight: 500,
          }}
        >
          Click to add at center · Drag for precise placement
        </div>
      )}

      {/* Icon Library Modal */}
      <IconLibraryModal open={iconLibraryOpen} onClose={() => setIconLibraryOpen(false)} />
    </div>
  );
};

const Divider = () => (
  <div style={{
    width: 1,
    height: 22,
    background: 'var(--border-primary)',
    margin: '0 3px',
    alignSelf: 'center',
  }} />
);
