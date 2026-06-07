// shapes/shapeRegistry.js
// All diagram shapes: geometric shapes, sticky note, text heading, image upload

import { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Image as ImageIcon, Upload, X, Lock, Unlock } from 'lucide-react';
import { BaseShape } from './BaseShape';
import { CloudIconNode } from './CloudIconNode';
import { useStore } from '../store';

// =========================================================================
// GEOMETRIC SHAPES (SVG-based, scale crisply)
// =========================================================================

// Rectangle
const RectangleShape = (props) => (
  <BaseShape
    {...props}
    defaultFill="#e0e7ff"
    defaultStroke="#6366f1"
    renderShape={({ fill, stroke, strokeWidth }) => (
      <rect
        x={strokeWidth}
        y={strokeWidth}
        width={100 - strokeWidth * 2}
        height={100 - strokeWidth * 2}
        rx={2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    )}
  />
);

// Rounded Rectangle
const RoundedRectShape = (props) => (
  <BaseShape
    {...props}
    defaultFill="#fae8ff"
    defaultStroke="#a855f7"
    renderShape={({ fill, stroke, strokeWidth }) => (
      <rect
        x={strokeWidth}
        y={strokeWidth}
        width={100 - strokeWidth * 2}
        height={100 - strokeWidth * 2}
        rx={12}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    )}
  />
);

// Circle / Ellipse
const CircleShape = (props) => (
  <BaseShape
    {...props}
    defaultFill="#dbeafe"
    defaultStroke="#3b82f6"
    renderShape={({ fill, stroke, strokeWidth }) => (
      <ellipse
        cx={50}
        cy={50}
        rx={50 - strokeWidth}
        ry={50 - strokeWidth}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    )}
  />
);

// Diamond (decision)
const DiamondShape = (props) => (
  <BaseShape
    {...props}
    defaultFill="#fef3c7"
    defaultStroke="#f59e0b"
    defaultWidth={140}
    defaultHeight={100}
    renderShape={({ fill, stroke, strokeWidth }) => (
      <polygon
        points="50,2 98,50 50,98 2,50"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    )}
  />
);

// Hexagon (preparation / process variant)
const HexagonShape = (props) => (
  <BaseShape
    {...props}
    defaultFill="#dcfce7"
    defaultStroke="#22c55e"
    defaultWidth={160}
    defaultHeight={100}
    renderShape={({ fill, stroke, strokeWidth }) => (
      <polygon
        points="25,2 75,2 98,50 75,98 25,98 2,50"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    )}
  />
);

// Cylinder (database)
const CylinderShape = (props) => (
  <BaseShape
    {...props}
    defaultFill="#fce7f3"
    defaultStroke="#ec4899"
    defaultWidth={120}
    defaultHeight={140}
    textOffset={{ x: 0, y: 8 }}
    renderShape={({ fill, stroke, strokeWidth }) => (
      <g>
        {/* Body */}
        <path
          d="M 2 12 L 2 88 Q 2 98 50 98 Q 98 98 98 88 L 98 12"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Top ellipse */}
        <ellipse
          cx={50}
          cy={12}
          rx={48}
          ry={10}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    )}
  />
);

