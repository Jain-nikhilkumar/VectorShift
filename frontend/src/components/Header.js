// components/Header.js — Top bar (Save/Open localStorage removed)

import { useStore } from '../store';
import { useTheme } from '../hooks/useTheme';
import {
  Zap, Sun, Moon, Download, Upload, Trash2,
  Undo2, Redo2, Play, KeyRound,
} from 'lucide-react';
import { exportToJSON, importFromJSON } from '../utils/pipelineStorage';
import toast from 'react-hot-toast';

export const Header = ({ onSubmit, onShowShortcuts }) => {
  const { theme, toggleTheme } = useTheme();
  const { nodes, edges, nodeIDs, undo, redo, canUndo, canRedo, clearAll, loadPipeline } = useStore();

  const handleExport = () => {
    if (nodes.length === 0) {
      toast.error('Canvas is empty — nothing to export');
      return;
    }
    const filename = prompt('Filename (without .json):', `pipeline-${Date.now()}`);
    if (!filename) return;
    exportToJSON({ nodes, edges, nodeIDs, version: 1 }, `${filename}.json`);
    toast.success(`Exported as ${filename}.json`);
  };

  const handleImport = async () => {
    try {
      const data = await importFromJSON();
      loadPipeline(data);
      toast.success('Imported pipeline');
    } catch (err) {
      toast.error('Import failed: ' + err);
    }
  };

  const handleClear = () => {
    if (nodes.length === 0) return;
    if (window.confirm('Clear the entire canvas?')) {
      clearAll();
      toast('Canvas cleared');
    }
  };

  return (
    <header
      style={{
        height: '56px',
        padding: '0 20px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '16px' }}>
        <div
          style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: 'var(--shadow-md)',
          }}
        >
          <Zap size={18} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            VectorShift
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px', fontWeight: 500 }}>
            Pipeline Builder
          </div>
        </div>
      </div>

      <div style={{ width: '1px', height: '24px', background: 'var(--border-primary)' }} />

      {/* Undo / Redo */}
      <button className="btn btn-ghost btn-icon tooltip" data-tooltip="Undo (Ctrl+Z)"
        onClick={undo} disabled={!canUndo()}
        style={{ opacity: canUndo() ? 1 : 0.4 }}>
        <Undo2 size={16} />
      </button>
      <button className="btn btn-ghost btn-icon tooltip" data-tooltip="Redo (Ctrl+Shift+Z)"
        onClick={redo} disabled={!canRedo()}
        style={{ opacity: canRedo() ? 1 : 0.4 }}>
        <Redo2 size={16} />
      </button>

      <div style={{ width: '1px', height: '24px', background: 'var(--border-primary)' }} />

      {/* Export / Import (file-based — user controls everything) */}
      <button className="btn btn-ghost tooltip" data-tooltip="Download as .json file" onClick={handleExport}>
        <Download size={15} /> Export
      </button>
      <button className="btn btn-ghost tooltip" data-tooltip="Load a .json file" onClick={handleImport}>
        <Upload size={15} /> Import
      </button>
      <button className="btn btn-ghost btn-icon tooltip" data-tooltip="Clear canvas" onClick={handleClear}>
        <Trash2 size={16} />
      </button>

      <div style={{ flex: 1 }} />

      {/* Stats */}
      <div
        style={{
          padding: '6px 12px', background: 'var(--bg-tertiary)', borderRadius: '8px',
          fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600,
          display: 'flex', gap: '10px', alignItems: 'center',
        }}
      >
        <span>● {nodes.length} nodes</span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span>↔ {edges.length} edges</span>
      </div>

      {/* Shortcuts help */}
      <button className="btn btn-ghost btn-icon tooltip" data-tooltip="Keyboard shortcuts" onClick={onShowShortcuts}>
        <KeyRound size={16} />
      </button>

      {/* Theme toggle */}
      <button
        className="btn btn-ghost btn-icon tooltip"
        data-tooltip={theme === 'light' ? 'Dark mode' : 'Light mode'}
        onClick={toggleTheme}
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </button>

      {/* Run (primary) */}
      <button className="btn btn-primary" onClick={onSubmit}>
        <Play size={14} /> Run Pipeline
      </button>
    </header>
  );
};
