// components/SavedPipelinesModal.js

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { getSavedPipelines, deletePipeline } from '../utils/pipelineStorage';
import { useStore } from '../store';
import { FolderOpen, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const SavedPipelinesModal = ({ open, onClose }) => {
  const [pipelines, setPipelines] = useState([]);
  const loadPipeline = useStore((s) => s.loadPipeline);

  const refresh = () => setPipelines(getSavedPipelines());

  useEffect(() => {
    if (open) refresh();
  }, [open]);

  const handleLoad = (p) => {
    loadPipeline(p.data);
    onClose();
    toast.success(`Loaded "${p.name}"`);
  };

  const handleDelete = (e, name) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${name}"?`)) return;
    deletePipeline(name);
    refresh();
    toast(`Deleted "${name}"`);
  };

  return (
    <Modal open={open} onClose={onClose} title="Saved Pipelines" width={550}>
      {pipelines.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
          <FolderOpen size={40} style={{ opacity: 0.4, margin: '0 auto 12px' }} />
          <div style={{ fontSize: '14px', fontWeight: 600 }}>No saved pipelines yet</div>
          <div style={{ fontSize: '12px', marginTop: '6px' }}>Click "Save" in the header to save one.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '50vh', overflow: 'auto' }}>
          {pipelines.map((p) => (
            <div
              key={p.name}
              onClick={() => handleLoad(p)}
              style={{
                padding: '12px 14px', background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)', borderRadius: '10px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{p.name}</div>
                <div style={{
                  fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <Clock size={11} />
                  {new Date(p.savedAt).toLocaleString()}
                  <span style={{ opacity: 0.5 }}>•</span>
                  {p.data.nodes?.length || 0} nodes, {p.data.edges?.length || 0} edges
                </div>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={(e) => handleDelete(e, p.name)}
                style={{ color: 'var(--danger)' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
