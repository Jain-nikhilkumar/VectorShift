// BaseNode.js
// Reusable node abstraction. All nodes are built on top of this.

import { Handle, Position } from 'reactflow';
import { useStore } from '../store';

export const BaseNode = ({
  id,
  data,
  title,
  icon,
  color = '#6366f1',
  inputs = [],   // [{ id, label, style }]
  outputs = [],  // [{ id, label, style }]
  fields = [],   // [{ type, label, name, value, options, onChange, placeholder }]
  children,      // For fully custom content (e.g. TextNode)
  width = 240,
  minHeight = 100,
}) => {
  const updateNodeField = useStore((state) => state.updateNodeField);

  const handleFieldChange = (fieldName, value, customOnChange) => {
    if (customOnChange) {
      customOnChange(value);
    } else {
      updateNodeField(id, fieldName, value);
    }
  };

  const renderField = (field, idx) => {
    const commonProps = {
      value: field.value ?? '',
      onChange: (e) => handleFieldChange(field.name, e.target.value, field.onChange),
      style: {
        width: '100%',
        padding: '6px 8px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        fontSize: '12px',
        outline: 'none',
        boxSizing: 'border-box',
        background: '#f8fafc',
      },
    };

    return (
      <div key={idx} style={{ marginBottom: '8px' }}>
        {field.label && (
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: '#475569',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
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
          <textarea {...commonProps} placeholder={field.placeholder} rows={3} />
        ) : (
          <input type={field.type || 'text'} {...commonProps} placeholder={field.placeholder} />
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        width,
        minHeight,
        background: '#ffffff',
        border: `1px solid #e2e8f0`,
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        fontFamily: 'Inter, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: color,
          padding: '8px 12px',
          color: '#fff',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        {icon && <span>{icon}</span>}
        <span>{title}</span>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px' }}>
        {fields.map(renderField)}
        {children}
      </div>

      {/* Input handles (left side) */}
      {inputs.map((handle, idx) => (
        <Handle
          key={`in-${handle.id}`}
          type="target"
          position={Position.Left}
          id={`${id}-${handle.id}`}
          style={{
            top: handle.style?.top ?? `${((idx + 1) * 100) / (inputs.length + 1)}%`,
            background: color,
            width: '10px',
            height: '10px',
            border: '2px solid #fff',
            ...handle.style,
          }}
        />
      ))}

      {/* Output handles (right side) */}
      {outputs.map((handle, idx) => (
        <Handle
          key={`out-${handle.id}`}
          type="source"
          position={Position.Right}
          id={`${id}-${handle.id}`}
          style={{
            top: handle.style?.top ?? `${((idx + 1) * 100) / (outputs.length + 1)}%`,
            background: color,
            width: '10px',
            height: '10px',
            border: '2px solid #fff',
            ...handle.style,
          }}
        />
      ))}
    </div>
  );
};
