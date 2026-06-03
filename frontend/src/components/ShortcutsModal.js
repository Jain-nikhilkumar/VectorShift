// components/ShortcutsModal.js

import { Modal } from './Modal';

const SHORTCUTS = [
  { keys: ['Ctrl', 'Z'], description: 'Undo' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
  { keys: ['Ctrl', 'C'], description: 'Copy selected nodes' },
  { keys: ['Ctrl', 'V'], description: 'Paste nodes' },
  { keys: ['Ctrl', 'D'], description: 'Duplicate selected' },
  { keys: ['Delete'], description: 'Delete selected nodes' },
  { keys: ['Esc'], description: 'Close modal' },
  { keys: ['Drag'], description: 'Drag from sidebar to canvas' },
  { keys: ['Drag handle'], description: 'Connect node outputs to inputs' },
];

export const ShortcutsModal = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard Shortcuts" width={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {SHORTCUTS.map((s, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 12px', background: 'var(--bg-tertiary)',
            borderRadius: '8px', border: '1px solid var(--border-primary)',
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{s.description}</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {s.keys.map((k, j) => (
                <kbd key={j} style={{
                  padding: '3px 7px', fontSize: '11px', fontWeight: 600,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                  borderRadius: '5px', fontFamily: 'JetBrains Mono, monospace',
                  color: 'var(--text-primary)', boxShadow: '0 1px 0 var(--border-primary)',
                }}>{k}</kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
