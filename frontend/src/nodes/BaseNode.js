// nodes/BaseNode.js — 8-way resize WITH proportional content scaling
// Text, padding, icons all scale with node size (Figma-like zoom)

import { useState, useRef, useCallback, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';

const RESIZE_HANDLES = [
  { dir: 'n',  cursor: 'ns-resize',   style: { top: -4, left: '50%', transform: 'translateX(-50%)', width: 24, height: 8 } },
  { dir: 's',  cursor: 'ns-resize',   style: { bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 24, height: 8 } },
  { dir: 'e',  cursor: 'ew-resize',   style: { right: -4, top: '50%', transform: 'translateY(-50%)', width: 8, height: 24 } },
  { dir: 'w',  cursor: 'ew-resize',   style: { left: -4, top: '50%', transform: 'translateY(-50%)', width: 8, height: 24 } },
  { dir: 'nw', cursor: 'nwse-resize', style: { top: -5, left: -5, width: 12, height: 12 } },
  { dir: 'ne', cursor: 'nesw-resize', style: { top: -5, right: -5, width: 12, height: 12 } },
  { dir: 'sw', cursor: 'nesw-resize', style: { bottom: -5, left: -5, width: 12, height: 12 } },
  { dir: 'se', cursor: 'nwse-resize', style: { bottom: -5, right: -5, width: 12, height: 12 } },
];

const DEFAULT_WIDTH = 240;
const DEFAULT_HEIGHT = 180;

export const BaseNode = ({
  id,
  data,
  title,
  icon,
  color = 'var(--accent-primary)',
  inputs = [],
  outputs = [],
  fields = [],
  children,
  width: defaultWidth = DEFAULT_WIDTH,
  minWidth = 160,
  maxWidth = 700,
  minHeight = 100,
  maxHeight = 800,
  resizable = true,
}) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const updateNodeSize = useStore((state) => state.updateNodeSize);
  const setNodePosition = useStore((state) => state.setNodePosition);

  const [width, setWidth] = useState(data?.width || defaultWidth);
  const [height, setHeight] = useState(data?.height || null);
  const [isResizing, setIsResizing] = useState(false);
  const wrapperRef = useRef(null);

  // CONTENT SCALE FACTOR — scales with the smaller of width/height ratio
  // Use geometric mean for balanced scaling in both dimensions
  const scale = useMemo(() => {
    const widthScale = width / defaultWidth;
    const heightScale = height ? height / DEFAULT_HEIGHT : widthScale;
    // Use the average so scaling feels natural in both dimensions
    const avg = (widthScale + heightScale) / 2;
    return Math.max(0.6, Math.min(2.2, avg));
  }, [width, height, defaultWidth]);

  // 8-way resize
  const onResize = useCallback((e, direction) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startW = wrapperRef.current.offsetWidth;
    const startH = wrapperRef.current.offsetHeight;
    const startNode = useStore.getState().nodes.find((n) => n.id === id);
    const startX = startNode?.position.x ?? 0;
    const startY = startNode?.position.y ?? 0;

    let finalW = startW, finalH = startH;

    const onMove = (ev) => {
      const dx = ev.clientX - startMouseX;
      const dy = ev.clientY - startMouseY;
      let newW = startW, newH = startH, newX = startX, newY = startY;

      if (direction.includes('e')) newW = Math.max(minWidth, Math.min(maxWidth, startW + dx));
      if (direction.includes('w')) {
        newW = Math.max(minWidth, Math.min(maxWidth, startW - dx));
        newX = startX + (startW - newW);
      }
      if (direction.includes('s')) newH = Math.max(minHeight, Math.min(maxHeight, startH + dy));
      if (direction.includes('n')) {
        newH = Math.max(minHeight, Math.min(maxHeight, startH - dy));
        newY = startY + (startH - newH);
      }

      finalW = newW;
      finalH = newH;
      setWidth(newW);
      setHeight(newH);

      if (newX !== startX || newY !== startY) setNodePosition(id, newX, newY);
    };

    const onUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      updateNodeSize(id, finalW, finalH);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [id, minWidth, maxWidth, minHeight, maxHeight, setNodePosition, updateNodeSize]);

  const handleFieldChange = (fieldName, value, customOnChange) => {
    if (customOnChange) customOnChange(value);
    else updateNodeField(id, fieldName, value);
  };

  // SCALED dimensions
  const px = (n) => `${n * scale}px`;

  // Scaled input style — applied inline to override .input-base defaults
  const scaledInputStyle = {
    fontSize: px(12),
    padding: `${px(7)} ${px(10)}`,
    borderRadius: px(6),
    width: '100%',
    background: 'var(--field-bg)',
    border: '1px solid var(--field-border)',
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const renderField = (field, idx) => {
    const commonProps = {
      value: field.value ?? '',
      onChange: (e) => handleFieldChange(field.name, e.target.value, field.onChange),
      placeholder: field.placeholder,
      style: scaledInputStyle,
    };

    return (
      <div key={idx} style={{ marginBottom: px(8) }}>
        {field.label && (
          <label
            style={{
              display: 'block',
              fontSize: px(10),
              fontWeight: 700,
              color: 'var(--text-tertiary)',
              marginBottom: px(4),
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
            }}
          >
            {field.label}
          </label>
        )}
        {field.type === 'select' ? (
          <select {...commonProps}>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : field.type === 'textarea' ? (
          <textarea {...commonProps} rows={field.rows || 3} style={{ ...scaledInputStyle, resize: 'none' }} />
        ) : field.type === 'checkbox' ? (
          <label style={{ display: 'flex', alignItems: 'center', gap: px(6), fontSize: px(12), color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={!!field.value}
              onChange={(e) => handleFieldChange(field.name, e.target.checked, field.onChange)}
              style={{ transform: `scale(${scale})` }} />
            {field.checkboxLabel}
          </label>
        ) : (
          <input type={field.type || 'text'} {...commonProps} />
        )}
      </div>
    );
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        width,
        height: height || 'auto',
        position: 'relative',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        className="node-card"
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--node-bg)',
          border: '1px solid var(--node-border)',
          borderRadius: px(12),
          boxShadow: isResizing ? 'var(--shadow-lg)' : 'var(--shadow-md)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          outline: isResizing ? `2px solid var(--accent-primary)` : 'none',
          outlineOffset: '-1px',
          transition: 'box-shadow 0.15s, outline 0.15s',
        }}
      >
        {/* Scaled Header */}
        <div
          style={{
            background: color,
            padding: `${px(10)} ${px(14)}`,
            color: '#fff',
            fontSize: px(13),
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: px(8),
            letterSpacing: '0.2px',
            flexShrink: 0,
          }}
        >
          {icon && (
            <span style={{ display: 'flex', transform: `scale(${scale})`, transformOrigin: 'left center' }}>
              {icon}
            </span>
          )}
          <span style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginLeft: scale > 1 ? px(4) : 0,
          }}>
            {title}
          </span>
          <span style={{
            fontSize: px(10),
            opacity: 0.75,
            fontWeight: 500,
            maxWidth: px(100),
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {id}
          </span>
        </div>

        {/* Scaled Body */}
        <div
          className="nowheel"
          style={{
            padding: `${px(12)} ${px(14)}`,
            flex: 1,
            overflow: 'auto',
            minHeight: 0,
          }}
        >
          {fields.map(renderField)}
          {typeof children === 'function' ? children({ scale, px }) : children}
        </div>
      </div>

      {/* Handles (unscaled — must remain consistent for connections) */}
      {inputs.map((handle, idx) => (
        <Handle
          key={`in-${handle.id}`}
          type="target"
          position={Position.Left}
          id={`${id}-${handle.id}`}
          style={{
            top: handle.style?.top ?? `${((idx + 1) * 100) / (inputs.length + 1)}%`,
            background: color,
            width: '11px',
            height: '11px',
            ...handle.style,
          }}
        >
          {handle.label && (
            <span style={{
              position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
              fontSize: px(10), color: 'var(--text-tertiary)',
              whiteSpace: 'nowrap', pointerEvents: 'none', fontWeight: 500,
            }}>
              {handle.label}
            </span>
          )}
        </Handle>
      ))}

      {outputs.map((handle, idx) => (
        <Handle
          key={`out-${handle.id}`}
          type="source"
          position={Position.Right}
          id={`${id}-${handle.id}`}
          style={{
            top: handle.style?.top ?? `${((idx + 1) * 100) / (outputs.length + 1)}%`,
            background: color,
            width: '11px',
            height: '11px',
            ...handle.style,
          }}
        >
          {handle.label && (
            <span style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              fontSize: px(10), color: 'var(--text-tertiary)',
              whiteSpace: 'nowrap', pointerEvents: 'none', fontWeight: 500,
            }}>
              {handle.label}
            </span>
          )}
        </Handle>
      ))}

      {/* 8-way resize handles */}
      {resizable && RESIZE_HANDLES.map(({ dir, cursor, style }) => (
        <div
          key={dir}
          className="nodrag"
          onMouseDown={(e) => onResize(e, dir)}
          style={{
            position: 'absolute',
            cursor,
            zIndex: 5,
            background: dir.length === 2 ? 'var(--accent-primary)' : 'transparent',
            border: dir.length === 2 ? '2px solid white' : 'none',
            borderRadius: dir.length === 2 ? '50%' : '2px',
            opacity: isResizing ? 1 : 0,
            transition: 'opacity 0.15s',
            ...style,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => !isResizing && (e.currentTarget.style.opacity = 0)}
        />
      ))}
    </div>
  );
};
