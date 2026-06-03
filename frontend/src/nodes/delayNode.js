// delayNode.js

import { useState } from 'react';
import { BaseNode } from './BaseNode';

export const DelayNode = ({ id, data }) => {
  const [duration, setDuration] = useState(data?.duration || '1000');
  const [unit, setUnit] = useState(data?.unit || 'ms');

  return (
    <BaseNode
      id={id}
      data={data}
      title="Delay"
      icon="⏱️"
      color="#a855f7"
      inputs={[{ id: 'trigger', label: 'trigger' }]}
      outputs={[{ id: 'output', label: 'output' }]}
      fields={[
        {
          type: 'text',
          label: 'Duration',
          name: 'duration',
          value: duration,
          onChange: setDuration,
        },
        {
          type: 'select',
          label: 'Unit',
          name: 'unit',
          value: unit,
          options: ['ms', 'seconds', 'minutes'],
          onChange: setUnit,
        },
      ]}
    />
  );
};