// Cloud (cloud services)
const CloudShape = (props) => (
  <BaseShape
    {...props}
    defaultFill="#e0f2fe"
    defaultStroke="#0ea5e9"
    defaultWidth={160}
    defaultHeight={110}
    renderShape={({ fill, stroke, strokeWidth }) => (
      <path
        d="M 30 80 Q 8 80 8 60 Q 8 42 28 40 Q 28 18 50 18 Q 60 8 75 18 Q 92 22 92 42 Q 95 55 80 65 Q 80 82 60 82 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    )}
  />
);

// Parallelogram (input/output)
const ParallelogramShape = (props) => (
  <BaseShape
    {...props}
    defaultFill="#fee2e2"
    defaultStroke="#ef4444"
    defaultWidth={160}
    defaultHeight={90}
    renderShape={({ fill, stroke, strokeWidth }) => (
      <polygon
        points="20,5 98,5 80,95 2,95"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    )}
  />
);

// Triangle (note / warning)
const TriangleShape = (props) => (
  <BaseShape
    {...props}
    defaultFill="#fef3c7"
    defaultStroke="#f59e0b"
    defaultWidth={130}
    defaultHeight={110}
    textOffset={{ x: 0, y: 10 }}
    renderShape={({ fill, stroke, strokeWidth }) => (
      <polygon
        points="50,4 96,96 4,96"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    )}
  />
);

// =========================================================================
// STICKY NOTE — yellow notepad with shadow
// =========================================================================

const StickyNote = ({ id, data, selected }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data?.text ?? 'Click to add note...');
  const textareaRef = useRef(null);
  const bgColor = data?.bgColor || '#fef08a';  // sticky yellow

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (data?.text !== undefined && data.text !== text) setText(data.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.text]);

  const onBlur = () => {
    setIsEditing(false);
    updateNodeField(id, 'text', text);
  };

  return (
    <div
      style={{
        width: data?.width || 200,
        height: data?.height || 160,
        background: bgColor,
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
        padding: 14,
        position: 'relative',
        transform: 'rotate(-1deg)',
        transition: 'transform 0.15s',
      }}
      onDoubleClick={() => setIsEditing(true)}
    >
      {/* Folded corner effect */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 22,
        height: 22,
        background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)',
        pointerEvents: 'none',
      }} />

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={onBlur}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
              e.preventDefault();
              onBlur();
            }
          }}
          className="nodrag"
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
            fontSize: 14,
            color: '#3a3015',
            lineHeight: 1.5,
          }}
        />
      ) : (
        <div style={{
          fontSize: 14,
          color: '#3a3015',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          height: '100%',
          overflow: 'auto',
          userSelect: 'none',
        }}>
          {text}
        </div>
      )}

      {/* Handles - all 4 sides */}
      <Handle id="top" type="source" position={Position.Top} isConnectableEnd={true}
        className="custom-handle"
        style={{ background: '#f59e0b', color: '#f59e0b', width: 10, height: 10, border: '2px solid white' }}
      />
      <Handle id="right" type="source" position={Position.Right} isConnectableEnd={true}
        className="custom-handle"
        style={{ background: '#f59e0b', color: '#f59e0b', width: 10, height: 10, border: '2px solid white' }}
      />
      <Handle id="bottom" type="source" position={Position.Bottom} isConnectableEnd={true}
        className="custom-handle"
        style={{ background: '#f59e0b', color: '#f59e0b', width: 10, height: 10, border: '2px solid white' }}
      />
      <Handle id="left" type="source" position={Position.Left} isConnectableEnd={true}
        className="custom-handle"
        style={{ background: '#f59e0b', color: '#f59e0b', width: 10, height: 10, border: '2px solid white' }}
      />
    </div>
  );
};

// =========================================================================
// TEXT HEADING / LABEL — pure text, no card
// =========================================================================

