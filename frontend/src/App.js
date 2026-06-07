// App.js — Final production app

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ReactFlowProvider } from 'reactflow';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PipelineUI } from './ui';
import { SubmitResultModal } from './components/SubmitResultModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { EdgeToolbar } from './components/EdgeToolbar';
import { EdgePanel } from './components/EdgePanel';
import { ExecutionConsole } from './components/ExecutionConsole';
import { useTheme } from './hooks/useTheme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useGridSettings } from './hooks/useGridSettings';
import { usePipelineExecution } from './hooks/usePipelineExecution';
import { useStore } from './store';

function AppInner() {
  const { theme } = useTheme();
  const { settings: gridSettings, update: updateGridSettings } = useGridSettings();
  useKeyboardShortcuts();

  const [submitResult, setSubmitResult] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showEdgePanel, setShowEdgePanel] = useState(false);
  const [showConsole, setShowConsole] = useState(false);

  const execution = usePipelineExecution();
  const selectedNodes = useStore((s) => s.selectedNodes);
  const selectedNodeId = selectedNodes?.[0];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleRunPipeline = () => {
    setShowConsole(true);
    execution.run();
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-primary)',
    }}>
      <Header
        onSubmit={handleRunPipeline}
        onShowShortcuts={() => setShowShortcuts(true)}
        gridSettings={gridSettings}
        updateGridSettings={updateGridSettings}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <Sidebar />
        <PipelineUI gridSettings={gridSettings} execution={execution} />

        {/* Execution Console — slides up from bottom while running or after */}
        {showConsole && (
          <ExecutionConsole
            isRunning={execution.isRunning}
            logs={execution.logs}
            nodeOutputs={execution.nodeOutputs}
            onStop={execution.stop}
            onReset={() => {
              execution.reset();
            }}
            onClose={() => {
              execution.reset();
              setShowConsole(false);
            }}
            selectedNodeId={selectedNodeId}
          />
        )}
      </div>

      {/* Edge editing UI */}
      <EdgeToolbar onOpenPanel={() => setShowEdgePanel(true)} />
      <EdgePanel open={showEdgePanel} onClose={() => setShowEdgePanel(false)} />

      <SubmitResultModal
        open={!!submitResult}
        onClose={() => setSubmitResult(null)}
        result={submitResult}
      />
      <ShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />

      <Toaster
        position="bottom-right"
        gutter={8}
        toastOptions={{
          duration: 2200,
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-md)',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <AppInner />
    </ReactFlowProvider>
  );
}

export default App;
