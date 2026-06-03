// textNode.js
// Includes Part 3: auto-resize + {{variable}} → dynamic handles

import { useState, useEffect, useRef, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { BaseNode } from './BaseNode';

// Match valid JS variable names inside {{ ... }}
const VAR_REGEX = /\{\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\}/g;

export const TextNode = ({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const [dimensions, setDimensions] = useState({ width: 240, height: 100 });
  const textareaRef = useRef(null);

  // Extract unique variable names from the text
  const variables = useMemo(() => {
    const matches = [...currText.matchAll(VAR_REGEX)];
    return [...new Set(matches.map((m) => m[1]))];
  }, [currText]);

  // Auto-resize: measure the textarea content and grow the node
  useEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;

      // Calculate node dimensions based on content
      const lines = currText.split('\n');
      const longestLine = Math.max(...lines.map((l) => l.length), 10);
      const newWidth = Math.min(Math.max(240, longestLine * 8 + 40), 500);
      const newHeight = Math.max(100, 80 + el.scrollHeight);

      setDimensions({ width: newWidth, height: newHeight });
    }
  }, [currText]);

  return (
    <div
      style={{
        width: dimensions.width,
        minHeight: dimensions.height,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        fontFamily: 'Inter, -apple-system, sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#f59e0b',
          padding: '8px 12px',
          color: '#fff',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span>📝</span>
        <span>Text</span>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px' }}>
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
          Text
        </label>
        <textarea
          ref={textareaRef}
          value={currText}
          onChange={(e) => setCurrText(e.target.value)}
          placeholder="Type text. Use {{variableName}} to create inputs."
          style={{
            width: '100%',
            minHeight: '40px',
            padding: '6px 8px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '12px',
            outline: 'none',
            resize: 'none',
            overflow: 'hidden',
            boxSizing: 'border-box',
            background: '#f8fafc',
            fontFamily: 'inherit',
          }}
        />
        {variables.length > 0 && (
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#94a3b8' }}>
            Variables: {variables.join(', ')}
          </div>
        )}
      </div>

      {/* Dynamic input handles for each variable */}
      {variables.map((v, idx) => (
        <Handle
          key={`var-${v}`}
          type="target"
          position={Position.Left}
          id={`${id}-${v}`}
          style={{
            top: `${((idx + 1) * 100) / (variables.length + 1)}%`,
            background: '#f59e0b',
            width: '10px',
            height: '10px',
            border: '2px solid #fff',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: '14px',
              top: '-8px',
              fontSize: '10px',
              color: '#475569',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {v}
          </span>
        </Handle>
      ))}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-output`}
        style={{
          background: '#f59e0b',
          width: '10px',
          height: '10px',
          border: '2px solid #fff',
        }}
      />
    </div>
  );
};
