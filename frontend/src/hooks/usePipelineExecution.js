// hooks/usePipelineExecution.js
// Simulates a pipeline run:
// - Topologically sorts nodes (so we execute in DAG order)
// - "Runs" each node sequentially with a realistic delay
// - Animates edges as data flows from source to target
// - Generates plausible fake outputs per node type (LLM responses, JSON data, etc.)
// - Emits events the UI can hook into for the console panel

import { useState, useCallback, useRef } from 'react';
import { useStore } from '../store';

// Generate fake plausible output for a node based on its type
const generateFakeOutput = (node, inputs) => {
  const type = node.type;
  const data = node.data || {};
  const label = data.label || data.text || type;

  // Pretend each type produces something reasonable
  switch (type) {
    case 'customInput':
      return {
        value: data.inputName ? `User input: "${data.inputName}"` : 'Sample input text',
        type: data.inputType || 'Text',
      };
    case 'customOutput':
      return { value: inputs[0]?.value || 'Final output', status: 'delivered' };
    case 'text':
      return {
        value: (data.text || 'Hello {{name}}!').replace(/\{\{(\w+)\}\}/g, (_, v) => inputs[0]?.value?.[v] || `[${v}]`),
        length: (data.text || '').length,
      };
    case 'llm':
      return {
        response: `[GPT-4 mock] Based on your input, here's a thoughtful response that demonstrates the LLM processing capability. (~${Math.floor(Math.random() * 200 + 100)} tokens)`,
        model: data.model || 'gpt-4-turbo',
        tokens: Math.floor(Math.random() * 500 + 100),
        cost: `$${(Math.random() * 0.05).toFixed(4)}`,
      };
    case 'code':
      return {
        result: `def_output_${Math.floor(Math.random() * 1000)}`,
        language: data.language || 'python',
        executionTime: `${(Math.random() * 50).toFixed(1)}ms`,
      };
    case 'auth':
      return {
        token: `eyJ${Math.random().toString(36).slice(2, 30)}...`,
        method: data.method || 'Bearer',
        valid: true,
      };
    case 'webhook':
      return {
        request: { method: 'POST', body: { event: 'triggered', timestamp: Date.now() } },
        endpoint: data.url || 'https://api.example.com/hook',
      };
    case 'schedule':
      return { scheduledAt: new Date().toISOString(), cron: data.cron || '0 * * * *' };
    case 'fileUpload':
      return { filename: 'document.pdf', size: '2.4 MB', mimeType: 'application/pdf' };
    case 'condition':
      return { branch: Math.random() > 0.5 ? 'true' : 'false', evaluation: 'completed' };
    case 'http':
      return { statusCode: 200, response: { success: true, data: [...Array(3)].map((_, i) => ({ id: i, name: `item_${i}` })) } };
    case 'database':
      return { rows: Math.floor(Math.random() * 100 + 10), query: data.query || 'SELECT * FROM users', durationMs: Math.floor(Math.random() * 50 + 5) };
    case 'transform':
      return { transformed: inputs[0]?.value ? `transformed(${JSON.stringify(inputs[0].value).slice(0, 40)}...)` : 'transformed data' };
    case 'filter':
      return { filtered: Math.floor(Math.random() * 50), totalChecked: Math.floor(Math.random() * 100 + 50) };
    case 'merge':
      return { merged: inputs.length, combinedKeys: ['a', 'b', 'c'] };
    case 'split':
      return { branches: 2, distribution: [Math.random(), Math.random()] };
    case 'email':
      return { sent: true, to: data.to || 'user@example.com', subject: data.subject || 'Notification' };
    case 'slack':
      return { messageId: `msg_${Math.random().toString(36).slice(2, 10)}`, channel: data.channel || '#general' };
    case 'image':
      return { url: 'https://image.example/generated.png', dimensions: '1024x1024' };
    case 'embedding':
      return { vector: `[${Array.from({length: 4}, () => (Math.random()*2-1).toFixed(3)).join(', ')}, ...]`, dimensions: 1536 };
    case 'vectorStore':
      return { matches: Math.floor(Math.random() * 10 + 1), topScore: (Math.random() * 0.3 + 0.7).toFixed(3) };
    default:
      return { processed: true, label, message: `${label} executed successfully` };
  }
};

// Topological sort - returns array of node IDs in execution order, or null if cycle
const topoSort = (nodes, edges) => {
  const inDegree = new Map();
  const adj = new Map();
  nodes.forEach((n) => {
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
  });
  edges.forEach((e) => {
    if (inDegree.has(e.target)) {
      inDegree.set(e.target, inDegree.get(e.target) + 1);
      adj.get(e.source)?.push(e.target);
    }
  });
  const queue = [];
  inDegree.forEach((deg, id) => deg === 0 && queue.push(id));
  const order = [];
  while (queue.length) {
    const id = queue.shift();
    order.push(id);
    adj.get(id)?.forEach((next) => {
      inDegree.set(next, inDegree.get(next) - 1);
      if (inDegree.get(next) === 0) queue.push(next);
    });
  }
  return order.length === nodes.length ? order : null;
};

