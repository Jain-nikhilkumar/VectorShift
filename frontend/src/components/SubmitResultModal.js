// components/SubmitResultModal.js

import { Modal } from './Modal';
import { CheckCircle2, XCircle, GitMerge, Box } from 'lucide-react';

export const SubmitResultModal = ({ open, onClose, result }) => {
  if (!result) return null;
  const isDag = result.is_dag;

  return (
    <Modal open={open} onClose={onClose} title="Pipeline Analysis" width={460}
      footer={
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Status banner */}
        <div
          style={{
            padding: '14px 16px', borderRadius: '10px',
            background: isDag ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${isDag ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            display: 'flex', alignItems: 'center', gap: '12px',
          }}
        >
          {isDag
            ? <CheckCircle2 size={28} color="#10b981" />
            : <XCircle size={28} color="#ef4444" />}
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
              {isDag ? 'Valid Pipeline' : 'Cycle Detected'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isDag
                ? 'Pipeline is a valid Directed Acyclic Graph.'
                : 'Pipeline contains a cycle - cyclical edges highlighted in red on the canvas.'}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <StatCard icon={<Box size={18} />} label="Nodes" value={result.num_nodes} color="#6366f1" />
          <StatCard icon={<GitMerge size={18} />} label="Edges" value={result.num_edges} color="#8b5cf6" />
        </div>
      </div>
    </Modal>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    padding: '14px', background: 'var(--bg-tertiary)',
    borderRadius: '10px', border: '1px solid var(--border-primary)',
  }}>
    <div style={{ color, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {icon} {label}
    </div>
    <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
      {value}
    </div>
  </div>
);
