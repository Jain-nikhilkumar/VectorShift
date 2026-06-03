// llmNode.js

import { BaseNode } from './BaseNode';

export const LLMNode = ({ id, data }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      title="LLM"
      icon="🤖"
      color="#8b5cf6"
      inputs={[
        { id: 'system', label: 'system' },
        { id: 'prompt', label: 'prompt' },
      ]}
      outputs={[{ id: 'response', label: 'response' }]}
    >
      <div style={{ fontSize: '12px', color: '#64748b', padding: '4px 0' }}>
        Large Language Model
      </div>
    </BaseNode>
  );
};
