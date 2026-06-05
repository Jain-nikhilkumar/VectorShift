// nodes/BaseNode.js — LIQUID GLASS EDITION
// 8-way resize + content scaling + frosted glass surface + light refraction

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
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

// Convert hex to rgba for translucent headers
const hexToRgba = (hex, alpha) => {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return hex;
  const [r, g, b] = m.map((c) => parseInt(c, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const BaseNode = ({
  id, data, title, icon,
  color = 'var(--accent-primary)',
  inputs = [], outputs = [], fields = [], children,
  width: defaultWidth = DEFAULT_WIDTH,
  minWidth = 160, maxWidth = 700,
  minHeight = 100, maxHeight = 800,
  resizable = true,
}) => {
  const updateNodeField = useStore((s) => s.updateNodeField);
  const updateNodeSize = useStore((s) => s.updateNodeSize);
  const setNodePosition = useStore((s) => s.setNodePosition);

  const [width, setWidth] = useState(data?.width || defaultWidth);
  const [height, setHeight] = useState(data?.height || null);
  const [isResizing, setIsResizing] = useState(false);
  const wrapperRef = useRef(null);

  // Sync external size changes (e.g. TextNode auto-resize) to internal state
  useEffect(() => {
    if (isResizing) return;
    if (data?.width && data.width !== width) setWidth(data.width);
    if (data?.height && data.height !== height) setHeight(data.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.width, data?.height]);

  const scale = useMemo(() => {
    const widthScale = width / defaultWidth;
    const heightScale = height ? height / DEFAULT_HEIGHT : widthScale;
    const avg = (widthScale + heightScale) / 2;
    return Math.max(0.6, Math.min(2.2, avg));
  }, [width, height, defaultWidth]);

  const onResize = useCallback((e, direction) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);

    const startMouseX = e.clientX, startMouseY = e.clientY;
    const startW = wrapperRef.current.offsetWidth;
    const startH = wrapperRef.current.offsetHeight;
    const startNode = useStore.getState().nodes.find((n) => n.id === id);
    const startX = startNode?.position.x ?? 0;
    const startY = startNode?.position.y ?? 0;

    let finalW = startW, finalH = startH;

    const onMove = (ev) => {
      const dx = ev.clientX - startMouseX, dy = ev.clientY - startMouseY;
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

      finalW = newW; finalH = newH;
      setWidth(newW); setHeight(newH);
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

  const px = (n) => `${n * scale}px`;

  const scaledInputStyle = {
    fontSize: px(12),
    padding: `${px(7)} ${px(10)}`,
    borderRadius: px(8),
    width: '100%',
    background: 'var(--field-bg)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
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
          <label style={{
            display: 'block', fontSize: px(10), fontWeight: 700,
            color: 'var(--text-tertiary)', marginBottom: px(4),
            textTransform: 'uppercase', letterSpacing: '0.6px',
          }}>{field.label}</label>
        )}
        {field.type === 'select' ? (
          <select {...commonProps}>
            {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : field.type === 'textarea' ? (
          <textarea {...commonProps} rows={field.rows || 3} style={{ ...scaledInputStyle, resize: 'none' }} />
        ) : (
          <input type={field.type || 'text'} {...commonProps} />
        )}
      </div>
    );
  };

  const renderHandle = (handle, idx, isInput, total) => {
    const handleId = `${id}-${handle.id}`;
    return (
      <div
        key={`${isInput ? 'in' : 'out'}-${handle.id}`}
        style={{
          position: 'absolute',
          [isInput ? 'left' : 'right']: -10,
          top: handle.style?.top ?? `${((idx + 1) * 100) / (total + 1)}%`,
          transform: 'translateY(-50%)',
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isInput ? 'flex-end' : 'flex-start',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <Handle
          type={isInput ? 'target' : 'source'}
          position={isInput ? Position.Left : Position.Right}
          id={handleId}
          className="custom-handle"
          style={{
            background: color,
            color: color,  // for glow shadow inheritance
            width: 12,
            height: 12,
            border: '2px solid var(--glass-border-strong)',
            position: 'relative',
            transform: 'none',
            top: 'auto', left: 'auto', right: 'auto',
            pointerEvents: 'all',
          }}
        />
        {handle.label && (
          <span style={{
            position: 'absolute',
            [isInput ? 'right' : 'left']: 22,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: px(10),
            color: 'var(--text-tertiary)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            fontWeight: 500,
          }}>
            {handle.label}
          </span>
        )}
      </div>
    );
  };

  // Translucent header tint (color at 75% opacity)
  const headerTintLight = typeof color === 'string' && color.startsWith('#')
    ? hexToRgba(color, 0.85)
    : color;
  const headerTintDark = typeof color === 'string' && color.startsWith('#')
    ? hexToRgba(color, 0.7)
    : color;

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
      {/* GLASS NODE CARD */}
      <div
        className="node-card"
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--node-bg)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid var(--node-border)',
          borderRadius: px(14),
          boxShadow: isResizing
            ? `0 0 0 2px var(--accent-primary), var(--shadow-lg), inset 0 1px 0 var(--glass-shadow-inset-top)`
            : `var(--shadow-md), inset 0 1px 0 var(--glass-shadow-inset-top), inset 0 -1px 0 var(--glass-shadow-inset-bottom)`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'box-shadow 0.15s, transform 0.15s',
          position: 'relative',
        }}
      >
        {/* Top light refraction strip — subtle sheen on top half */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.12), transparent)',
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        {/* GLASS HEADER with translucent color */}
        <div
          style={{
            background: headerTintLight,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: `${px(10)} ${px(14)}`,
            color: '#fff',
            fontSize: px(13),
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: px(8),
            letterSpacing: '0.2px',
            flexShrink: 0,
            position: 'relative',
            zIndex: 2,
            borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Inset sheen on top of header */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.18), transparent)',
            pointerEvents: 'none',
          }} />

          {icon && (
            <span style={{
              display: 'flex',
              transform: `scale(${scale})`,
              transformOrigin: 'left center',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
              position: 'relative',
            }}>
              {icon}
            </span>
          )}
          <span style={{
            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', marginLeft: scale > 1 ? px(4) : 0,
            position: 'relative',
          }}>
            {title}
          </span>
          <span style={{
            fontSize: px(10), opacity: 0.85, fontWeight: 500,
            maxWidth: px(100), overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            position: 'relative',
          }}>
            {id}
          </span>
        </div>

        {/* BODY */}
        <div className="nowheel" style={{
          padding: `${px(12)} ${px(14)}`,
          flex: 1, overflow: 'auto', minHeight: 0,
          position: 'relative',
          zIndex: 2,
        }}>
          {fields.map(renderField)}
          {typeof children === 'function' ? children({ scale, px }) : children}
        </div>
      </div>

      {/* Input handles */}
      {inputs.map((handle, idx) => renderHandle(handle, idx, true, inputs.length))}
      {outputs.map((handle, idx) => renderHandle(handle, idx, false, outputs.length))}

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
            boxShadow: dir.length === 2 ? '0 0 10px var(--accent-primary)' : 'none',
            ...style,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => !isResizing && (e.currentTarget.style.opacity = 0)}
        />
      ))}
    </div>
  );
};
