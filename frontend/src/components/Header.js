// components/Header.js

import { useState } from 'react';
import { useStore } from '../store';
import { useTheme } from '../hooks/useTheme';
import { useLiveDAG } from '../hooks/useLiveDAG';
import {
  Zap, Sun, Moon, Download, Upload, Trash2,
  Undo2, Redo2, Play, KeyRound, Grid3X3, ChevronDown,
  CheckCircle2, AlertCircle, Magnet,
} from 'lucide-react';
import { exportToJSON, importFromJSON } from '../utils/pipelineStorage';
import { ThemeSwitcher } from './ThemeSwitcher';
import toast from 'react-hot-toast';

export const Header = ({ onSubmit, onShowShortcuts, gridSettings, updateGridSettings }) => {
  const { theme, toggleTheme } = useTheme();
  const { nodes, edges, nodeIDs, undo, redo, canUndo, canRedo, clearAll, loadPipeline } = useStore();
  const { isDag, cycleEdgeIds } = useLiveDAG();
  const [gridMenuOpen, setGridMenuOpen] = useState(false);

  const handleExport = () => {
    if (nodes.length === 0) {
      toast.error('Canvas is empty');
      return;
    }
    const filename = prompt('Filename (without .json):', `pipeline-${Date.now()}`);
    if (!filename) return;
    exportToJSON({ nodes, edges, nodeIDs, version: 2 }, `${filename}.json`);
    toast.success(`Exported as ${filename}.json`);
  };

  const handleImport = async () => {
    try {
      const data = await importFromJSON();
      loadPipeline(data);
      toast.success('Imported');
    } catch (err) {
      toast.error('Import failed: ' + err);
    }
  };

  const handleClear = () => {
    if (nodes.length === 0) return;
    if (window.confirm('Clear the entire canvas?')) {
      clearAll();
      toast('Cleared');
    }
  };

  return (
    <header
      style={{
        height: '56px',
        padding: '0 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '8px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'var(--accent-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', boxShadow: 'var(--shadow-md)',
        }}>
          <Zap size={18} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            VectorShift
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px', fontWeight: 500 }}>
            Pipeline Builder
          </div>
        </div>
      </div>

      <Divider />

      <button className="btn btn-ghost btn-icon tooltip" data-tooltip="Undo (Ctrl+Z)"
        onClick={undo} disabled={!canUndo()} style={{ opacity: canUndo() ? 1 : 0.4 }}>
        <Undo2 size={18} />
      </button>
      <button className="btn btn-ghost btn-icon tooltip" data-tooltip="Redo (Ctrl+Shift+Z)"
        onClick={redo} disabled={!canRedo()} style={{ opacity: canRedo() ? 1 : 0.4 }}>
        <Redo2 size={18} />
      </button>

      <Divider />

      <button className="btn btn-ghost tooltip" data-tooltip="Download as JSON" onClick={handleExport}>
        <Download size={15} /> Export
      </button>
      <button className="btn btn-ghost tooltip" data-tooltip="Load a JSON file" onClick={handleImport}>
        <Upload size={15} /> Import
      </button>
      <button className="btn btn-ghost btn-icon tooltip" data-tooltip="Clear canvas" onClick={handleClear}>
        <Trash2 size={18} />
      </button>

      <Divider />

      {/* Grid settings */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-ghost tooltip"
          data-tooltip="Grid settings"
          onClick={() => setGridMenuOpen((v) => !v)}
        >
          <Grid3X3 size={15} /> Grid <ChevronDown size={12} />
        </button>

        {gridMenuOpen && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 49 }}
              onClick={() => setGridMenuOpen(false)}
            />
            <div style={{
              position: 'absolute', top: '110%', left: 0,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '10px', boxShadow: 'var(--shadow-lg)',
              padding: 8, minWidth: 200, zIndex: 50,
              animation: 'fadeIn 0.15s ease',
            }}>
              <div style={miniHeader}>Grid type</div>
              {['dots', 'lines', 'none'].map((t) => (
                <button key={t} onClick={() => updateGridSettings({ gridType: t })}
                  style={{
                    ...menuRow,
                    background: gridSettings.gridType === t ? 'var(--bg-tertiary)' : 'transparent',
                    fontWeight: gridSettings.gridType === t ? 600 : 500,
                  }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                  {gridSettings.gridType === t && <CheckCircle2 size={12} color="var(--accent-primary)" />}
                </button>
              ))}
              <div style={{ height: 1, background: 'var(--border-primary)', margin: '4px 0' }} />
              <div style={miniHeader}>Snap to grid</div>
              <div style={{ ...menuRow, cursor: 'default' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <Magnet size={12} /> Snap enabled
                </span>
                <Toggle value={gridSettings.snapEnabled}
                  onChange={(v) => updateGridSettings({ snapEnabled: v })} />
              </div>
              <div style={{ ...menuRow, cursor: 'default' }}>
                <span style={{ flex: 1 }}>Alignment guides</span>
                <Toggle value={gridSettings.showGuides}
                  onChange={(v) => updateGridSettings({ showGuides: v })} />
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Live DAG status badge */}
      <div
        style={{
          padding: '7px 13px',
          background: isDag ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: isDag ? '#10b981' : '#ef4444',
          border: `1px solid ${isDag ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: '8px',
          fontSize: '12px', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '6px',
          letterSpacing: '0.3px',
        }}
      >
        {isDag ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
        <span>{isDag ? 'Valid DAG' : `${cycleEdgeIds.length} cycle${cycleEdgeIds.length === 1 ? '' : 's'}`}</span>
      </div>

      <div style={{
        padding: '7px 11px', background: 'var(--bg-tertiary)', borderRadius: '8px',
        fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600,
        display: 'flex', gap: '8px',
      }}>
        <span>●{nodes.length}</span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span>↔{edges.length}</span>
      </div>

      <button className="btn btn-ghost btn-icon tooltip" data-tooltip="Keyboard shortcuts" onClick={onShowShortcuts}>
        <KeyRound size={18} />
      </button>

      <ThemeSwitcher />

      <button className="btn btn-ghost btn-icon tooltip"
        data-tooltip={theme === 'light' ? 'Dark mode' : 'Light mode'}
        onClick={toggleTheme}>
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <button className="btn btn-primary" onClick={onSubmit}>
        <Play size={14} /> Run Pipeline
      </button>
    </header>
  );
};

const Divider = () => <div style={{ width: '1px', height: '24px', background: 'var(--border-primary)' }} />;

const miniHeader = {
  fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)',
  textTransform: 'uppercase', letterSpacing: '0.6px',
  padding: '6px 8px 4px',
};

const menuRow = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: 8, padding: '7px 8px',
  border: 'none', background: 'transparent', cursor: 'pointer',
  width: '100%', borderRadius: 6,
  fontSize: 12, color: 'var(--text-primary)', textAlign: 'left',
};

const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      width: 30, height: 16, borderRadius: 8,
      background: value ? 'var(--accent-primary)' : 'var(--border-secondary)',
      border: 'none', cursor: 'pointer',
      position: 'relative', transition: 'background 0.15s',
    }}
  >
    <div style={{
      position: 'absolute', top: 2,
      left: value ? 16 : 2,
      width: 12, height: 12, borderRadius: '50%',
      background: 'white', transition: 'left 0.15s',
      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
    }} />
  </button>
);
