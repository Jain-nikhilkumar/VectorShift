// shapes/BaseShape.js
// Foundation for all diagram shapes (rectangle, circle, diamond, etc.)
// - 4-way connection handles (top/right/bottom/left, both source AND target)
// - Double-click to edit text
// - 8-way resize via corner/edge handles
// - Color customization (fill/stroke)

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';
import { useThemeStyle } from '../hooks/useThemeStyle';

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

const HANDLE_POSITIONS = [
  { id: 'top',    position: Position.Top,    style: { top: -6, left: '50%', transform: 'translateX(-50%)' } },
  { id: 'right',  position: Position.Right,  style: { right: -6, top: '50%', transform: 'translateY(-50%)' } },
  { id: 'bottom', position: Position.Bottom, style: { bottom: -6, left: '50%', transform: 'translateX(-50%)' } },
  { id: 'left',   position: Position.Left,   style: { left: -6, top: '50%', transform: 'translateY(-50%)' } },
];

export const BaseShape = ({
  id, data, selected,
  defaultWidth = 160,
  defaultHeight = 100,
  minWidth = 60,
  minHeight = 40,
  // Render function: ({ width, height, fill, stroke, strokeWidth }) => svg element
  renderShape,
  // Text positioning override (e.g. cylinder needs text lower)
  textOffset = { x: 0, y: 0 },
  // Default color when not specified
  defaultFill = '#ffffff',
  defaultStroke = '#64748b',
  defaultText = 'Double-click to edit',
}) => {
  const updateNodeField = useStore((s) => s.updateNodeField);
  const updateNodeSize = useStore((s) => s.updateNodeSize);
  const setNodePosition = useStore((s) => s.setNodePosition);
  const { style: themeStyle } = useThemeStyle();
  const isBrutalist = themeStyle === 'neo-brutalism';

  const [width, setWidth] = useState(data?.width || defaultWidth);
  const [height, setHeight] = useState(data?.height || defaultHeight);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data?.text ?? defaultText);
  const wrapperRef = useRef(null);
  const textareaRef = useRef(null);

  const fill = data?.fill || defaultFill;
  const stroke = data?.stroke || defaultStroke;
  const strokeWidth = data?.strokeWidth ?? (isBrutalist ? 2.5 : 1.5);
  const textColor = data?.textColor || '#1a1d2e';
  const opacity = data?.opacity ?? 1;

  // Sync external size changes
  useEffect(() => {
    if (isResizing) return;
    if (data?.width && data.width !== width) setWidth(data.width);
    if (data?.height && data.height !== height) setHeight(data.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.width, data?.height]);

  useEffect(() => {
    if (data?.text !== undefined && data.text !== text) setText(data.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.text]);

  // Focus textarea on edit
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

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

      if (direction.includes('e')) newW = Math.max(minWidth, startW + dx);
      if (direction.includes('w')) {
        newW = Math.max(minWidth, startW - dx);
        newX = startX + (startW - newW);
      }
      if (direction.includes('s')) newH = Math.max(minHeight, startH + dy);
      if (direction.includes('n')) {
        newH = Math.max(minHeight, startH - dy);
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
  }, [id, minWidth, minHeight, setNodePosition, updateNodeSize]);

  const onTextChange = (e) => setText(e.target.value);

  const onTextBlur = () => {
    setIsEditing(false);
    updateNodeField(id, 'text', text);
  };

  const onTextKeyDown = (e) => {
    // Esc / Ctrl+Enter exits edit mode
    if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      onTextBlur();
    }
    e.stopPropagation();  // Stop React Flow shortcuts (delete, etc.) from firing
  };

  const shapeProps = useMemo(
    () => ({ width, height, fill, stroke, strokeWidth }),
    [width, height, fill, stroke, strokeWidth]
  );

  return (
    <div
      ref={wrapperRef}
      style={{
        width,
        height,
        position: 'relative',
        cursor: isEditing ? 'text' : 'grab',
        opacity,
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {/* SHAPE - SVG that scales with the node */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        {renderShape(shapeProps)}
      </svg>

      {/* TEXT — editable on double-click */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 12,
          paddingTop: 12 + textOffset.y,
          paddingLeft: 12 + textOffset.x,
          pointerEvents: 'none',
        }}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={onTextChange}
            onBlur={onTextBlur}
            onKeyDown={onTextKeyDown}
            className="nodrag"
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: '1px dashed var(--accent-primary)',
              borderRadius: 4,
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 500,
              color: textColor,
              textAlign: 'center',
              pointerEvents: 'all',
              padding: 4,
            }}
          />
        ) : (
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: textColor,
              textAlign: 'center',
              wordBreak: 'break-word',
              lineHeight: 1.4,
              opacity: text === defaultText ? 0.5 : 1,
              userSelect: 'none',
            }}
          >
            {text || defaultText}
          </div>
        )}
      </div>

      {/* 4-way connection handles */}
      {HANDLE_POSITIONS.map(({ id: hid, position, style }) => (
        <Handle
          key={hid}
          id={hid}
          type="source"
          position={position}
          isConnectableStart={true}
          isConnectableEnd={true}
          className="custom-handle"
          style={{
            background: stroke,
            color: stroke,
            width: 11,
            height: 11,
            border: '2px solid white',
            position: 'absolute',
            ...style,
          }}
        />
      ))}

      {/* Resize handles */}
      {RESIZE_HANDLES.map(({ dir, cursor, style }) => (
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
            opacity: isResizing || selected ? 1 : 0,
            transition: 'opacity 0.15s',
            ...style,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => !isResizing && !selected && (e.currentTarget.style.opacity = 0)}
        />
      ))}
    </div>
  );
};