export const usePipelineExecution = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [executingNodeId, setExecutingNodeId] = useState(null);
  const [completedNodeIds, setCompletedNodeIds] = useState(new Set());
  const [activeEdgeIds, setActiveEdgeIds] = useState(new Set());
  const [nodeOutputs, setNodeOutputs] = useState({});  // { nodeId: fakeOutput }
  const stopFlagRef = useRef(false);

  const appendLog = useCallback((log) => {
    setLogs((prev) => [...prev, { ...log, ts: Date.now() }]);
  }, []);

  const reset = useCallback(() => {
    stopFlagRef.current = true;
    setIsRunning(false);
    setLogs([]);
    setExecutingNodeId(null);
    setCompletedNodeIds(new Set());
    setActiveEdgeIds(new Set());
    setNodeOutputs({});
  }, []);

  const run = useCallback(async () => {
    // Get fresh state
    const { nodes, edges } = useStore.getState();
    // Exclude shape/diagram nodes from execution - they're visual only
    const pipelineNodes = nodes.filter((n) => !n.type?.startsWith('shape_'));
    const pipelineEdges = edges.filter((e) => {
      const src = nodes.find((n) => n.id === e.source);
      const tgt = nodes.find((n) => n.id === e.target);
      return src && tgt && !src.type?.startsWith('shape_') && !tgt.type?.startsWith('shape_');
    });

    if (pipelineNodes.length === 0) {
      appendLog({ level: 'error', message: 'No pipeline nodes to execute. Drop some nodes first.' });
      return;
    }

    const order = topoSort(pipelineNodes, pipelineEdges);
    if (!order) {
      appendLog({ level: 'error', message: 'Cycle detected — cannot execute a non-DAG pipeline.' });
      return;
    }

    // Reset
    stopFlagRef.current = false;
    setIsRunning(true);
    setLogs([]);
    setCompletedNodeIds(new Set());
    setActiveEdgeIds(new Set());
    setNodeOutputs({});

    appendLog({ level: 'info', message: `🚀 Pipeline run started`, detail: `${pipelineNodes.length} nodes, ${pipelineEdges.length} edges` });
    await sleep(400);

    const outputs = {};  // nodeId → output
    const completed = new Set();

    for (const nodeId of order) {
      if (stopFlagRef.current) {
        appendLog({ level: 'warn', message: '⏹ Run cancelled' });
        break;
      }

      const node = pipelineNodes.find((n) => n.id === nodeId);
      if (!node) continue;

      // ----- 1. Animate incoming edges (data flowing INTO this node) -----
      const incomingEdges = pipelineEdges.filter((e) => e.target === nodeId);
      if (incomingEdges.length > 0) {
        setActiveEdgeIds(new Set(incomingEdges.map((e) => e.id)));
        await sleep(450);
      }

      // ----- 2. Mark node as executing -----
      setExecutingNodeId(nodeId);
      const label = node.data?.label || node.data?.text || node.type;
      appendLog({ level: 'running', nodeId, message: `▶ Executing ${node.type}`, detail: label });

      // Simulate processing time (varies per type)
      const processingTime = node.type === 'llm' ? 1200 + Math.random() * 800
        : node.type === 'code' ? 600 + Math.random() * 400
        : node.type === 'database' ? 350 + Math.random() * 300
        : 400 + Math.random() * 200;
      await sleep(processingTime);

      if (stopFlagRef.current) break;

      // ----- 3. Generate fake output -----
      const inputs = incomingEdges.map((e) => outputs[e.source]).filter(Boolean);
      const output = generateFakeOutput(node, inputs);
      outputs[nodeId] = output;
      setNodeOutputs({ ...outputs });

      appendLog({
        level: 'success',
        nodeId,
        message: `✓ ${node.type} completed`,
        detail: JSON.stringify(output).slice(0, 140) + (JSON.stringify(output).length > 140 ? '...' : ''),
        output,
      });

      // ----- 4. Mark complete, clear active edges -----
      completed.add(nodeId);
      setCompletedNodeIds(new Set(completed));
      setExecutingNodeId(null);
      setActiveEdgeIds(new Set());

      await sleep(150);
    }

    if (!stopFlagRef.current) {
      appendLog({
        level: 'info',
        message: `✅ Pipeline run completed`,
        detail: `${completed.size}/${pipelineNodes.length} nodes executed`,
      });
    }
    setIsRunning(false);
  }, [appendLog]);

  const stop = useCallback(() => {
    stopFlagRef.current = true;
  }, []);

  return {
    isRunning,
    logs,
    executingNodeId,
    completedNodeIds,
    activeEdgeIds,
    nodeOutputs,
    run,
    stop,
    reset,
  };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
