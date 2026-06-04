// components/ContextMenu.js
// Right-click context menu for nodes, edges, and canvas

import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import {
  Copy, ClipboardPaste, Trash2, Files, Eye, EyeOff, Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ContextMenu = ({ menu, onClose }) => {
  const ref = useRef(null);
  const { copySelected, paste, duplicateSelected, deleteSelected, deleteEdge, clipboard } = useStore();

  useEffect(() => {
    if (!menu) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const escHandler = (e) => e.key === 'Escape' && onClose();
    setTimeout(() => {
      window.addEventListener('mousedown', handler);
      window.addEventListener('keydown', escHandler);
    }, 0);
    return () => {
      window.removeEventListener('mousedown', handler);
      window.removeEventListener('keydown', escHandler);
    };
  }, [menu, onClose]);

  if (!menu) return null;

  const isNode = menu.type === 'node';
  const isEdge = menu.type === 'edge';
  const isCanvas = menu.type === 'canvas';

  const items = [];

  if (isNode) {
    items.push(
      { icon: <Copy size={13} />, label: 'Copy', shortcut: 'Ctrl+C', onClick: () => {
        const c = copySelected();
        if (c) toast.success(`Copied ${c.nodes.length} node(s)`);
      }},
      { icon: <Files size={13} />, label: 'Duplicate', shortcut: 'Ctrl+D', onClick: () => {
        duplicateSelected();
        toast.success('Duplicated');
      }},
      { divider: true },
      { icon: <Trash2 size={13} />, label: 'Delete', shortcut: 'Del', danger: true, onClick: () => {
        deleteSelected();
        toast.success('Deleted');
      }},
    );
  } else if (isEdge) {
    items.push(
      { icon: <Trash2 size={13} />, label: 'Delete edge', shortcut: 'Del', danger: true, onClick: () => {
        deleteEdge(menu.targetId);
        toast.success('Edge deleted');
      }},
    );
  } else if (isCanvas) {
    items.push(
      { icon: <ClipboardPaste size={13} />, label: 'Paste here',
        shortcut: 'Ctrl+V',
        disabled: !clipboard,
        onClick: () => {
          if (clipboard) {
            paste();
            toast.success('Pasted');
          }
        }
      },
    );
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: menu.x,
        top: menu.y,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: '10px',
        boxShadow: 'var(--shadow-lg)',
        padding: '4px',
        minWidth: 180,
        zIndex: 200,
        animation: 'fadeIn 0.1s ease',
      }}
    >
      {items.map((item, i) => item.divider ? (
        <div key={i} style={{ height: 1, background: 'var(--border-primary)', margin: '4px 6px' }} />
      ) : (
        <button
          key={i}
          disabled={item.disabled}
          onClick={() => {
            item.onClick?.();
            onClose();
          }}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center',
            gap: 10,
            padding: '7px 10px',
            border: 'none',
            background: 'transparent',
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            color: item.danger ? 'var(--danger)' : 'var(--text-primary)',
            opacity: item.disabled ? 0.4 : 1,
            borderRadius: '6px',
            fontSize: 12,
            fontWeight: 500,
            textAlign: 'left',
            transition: 'background 0.1s',
          }}
          onMouseEnter={(e) => !item.disabled && (e.currentTarget.style.background = 'var(--bg-tertiary)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {item.icon}
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.shortcut && (
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
              {item.shortcut}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
