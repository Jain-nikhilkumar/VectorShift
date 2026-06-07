// components/ExecutionConsole.js
// Slide-up panel from the bottom showing pipeline execution logs.
// Click a node on the canvas to see its output details.

import { useEffect, useRef, useState } from 'react';
import { X, Square, RotateCcw, Terminal, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export const ExecutionConsole = ({
  isRunning,
  logs,
  nodeOutputs,
  onStop,
  onReset,
  onClose,
  selectedNodeId,
}) => {
  const logsRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Auto-scroll to bottom as logs come in
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  // If a node is selected and we have its output, show output panel
  const selectedOutput = selectedNodeId ? nodeOutputs?.[selectedNodeId] : null;

  const copyToClipboard = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div
      className="nodrag nowheel"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: collapsed ? 38 : 280,
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-primary)',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'height 0.2s ease',
        zIndex: 30,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 14px',
          borderBottom: collapsed ? 'none' : '1px solid var(--border-primary)',
          flexShrink: 0,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'inherit',
        }}>
          {isRunning ? (
            <div className="spinner" style={{
              width: 12, height: 12,
              border: '2px solid var(--border-primary)',
              borderTopColor: '#10b981',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }} />
          ) : (
            <Terminal size={14} style={{ color: 'var(--text-secondary)' }} />
          )}
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: 0.3,
            fontFamily: 'Inter, sans-serif',
          }}>
            Execution Console
          </span>
          {isRunning && (
            <span style={{
              fontSize: 10,
              padding: '2px 6px',
              background: '#10b98120',
              color: '#10b981',
              borderRadius: 3,
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
            }}>
              RUNNING
            </span>
          )}
          <span style={{
            marginLeft: 6,
            fontSize: 11,
            color: 'var(--text-tertiary)',
            fontFamily: 'inherit',
          }}>
            {logs.length} {logs.length === 1 ? 'event' : 'events'}
          </span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          {isRunning ? (
            <button
              className="btn btn-ghost"
              onClick={onStop}
              style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#ef4444' }}
            >
              <Square size={12} /> Stop
            </button>
          ) : (
            <button
              className="btn btn-ghost"
              onClick={onReset}
              style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}
            >
              <RotateCcw size={12} /> Clear
            </button>
          )}
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setCollapsed(!collapsed)}
            style={{ width: 26, height: 26 }}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            style={{ width: 26, height: 26 }}
            title="Close console"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* BODY */}
      {!collapsed && (
        <div style={{
          flex: 1,
          display: 'flex',
          minHeight: 0,
        }}>
          {/* LEFT: Logs */}
          <div
            ref={logsRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 14px',
              fontSize: 12,
              lineHeight: 1.7,
              minWidth: 0,
            }}
          >
            {logs.length === 0 ? (
              <div style={{
                color: 'var(--text-tertiary)',
                padding: '24px 0',
                textAlign: 'center',
                fontFamily: 'Inter, sans-serif',
              }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                  No logs yet
                </div>
                <div style={{ fontSize: 11 }}>
                  Click "Run Pipeline" to see execution flow
                </div>
              </div>
            ) : (
              logs.map((log, i) => <LogLine key={i} log={log} />)
            )}
          </div>

          {/* RIGHT: Output inspector (when a node is selected) */}
          {selectedOutput && (
            <div style={{
              width: 320,
              borderLeft: '1px solid var(--border-primary)',
              padding: '8px 14px',
              overflowY: 'auto',
              minHeight: 0,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  Output · {selectedNodeId}
                </div>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => copyToClipboard(JSON.stringify(selectedOutput, null, 2), 'output')}
                  style={{ width: 22, height: 22 }}
                  title="Copy JSON"
                >
                  {copiedId === 'output' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                </button>
              </div>
              <pre style={{
                background: 'var(--bg-tertiary)',
                padding: 10,
                borderRadius: 6,
                fontSize: 11,
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                margin: 0,
                overflowX: 'auto',
                fontFamily: 'inherit',
                border: '1px solid var(--border-primary)',
              }}>
                {JSON.stringify(selectedOutput, null, 2)}
              </pre>
              <div style={{
                fontSize: 10,
                color: 'var(--text-tertiary)',
                marginTop: 6,
                fontStyle: 'italic',
                fontFamily: 'Inter, sans-serif',
              }}>
                💡 Tip: Click any node on the canvas to inspect its output
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// One log row with colored level marker
const LogLine = ({ log }) => {
  const colors = {
    info:    '#3b82f6',
    success: '#10b981',
    error:   '#ef4444',
    warn:    '#f59e0b',
    running: '#8b5cf6',
  };
  const c = colors[log.level] || 'var(--text-secondary)';
  const time = new Date(log.ts).toLocaleTimeString('en-US', { hour12: false });
  return (
    <div style={{
      display: 'flex',
      gap: 10,
      paddingBottom: 4,
      color: 'var(--text-primary)',
    }}>
      <span style={{
        color: 'var(--text-tertiary)',
        fontSize: 10,
        flexShrink: 0,
        paddingTop: 2,
      }}>
        {time}
      </span>
      <span style={{
        color: c,
        fontWeight: 700,
        textTransform: 'uppercase',
        fontSize: 10,
        flexShrink: 0,
        paddingTop: 2,
        minWidth: 56,
      }}>
        {log.level}
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ color: 'var(--text-primary)' }}>{log.message}</div>
        {log.detail && (
          <div style={{
            color: 'var(--text-tertiary)',
            fontSize: 11,
            marginTop: 1,
            wordBreak: 'break-word',
          }}>
            {log.detail}
          </div>
        )}
      </div>
    </div>
  );
};
