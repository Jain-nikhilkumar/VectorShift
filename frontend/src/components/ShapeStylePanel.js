// components/ShapeStylePanel.js
// Right-side panel that appears when a shape (or multiple shapes) is selected.
// Lets users change fill color, stroke color, stroke width, opacity, text color, etc.

import { useState, useEffect, useRef } from 'react';
import { Palette, Droplet, Minus, Type as TypeIcon, X, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store';

// Curated color palettes for fill and stroke
const FILL_PALETTE = [
  '#ffffff', '#f3f4f6', '#e5e7eb',         // neutrals
  '#fee2e2', '#fed7aa', '#fef08a',         // warm
  '#bbf7d0', '#a5f3fc', '#bfdbfe',         // cool
  '#ddd6fe', '#fbcfe8', '#fce7f3',         // pinks/purples
  '#fef3c7', '#dcfce7', '#dbeafe',         // pastel
  '#e0e7ff', '#fae8ff', '#e0f2fe',         // light tints
];

const STROKE_PALETTE = [
  '#000000', '#374151', '#6b7280',         // grays
  '#dc2626', '#ea580c', '#d97706',         // warm
  '#16a34a', '#0891b2', '#2563eb',         // cool
  '#7c3aed', '#c026d3', '#db2777',         // purple/pink
  '#0ea5e9', '#22c55e', '#f59e0b',         // brand
  '#6366f1', '#a855f7', '#ec4899',         // accent
];

const TEXT_COLORS = [
  '#000000', '#1f2937', '#4b5563', '#9ca3af',
  '#ffffff', '#dc2626', '#16a34a', '#2563eb',
  '#7c3aed', '#db2777', '#ea580c', '#0891b2',
];

const STROKE_WIDTHS = [
  { value: 0,   label: 'None' },
  { value: 1,   label: 'Thin' },
  { value: 1.5, label: 'M' },
  { value: 2.5, label: 'Thick' },
  { value: 4,   label: 'XL' },
];

// Detect if a selected node is a "shape" (vs pipeline node)
const isShapeNode = (node) => node?.type?.startsWith('shape_');

export const ShapeStylePanel = () => {
  const nodes = useStore((s) => s.nodes);
  const selectedNodes = useStore((s) => s.selectedNodes);
  const updateNodeField = useStore((s) => s.updateNodeField);

  // Find selected shape nodes
  const selectedShapes = nodes.filter(
    (n) => selectedNodes.includes(n.id) && isShapeNode(n)
  );

  // Only show panel if at least one shape is selected
  if (selectedShapes.length === 0) return null;

  // Use the FIRST selected shape as the "current" reference
  const primary = selectedShapes[0];
  const isMulti = selectedShapes.length > 1;

  const fill = primary.data?.fill || '#ffffff';
  const stroke = primary.data?.stroke || '#64748b';
  const strokeWidth = primary.data?.strokeWidth ?? 1.5;
  const opacity = primary.data?.opacity ?? 1;
  const textColor = primary.data?.textColor || '#1a1d2e';

  // Apply field change to ALL selected shapes
  const applyToAll = (field, value) => {
    selectedShapes.forEach((node) => {
      updateNodeField(node.id, field, value);
    });
  };

  // For Sticky Note (no fill/stroke), show different controls
  const isStickyNote = primary.type === 'shape_stickyNote';
  const isText = primary.type === 'shape_textHeading';
  const isImage = primary.type === 'shape_image';

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: 240,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        padding: 14,
        zIndex: 40,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        animation: 'fadeIn 0.15s ease',
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
      }}
      className="nodrag nowheel"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
        paddingBottom: 10,
        borderBottom: '1px solid var(--border-primary)',
      }}>
        <Palette size={14} style={{ color: 'var(--accent-primary)' }} />
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: 0.3,
        }}>
          {isMulti ? `${selectedShapes.length} shapes` : 'Style'}
        </span>
        <span style={{
          marginLeft: 'auto',
          fontSize: 10,
          color: 'var(--text-tertiary)',
          fontFamily: 'ui-monospace, monospace',
        }}>
          {!isMulti && primary.type.replace('shape_', '')}
        </span>
      </div>

      {/* STICKY NOTE: just bg color */}
      {isStickyNote && (
        <>
          <SectionLabel>Note Color</SectionLabel>
          <ColorGrid
            colors={['#fef08a', '#fde68a', '#fdba74', '#fca5a5', '#f9a8d4', '#c4b5fd', '#a7f3d0', '#a5f3fc']}
            selected={primary.data?.bgColor || '#fef08a'}
            onChange={(v) => applyToAll('bgColor', v)}
          />
        </>
      )}

      {/* TEXT HEADING: variant and color */}
      {isText && (
        <>
          <SectionLabel>Variant</SectionLabel>
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            {['h1', 'h2', 'h3', 'body'].map((v) => (
              <button
                key={v}
                onClick={() => applyToAll('variant', v)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  background: primary.data?.variant === v ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: primary.data?.variant === v ? 'var(--accent-fg)' : 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </>
      )}

      {/* IMAGE: only opacity */}
      {isImage && (
        <>
          <SectionLabel>Opacity</SectionLabel>
          <OpacitySlider value={opacity} onChange={(v) => applyToAll('opacity', v)} />
        </>
      )}

      {/* GEOMETRIC SHAPES: full controls */}
      {!isStickyNote && !isText && !isImage && (
        <>
          {/* FILL */}
          <SectionLabel>
            <Droplet size={11} /> Fill
          </SectionLabel>
          <ColorGrid colors={FILL_PALETTE} selected={fill} onChange={(v) => applyToAll('fill', v)} />
          <CustomColorInput value={fill} onChange={(v) => applyToAll('fill', v)} />

          {/* STROKE */}
          <SectionLabel style={{ marginTop: 14 }}>
            <Minus size={11} /> Border
          </SectionLabel>
          <ColorGrid colors={STROKE_PALETTE} selected={stroke} onChange={(v) => applyToAll('stroke', v)} />
          <CustomColorInput value={stroke} onChange={(v) => applyToAll('stroke', v)} />

          {/* STROKE WIDTH */}
          <SectionLabel style={{ marginTop: 14 }}>Border Width</SectionLabel>
          <div style={{ display: 'flex', gap: 4 }}>
            {STROKE_WIDTHS.map((w) => (
              <button
                key={w.value}
                onClick={() => applyToAll('strokeWidth', w.value)}
                title={w.label}
                style={{
                  flex: 1,
                  height: 30,
                  background: strokeWidth === w.value ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {w.value === 0 ? (
                  <X size={12} color={strokeWidth === w.value ? 'var(--accent-fg)' : 'var(--text-tertiary)'} />
                ) : (
                  <div style={{
                    width: 18,
                    height: w.value,
                    background: strokeWidth === w.value ? 'var(--accent-fg)' : 'var(--text-secondary)',
                    borderRadius: 1,
                  }} />
                )}
              </button>
            ))}
          </div>

          {/* TEXT COLOR */}
          <SectionLabel style={{ marginTop: 14 }}>
            <TypeIcon size={11} /> Text
          </SectionLabel>
          <ColorGrid colors={TEXT_COLORS} selected={textColor} onChange={(v) => applyToAll('textColor', v)} />

          {/* OPACITY */}
          <SectionLabel style={{ marginTop: 14 }}>Opacity</SectionLabel>
          <OpacitySlider value={opacity} onChange={(v) => applyToAll('opacity', v)} />
        </>
      )}
    </div>
  );
};

// ---------- Sub-components ----------

const SectionLabel = ({ children, style }) => (
  <div style={{
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--text-tertiary)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    ...style,
  }}>
    {children}
  </div>
);

const ColorGrid = ({ colors, selected, onChange }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 4,
    marginBottom: 6,
  }}>
    {colors.map((c) => (
      <button
        key={c}
        onClick={() => onChange(c)}
        title={c}
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          background: c,
          border: selected.toLowerCase() === c.toLowerCase()
            ? `2px solid var(--accent-primary)`
            : '1px solid var(--border-primary)',
          borderRadius: 5,
          cursor: 'pointer',
          padding: 0,
          transition: 'transform 0.1s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      />
    ))}
  </div>
);

const CustomColorInput = ({ value, onChange }) => {
  const inputRef = useRef(null);
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
      padding: '4px 6px',
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border-primary)',
      borderRadius: 5,
    }}>
      <button
        onClick={() => inputRef.current?.click()}
        style={{
          width: 22,
          height: 22,
          background: value,
          border: '1px solid var(--border-primary)',
          borderRadius: 3,
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
        }}
        title="Pick custom color"
      />
      <input
        ref={inputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ display: 'none' }}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--text-primary)',
          fontSize: 11,
          fontFamily: 'ui-monospace, monospace',
          padding: 0,
        }}
      />
    </div>
  );
};

const OpacitySlider = ({ value, onChange }) => {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  const pct = Math.round(local * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        type="range"
        min="10"
        max="100"
        value={pct}
        onChange={(e) => {
          const v = Number(e.target.value) / 100;
          setLocal(v);
          onChange(v);
        }}
        style={{
          flex: 1,
          accentColor: 'var(--accent-primary)',
        }}
      />
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--text-secondary)',
        minWidth: 32,
        textAlign: 'right',
        fontFamily: 'ui-monospace, monospace',
      }}>
        {pct}%
      </span>
    </div>
  );
};
