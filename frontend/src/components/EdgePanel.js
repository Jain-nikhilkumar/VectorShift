// components/EdgePanel.js
// Figma-style right-side panel for advanced edge properties

import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { X, Sparkles, Tag, ArrowRight, Eye } from 'lucide-react';

export const EdgePanel = ({ open, onClose }) => {
  const edges = useStore((s) => s.edges);
  const selectedEdges = useStore((s) => s.selectedEdges);
  const updateEdge = useStore((s) => s.updateEdge);
  const deleteEdge = useStore((s) => s.deleteEdge);

  const selectedEdge = selectedEdges.length === 1
    ? edges.find((e) => e.id === selectedEdges[0])
    : null;

  const [label, setLabel] = useState('');

  useEffect(() => {
    setLabel(selectedEdge?.data?.label || '');
  }, [selectedEdge]);

  if (!open || !selectedEdge) return null;

  const animated = selectedEdge.animated ?? true;
  const opacity = selectedEdge.style?.opacity ?? 1;
  const offset = selectedEdge.data?.midpointOffset || { x: 0, y: 0 };

  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        top: 72,
        bottom: 16,
        width: 300,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: '14px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        animation: 'slideInRight 0.2s ease',
        overflow: 'hidden',
      }}
    >
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Edge Properties
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            {selectedEdge.id}
          </div>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {/* Label */}
        <Section icon={<Tag size={13} />} title="Label">
          <input
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              updateEdge(selectedEdge.id, { data: { ...selectedEdge.data, label: e.target.value } });
            }}
            placeholder="e.g. on success"
            className="input-base"
          />
        </Section>

        {/* Animation */}
        <Section icon={<Sparkles size={13} />} title="Animation">
          <ToggleRow
            label="Animated flow"
            value={animated}
            onChange={(v) => updateEdge(selectedEdge.id, { animated: v })}
          />
        </Section>

        {/* Arrow */}
        <Section icon={<ArrowRight size={13} />} title="Arrow">
          <SelectRow
            label="End marker"
            value={selectedEdge.markerEnd?.type || 'arrowclosed'}
            options={[
              { value: 'arrow',       label: 'Open arrow' },
              { value: 'arrowclosed', label: 'Closed arrow' },
            ]}
            onChange={(v) => updateEdge(selectedEdge.id, {
              markerEnd: { ...selectedEdge.markerEnd, type: v },
            })}
          />
          <SliderRow
            label="Arrow size"
            value={selectedEdge.markerEnd?.width || 18}
            min={8} max={32}
            onChange={(v) => updateEdge(selectedEdge.id, {
              markerEnd: { ...selectedEdge.markerEnd, width: v, height: v },
            })}
          />
        </Section>

        {/* Appearance */}
        <Section icon={<Eye size={13} />} title="Appearance">
          <SliderRow
            label="Opacity"
            value={Math.round(opacity * 100)}
            min={20} max={100}
            suffix="%"
            onChange={(v) => updateEdge(selectedEdge.id, {
              style: { opacity: v / 100 },
            })}
          />
          <SliderRow
            label="Stroke width"
            value={selectedEdge.style?.strokeWidth || 2}
            min={1} max={8}
            suffix="px"
            onChange={(v) => updateEdge(selectedEdge.id, { style: { strokeWidth: v } })}
          />
        </Section>

        {/* Path */}
        <Section title="Path">
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8, lineHeight: 1.4 }}>
            Curvature offset (drag the midpoint dot on the edge to bend it visually)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={miniLabelStyle}>Offset X</label>
              <input type="number" value={Math.round(offset.x)}
                onChange={(e) => updateEdge(selectedEdge.id, {
                  data: { ...selectedEdge.data, midpointOffset: { x: parseInt(e.target.value || 0), y: offset.y } },
                })}
                className="input-base" />
            </div>
            <div>
              <label style={miniLabelStyle}>Offset Y</label>
              <input type="number" value={Math.round(offset.y)}
                onChange={(e) => updateEdge(selectedEdge.id, {
                  data: { ...selectedEdge.data, midpointOffset: { x: offset.x, y: parseInt(e.target.value || 0) } },
                })}
                className="input-base" />
            </div>
          </div>
          <button
            className="btn btn-ghost"
            style={{ marginTop: 8, fontSize: 11, width: '100%' }}
            onClick={() => updateEdge(selectedEdge.id, {
              data: { ...selectedEdge.data, midpointOffset: { x: 0, y: 0 } },
            })}
          >
            Reset path
          </button>
        </Section>
      </div>

      {/* Footer */}
      <div style={{
        padding: 12,
        borderTop: '1px solid var(--border-primary)',
        background: 'var(--bg-tertiary)',
      }}>
        <button
          className="btn"
          onClick={() => deleteEdge(selectedEdge.id)}
          style={{
            width: '100%',
            background: 'var(--danger)',
            color: 'white',
          }}
        >
          Delete edge
        </button>
      </div>
    </div>
  );
};

const miniLabelStyle = {
  display: 'block', fontSize: 10, fontWeight: 700,
  color: 'var(--text-tertiary)', marginBottom: 4,
  textTransform: 'uppercase', letterSpacing: '0.6px',
};

const Section = ({ icon, title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{
      fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)',
      textTransform: 'uppercase', letterSpacing: '0.6px',
      marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {icon} {title}
    </div>
    {children}
  </div>
);

const ToggleRow = ({ label, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
    <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{label}</span>
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 36, height: 20,
        borderRadius: 10,
        background: value ? 'var(--accent-primary)' : 'var(--border-secondary)',
        border: 'none', cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.15s',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 2,
        left: value ? 18 : 2,
        width: 16, height: 16,
        borderRadius: '50%',
        background: 'white',
        transition: 'left 0.15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  </div>
);

const SelectRow = ({ label, value, options, onChange }) => (
  <div style={{ marginBottom: 8 }}>
    <label style={miniLabelStyle}>{label}</label>
    <select className="input-base" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const SliderRow = ({ label, value, min, max, suffix = '', onChange }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <label style={miniLabelStyle}>{label}</label>
      <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600 }}>
        {value}{suffix}
      </span>
    </div>
    <input
      type="range" min={min} max={max} value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
    />
  </div>
);
