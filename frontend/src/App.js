// App.js — Main app (Save/Load modal removed — using Export/Import only)

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PipelineUI } from './ui';
import { SubmitResultModal } from './components/SubmitResultModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { useTheme } from './hooks/useTheme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { submitPipeline } from './submit';

function App() {
  const { theme } = useTheme();
  useKeyboardShortcuts();

  const [submitResult, setSubmitResult] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleSubmit = async () => {
    const result = await submitPipeline();
    if (result) setSubmitResult(result);
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-primary)',
    }}>
      <Header
        onSubmit={handleSubmit}
        onShowShortcuts={() => setShowShortcuts(true)}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <PipelineUI />
      </div>

      <SubmitResultModal
        open={!!submitResult}
        onClose={() => setSubmitResult(null)}
        result={submitResult}
      />
      <ShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />

      <Toaster
        position="bottom-right"
        toastOptions={{
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

export default App;
