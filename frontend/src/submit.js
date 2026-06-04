// submit.js — Works on localhost AND Vercel automatically

import { useStore } from './store';
import toast from 'react-hot-toast';

// Auto-detect environment:
// - On localhost → use local backend at :8000
// - On Vercel (production) → use relative /api path (same domain)
const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8000/pipelines/parse'
    : '/api/pipelines/parse';

export const submitPipeline = async () => {
  const { nodes, edges, setCycleEdges } = useStore.getState();

  if (nodes.length === 0) {
    toast.error('Canvas is empty — add some nodes first');
    return null;
  }

  toast.dismiss();
  const loadingId = toast.loading('Analyzing pipeline...');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges }),
    });

    toast.dismiss(loadingId);

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const data = await response.json();

    if (!data.is_dag && data.cycle_edge_ids) {
      setCycleEdges(data.cycle_edge_ids);
    } else {
      setCycleEdges([]);
    }

    if (data.is_dag) {
      toast.success('Pipeline is a valid DAG', { duration: 2500 });
    } else {
      toast.error('Cycle detected in pipeline', { duration: 2500 });
    }

    return data;
  } catch (err) {
    toast.dismiss(loadingId);
    toast.dismiss();
    toast.error(`Failed: ${err.message}`, { duration: 4000 });
    return null;
  }
};
