// submit.js

import { useStore } from './store';

export const SubmitButton = () => {
  const { nodes, edges } = useStore((state) => ({
    nodes: state.nodes,
    edges: state.edges,
  }));

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8000/pipelines/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();

      alert(
        `✅ Pipeline Submitted Successfully!\n\n` +
        `📊 Number of Nodes: ${data.num_nodes}\n` +
        `🔗 Number of Edges: ${data.num_edges}\n` +
        `🧩 Is DAG: ${data.is_dag ? 'Yes ✔' : 'No ✘'}\n\n` +
        `${data.is_dag
          ? 'Your pipeline is a valid Directed Acyclic Graph.'
          : 'Warning: Your pipeline contains a cycle.'}`
      );
    } catch (err) {
      alert(
        `❌ Failed to submit pipeline.\n\n` +
        `${err.message}\n\n` +
        `Make sure the backend is running at http://localhost:8000`
      );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <button
        type="button"
        onClick={handleSubmit}
        style={{
          padding: '10px 32px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#fff',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
        }}
      >
        Submit Pipeline
      </button>
    </div>
  );
};
