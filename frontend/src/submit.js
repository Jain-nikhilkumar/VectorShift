// submit.js — Backend integration

import { useStore } from './store';
import toast from 'react-hot-toast';

export const submitPipeline = async () => {
  const { nodes, edges, setCycleEdges } = useStore.getState();

  if (nodes.length === 0) {
    toast.error('Canvas is empty — add some nodes first');
    return null;
  }

  const loadingToast = toast.loading('Analyzing pipeline...');

  try {
    const response = await fetch('http://localhost:8000/pipelines/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges }),
    });

    if (!response.ok) throw new Error(`Backend error: ${response.status}`);
    const data = await response.json();

    // Highlight cycle edges if present
    if (!data.is_dag && data.cycle_edge_ids) {
      setCycleEdges(data.cycle_edge_ids);
    } else {
      setCycleEdges([]);
    }

    toast.dismiss(loadingToast);
    if (data.is_dag) {
      toast.success('Pipeline is a valid DAG');
    } else {
      toast.error('Cycle detected in pipeline');
    }

    return data;
  } catch (err) {
    toast.dismiss(loadingToast);
    toast.error(`Failed: ${err.message}. Is the backend running on :8000?`, { duration: 4000 });
    return null;
  }
};
