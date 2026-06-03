// toolbar.js

import { DraggableNode } from './draggableNode';

const nodeConfigs = [
  { type: 'customInput', label: 'Input', icon: '📥', color: '#3b82f6' },
  { type: 'customOutput', label: 'Output', icon: '📤', color: '#10b981' },
  { type: 'llm', label: 'LLM', icon: '🤖', color: '#8b5cf6' },
  { type: 'text', label: 'Text', icon: '📝', color: '#f59e0b' },
  { type: 'filter', label: 'Filter', icon: '🔍', color: '#ef4444' },
  { type: 'math', label: 'Math', icon: '🧮', color: '#06b6d4' },
  { type: 'api', label: 'API', icon: '🌐', color: '#0ea5e9' },
  { type: 'delay', label: 'Delay', icon: '⏱️', color: '#a855f7' },
  { type: 'database', label: 'Database', icon: '🗄️', color: '#0f766e' },
];

export const PipelineToolbar = () => {
  return (
    <div
      style={{
        padding: '16px 20px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '10px',
        }}
      >
        Drag a node to the canvas
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {nodeConfigs.map((cfg) => (
          <DraggableNode
            key={cfg.type}
            type={cfg.type}
            label={cfg.label}
            icon={cfg.icon}
            color={cfg.color}
          />
        ))}
      </div>
    </div>
  );
};
