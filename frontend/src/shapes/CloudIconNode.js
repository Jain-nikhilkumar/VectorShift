// shapes/CloudIconNode.js
// Lightweight cloud/tech icon node — fetches SVG from Iconify CDN on demand
// Bundle impact: ZERO (icons are CDN-loaded and cached by browser)
// Library: 150,000+ icons via Iconify (https://icon-sets.iconify.design)

import { useState, useRef, useCallback, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Image as ImageIcon } from 'lucide-react';
import { useStore } from '../store';

const ICONIFY_BASE = 'https://api.iconify.design';

export const CloudIconNode = ({ id, data, selected }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);
  const updateNodeSize = useStore((s) => s.updateNodeSize);
  const setNodePosition = useStore((s) => s.setNodePosition);

  const [width, setWidth] = useState(data?.width || 120);
  const [height, setHeight] = useState(data?.height || 130);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data?.label ?? '');
  const [svgContent, setSvgContent] = useState(null);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const iconName = data?.icon || 'logos:amazon-s3';   // default fallback
  const opacity = data?.opacity ?? 1;
  const [iconFailed, setIconFailed] = useState(false);

  // Fetch the SVG from Iconify CDN
  useEffect(() => {
    let cancelled = false;
    setSvgContent(null);
    setIconFailed(false);
    fetch(`${ICONIFY_BASE}/${iconName}.svg`)
      .then((r) => (r.ok ? r.text() : null))
      .then((text) => {
        if (cancelled) return;
        if (text && text.length > 100 && !text.includes('?text')) {
          setSvgContent(text);
        } else {
          setIconFailed(true);
        }
      })
      .catch(() => !cancelled && setIconFailed(true));
    return () => { cancelled = true; };
  }, [iconName]);

  useEffect(() => {
    if (isResizing) return;
    if (data?.width && data.width !== width) setWidth(data.width);
    if (data?.height && data.height !== height) setHeight(data.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.width, data?.height]);

  useEffect(() => {
    if (data?.label !== undefined && data.label !== label) setLabel(data.label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const onLabelBlur = () => {
    setIsEditing(false);
    updateNodeField(id, 'label', label);
  };

  const onResize = useCallback((e, dir) => {
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
      if (dir.includes('e')) newW = Math.max(60, startW + dx);
      if (dir.includes('w')) { newW = Math.max(60, startW - dx); newX = startX + (startW - newW); }
      if (dir.includes('s')) newH = Math.max(60, startH + dy);
      if (dir.includes('n')) { newH = Math.max(60, startH - dy); newY = startY + (startH - newH); }
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
  }, [id, setNodePosition, updateNodeSize]);

  const iconSize = Math.min(width - 16, height - 32);  // leave room for label

  return (
    <div
      ref={wrapperRef}
      style={{
        width,
        height,
        position: 'relative',
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 8,
        gap: 6,
        cursor: 'grab',
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {/* Selection ring (subtle, only on selection) */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            inset: -4,
            border: '2px dashed var(--accent-primary)',
            borderRadius: 8,
            pointerEvents: 'none',
            opacity: 0.5,
          }}
        />
      )}

      {/* Icon SVG (inline-rendered from CDN so it can be styled and looks crisp) */}
      <div
        style={{
          width: iconSize,
          height: iconSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {svgContent ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            dangerouslySetInnerHTML={{
              __html: svgContent.replace(
                /<svg /,
                `<svg style="width:100%;height:100%;" preserveAspectRatio="xMidYMid meet" `
              ),
            }}
          />
        ) : iconFailed ? (
          <div style={{
            width: iconSize * 0.85,
            height: iconSize * 0.85,
            background: '#6366f1',
            color: 'white',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: iconSize * 0.4,
            fontWeight: 800,
            letterSpacing: -0.5,
          }}>
            {(label || '?').charAt(0).toUpperCase()}
          </div>
        ) : (
          <ImageIcon size={iconSize * 0.5} color="var(--text-tertiary)" />
        )}
      </div>

      {/* Label */}
      {isEditing ? (
        <input
          ref={inputRef}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={onLabelBlur}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter' || e.key === 'Escape') onLabelBlur();
          }}
          placeholder="Label..."
          className="nodrag"
          style={{
            width: '100%',
            background: 'var(--bg-tertiary)',
            border: '1px dashed var(--accent-primary)',
            borderRadius: 4,
            outline: 'none',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-primary)',
            textAlign: 'center',
            padding: '2px 4px',
            fontFamily: 'inherit',
          }}
        />
      ) : (
        label && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-primary)',
              textAlign: 'center',
              userSelect: 'none',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.3,
            }}
          >
            {label}
          </div>
        )
      )}

      {/* 4-way connection handles */}
      <Handle id="top" type="source" position={Position.Top} isConnectableEnd={true}
        className="custom-handle"
        style={{ background: 'var(--accent-primary)', color: 'var(--accent-primary)', width: 10, height: 10, border: '2px solid white' }} />
      <Handle id="right" type="source" position={Position.Right} isConnectableEnd={true}
        className="custom-handle"
        style={{ background: 'var(--accent-primary)', color: 'var(--accent-primary)', width: 10, height: 10, border: '2px solid white' }} />
      <Handle id="bottom" type="source" position={Position.Bottom} isConnectableEnd={true}
        className="custom-handle"
        style={{ background: 'var(--accent-primary)', color: 'var(--accent-primary)', width: 10, height: 10, border: '2px solid white' }} />
      <Handle id="left" type="source" position={Position.Left} isConnectableEnd={true}
        className="custom-handle"
        style={{ background: 'var(--accent-primary)', color: 'var(--accent-primary)', width: 10, height: 10, border: '2px solid white' }} />

      {/* Resize handles */}
      {selected && ['nw', 'ne', 'sw', 'se'].map((dir) => {
        const style = {
          nw: { top: -5, left: -5 },
          ne: { top: -5, right: -5 },
          sw: { bottom: -5, left: -5 },
          se: { bottom: -5, right: -5 },
        }[dir];
        return (
          <div
            key={dir}
            className="nodrag"
            onMouseDown={(e) => onResize(e, dir)}
            style={{
              position: 'absolute',
              width: 11, height: 11,
              background: 'var(--accent-primary)',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: `${dir}-resize`,
              zIndex: 5,
              ...style,
            }}
          />
        );
      })}
    </div>
  );
};