const TextHeading = ({ id, data }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data?.text ?? 'Heading');
  const variant = data?.variant || 'h1';   // h1, h2, h3, body
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (data?.text !== undefined && data.text !== text) setText(data.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.text]);

  const onBlur = () => {
    setIsEditing(false);
    updateNodeField(id, 'text', text);
  };

  const sizes = {
    h1: { fontSize: 32, fontWeight: 800 },
    h2: { fontSize: 24, fontWeight: 700 },
    h3: { fontSize: 18, fontWeight: 600 },
    body: { fontSize: 14, fontWeight: 400 },
  };
  const style = sizes[variant] || sizes.h1;

  return (
    <div
      style={{
        minWidth: 100,
        minHeight: 30,
        padding: '6px 10px',
        cursor: isEditing ? 'text' : 'grab',
        position: 'relative',
      }}
      onDoubleClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={onBlur}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Escape' || e.key === 'Enter') {
              e.preventDefault();
              onBlur();
            }
          }}
          className="nodrag"
          style={{
            background: 'transparent',
            border: '1px dashed var(--accent-primary)',
            outline: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            padding: '2px 4px',
            borderRadius: 4,
            minWidth: 150,
            ...style,
          }}
        />
      ) : (
        <div style={{
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          ...style,
        }}>
          {text}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// IMAGE NODE — upload image (drag/drop or click)
// =========================================================================

const ImageNode = ({ id, data, selected }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);
  const updateNodeSize = useStore((s) => s.updateNodeSize);
  const setNodePosition = useStore((s) => s.setNodePosition);
  const [width, setWidth] = useState(data?.width || 240);
  const [height, setHeight] = useState(data?.height || 180);
  const [isResizing, setIsResizing] = useState(false);
  const fileInputRef = useRef(null);
  const wrapperRef = useRef(null);
  const src = data?.src;
  const opacity = data?.opacity ?? 1;

  useEffect(() => {
    if (isResizing) return;
    if (data?.width && data.width !== width) setWidth(data.width);
    if (data?.height && data.height !== height) setHeight(data.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.width, data?.height]);

  const onUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      updateNodeField(id, 'src', dataUrl);
      // Auto-size to image dimensions (with limits)
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        let newW = Math.min(img.width, 400);
        let newH = newW / aspect;
        if (newH > 400) {
          newH = 400;
          newW = newH * aspect;
        }
        updateNodeSize(id, newW, newH);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    onUpload(file);
  };

  const onResize = (e, direction) => {
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
      if (direction.includes('e')) newW = Math.max(80, startW + dx);
      if (direction.includes('w')) { newW = Math.max(80, startW - dx); newX = startX + (startW - newW); }
      if (direction.includes('s')) newH = Math.max(60, startH + dy);
      if (direction.includes('n')) { newH = Math.max(60, startH - dy); newY = startY + (startH - newH); }
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
  };

  const removeImage = (e) => {
    e.stopPropagation();
    updateNodeField(id, 'src', null);
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        width,
        height,
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
        background: src ? 'transparent' : 'var(--bg-secondary)',
        border: src ? 'none' : '2px dashed var(--border-secondary)',
        opacity,
      }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={onDrop}
    >
      {src ? (
        <>
          <img
            src={src}
            alt="uploaded"
            style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
          />
          {/* Delete button on hover */}
          <button
            className="nodrag"
            onClick={removeImage}
            style={{
              position: 'absolute',
              top: 6, right: 6,
              width: 24, height: 24,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: selected ? 1 : 0,
              transition: 'opacity 0.15s',
            }}
            title="Remove image"
          >
            <X size={14} />
          </button>
        </>
      ) : (
        <div
          className="nodrag"
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            color: 'var(--text-tertiary)',
            userSelect: 'none',
          }}
        >
          <Upload size={28} />
          <div style={{ fontSize: 12, fontWeight: 600 }}>Click or drop image</div>
          <div style={{ fontSize: 10, opacity: 0.7 }}>PNG, JPG, GIF (max 5MB)</div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => onUpload(e.target.files?.[0])}
      />

      {/* Handles for connecting images */}
      <Handle id="top" type="source" position={Position.Top} isConnectableEnd={true}
        className="custom-handle"
        style={{ background: '#6366f1', color: '#6366f1', width: 10, height: 10, border: '2px solid white' }} />
      <Handle id="right" type="source" position={Position.Right} isConnectableEnd={true}
        className="custom-handle"
        style={{ background: '#6366f1', color: '#6366f1', width: 10, height: 10, border: '2px solid white' }} />
      <Handle id="bottom" type="source" position={Position.Bottom} isConnectableEnd={true}
        className="custom-handle"
        style={{ background: '#6366f1', color: '#6366f1', width: 10, height: 10, border: '2px solid white' }} />
      <Handle id="left" type="source" position={Position.Left} isConnectableEnd={true}
        className="custom-handle"
        style={{ background: '#6366f1', color: '#6366f1', width: 10, height: 10, border: '2px solid white' }} />

      {/* Resize handles - only show when selected */}
      {selected && ['nw','ne','sw','se'].map((dir) => {
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
              width: 12, height: 12,
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

// =========================================================================
// FRAME / GROUP — labeled container that holds other shapes
// Has two modes: Simple (visual only) or Smart (children parented)
// =========================================================================

const FrameShape = ({ id, data, selected }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);
  const updateNodeSize = useStore((s) => s.updateNodeSize);
  const setNodePosition = useStore((s) => s.setNodePosition);
  const toggleFrameSmartMode = useStore((s) => s.toggleFrameSmartMode);
  const [width, setWidth] = useState(data?.width || 320);
  const [height, setHeight] = useState(data?.height || 240);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data?.label ?? 'Frame');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const isSmartMode = data?.smartMode ?? false;
  const bgColor = data?.bgColor || 'rgba(99, 102, 241, 0.05)';
  const borderColor = data?.borderColor || '#6366f1';

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
      if (direction.includes('e')) newW = Math.max(120, startW + dx);
      if (direction.includes('w')) { newW = Math.max(120, startW - dx); newX = startX + (startW - newW); }
      if (direction.includes('s')) newH = Math.max(80, startH + dy);
      if (direction.includes('n')) { newH = Math.max(80, startH - dy); newY = startY + (startH - newH); }
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

  const onLabelBlur = () => {
    setIsEditing(false);
    updateNodeField(id, 'label', label);
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        width,
        height,
        position: 'relative',
        cursor: 'grab',
      }}
    >
      {/* Frame body */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: bgColor,
          border: isSmartMode ? `2px solid ${borderColor}` : `2px dashed ${borderColor}`,
          borderRadius: 12,
          boxShadow: selected ? `0 0 0 2px ${borderColor}40, 0 4px 16px rgba(0,0,0,0.08)` : '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.15s',
          position: 'relative',
        }}
      >
        {/* Label bar (top) */}
        <div
          style={{
            position: 'absolute',
            top: -14,
            left: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--bg-secondary)',
            border: `1.5px solid ${borderColor}`,
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 12,
            fontWeight: 700,
            color: borderColor,
            cursor: 'pointer',
            userSelect: 'none',
            zIndex: 2,
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          {isSmartMode && <Lock size={11} strokeWidth={2.5} />}
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
              className="nodrag"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'inherit',
                font: 'inherit',
                padding: 0,
                width: Math.max(60, label.length * 7),
              }}
            />
          ) : (
            <span>{label || 'Frame'}</span>
          )}
        </div>

        {/* Smart mode toggle button */}
        {selected && (
          <button
            className="nodrag tooltip"
            data-tooltip={isSmartMode ? 'Smart group (move locks children)' : 'Simple frame (visual only)'}
            onClick={(e) => {
              e.stopPropagation();
              toggleFrameSmartMode(id);
            }}
            style={{
              position: 'absolute',
              top: -14,
              right: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              background: isSmartMode ? borderColor : 'var(--bg-secondary)',
              color: isSmartMode ? '#ffffff' : borderColor,
              border: `1.5px solid ${borderColor}`,
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 10,
              fontWeight: 700,
              zIndex: 3,
              textTransform: 'uppercase',
              letterSpacing: 0.4,
            }}
          >
            {isSmartMode ? <Lock size={10} strokeWidth={3} /> : <Unlock size={10} strokeWidth={3} />}
            {isSmartMode ? 'Smart' : 'Simple'}
          </button>
        )}
      </div>

      {/* Resize handles */}
      {selected && RESIZE_HANDLES_FRAME.map(({ dir, cursor, style }) => (
        <div
          key={dir}
          className="nodrag"
          onMouseDown={(e) => onResize(e, dir)}
          style={{
            position: 'absolute',
            cursor,
            width: 12,
            height: 12,
            background: borderColor,
            border: '2px solid white',
            borderRadius: '50%',
            zIndex: 5,
            ...style,
          }}
        />
      ))}

      {/* 4-way connection handles (so frames can be connected too) */}
      <Handle id="top" type="source" position={Position.Top} isConnectableEnd={true}
        className="custom-handle"
        style={{ background: borderColor, color: borderColor, width: 10, height: 10, border: '2px solid white' }} />
      <Handle id="right" type="source" position={Position.Right} isConnectableEnd={true}
        className="custom-handle"
        style={{ background: borderColor, color: borderColor, width: 10, height: 10, border: '2px solid white' }} />
      <Handle id="bottom" type="source" position={Position.Bottom} isConnectableEnd={true}
        className="custom-handle"
        style={{ background: borderColor, color: borderColor, width: 10, height: 10, border: '2px solid white' }} />
      <Handle id="left" type="source" position={Position.Left} isConnectableEnd={true}
        className="custom-handle"
        style={{ background: borderColor, color: borderColor, width: 10, height: 10, border: '2px solid white' }} />
    </div>
  );
};

