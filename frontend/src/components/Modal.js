// components/Modal.js — Beautiful reusable modal

import { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ open, onClose, title, children, footer, width = 500 }) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: width }}
      >
        {title && (
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h2 style={{
              margin: 0, fontSize: '16px', fontWeight: 700,
              color: 'var(--text-primary)',
            }}>{title}</h2>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        )}
        <div style={{ padding: '20px' }}>{children}</div>
        {footer && (
          <div style={{
            padding: '12px 20px', borderTop: '1px solid var(--border-primary)',
            background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'flex-end', gap: '8px',
            borderRadius: '0 0 16px 16px',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
