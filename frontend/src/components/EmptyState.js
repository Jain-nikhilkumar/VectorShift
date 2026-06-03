// components/EmptyState.js

import { MousePointer2, ArrowLeft } from 'lucide-react';

export const EmptyState = () => {
  return (
    <div className="empty-state">
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        background: 'var(--bg-tertiary)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        border: '2px dashed var(--border-secondary)',
      }}>
        <MousePointer2 size={28} color="var(--text-tertiary)" />
      </div>
      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>
        Start building your pipeline
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ArrowLeft size={14} /> Drag a node from the sidebar
      </div>
    </div>
  );
};