const RESIZE_HANDLES_FRAME = [
  { dir: 'nw', cursor: 'nwse-resize', style: { top: -6, left: -6 } },
  { dir: 'ne', cursor: 'nesw-resize', style: { top: -6, right: -6 } },
  { dir: 'sw', cursor: 'nesw-resize', style: { bottom: -6, left: -6 } },
  { dir: 'se', cursor: 'nwse-resize', style: { bottom: -6, right: -6 } },
];

// =========================================================================
// EXPORT - the shape registry
// =========================================================================

export const shapeNodeTypes = {
  shape_rectangle:    RectangleShape,
  shape_roundedRect:  RoundedRectShape,
  shape_circle:       CircleShape,
  shape_diamond:      DiamondShape,
  shape_hexagon:      HexagonShape,
  shape_cylinder:     CylinderShape,
  shape_cloud:        CloudShape,
  shape_parallelogram: ParallelogramShape,
  shape_triangle:     TriangleShape,
  shape_stickyNote:   StickyNote,
  shape_textHeading:  TextHeading,
  shape_image:        ImageNode,
  shape_frame:        FrameShape,
  shape_cloudIcon:    CloudIconNode,
};

// Sidebar metadata for each shape (for drag-drop)
export const shapeSidebarItems = [
  // Geometric shapes
  { type: 'shape_rectangle',     label: 'Rectangle',  category: 'Shapes' },
  { type: 'shape_roundedRect',   label: 'Rounded',    category: 'Shapes' },
  { type: 'shape_circle',        label: 'Circle',     category: 'Shapes' },
  { type: 'shape_diamond',       label: 'Diamond',    category: 'Shapes' },
  { type: 'shape_hexagon',       label: 'Hexagon',    category: 'Shapes' },
  { type: 'shape_triangle',      label: 'Triangle',   category: 'Shapes' },
  { type: 'shape_parallelogram', label: 'Parallelogram', category: 'Shapes' },
  // Diagram-specific
  { type: 'shape_cylinder',      label: 'Database',   category: 'Diagram' },
  { type: 'shape_cloud',         label: 'Cloud',      category: 'Diagram' },
  // Annotation
  { type: 'shape_stickyNote',    label: 'Sticky Note', category: 'Annotate' },
  { type: 'shape_textHeading',   label: 'Heading',     category: 'Annotate' },
  { type: 'shape_image',         label: 'Image',       category: 'Annotate' },
];
