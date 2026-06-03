// mathNode.js

import { useState } from 'react';
import { BaseNode } from './BaseNode';

export const MathNode = ({ id, data }) => {
  const [operation, setOperation] = useState(data?.operation || 'add');

  return (
    <BaseNode
      id={id}
      data={data}
      title="Math"
      icon="🧮"
      color="#06b6d4"
      inputs={[
        { id: 'a', label: 'a' },
        { id: 'b', label: 'b' },
      ]}
      outputs={[{ id: 'result', label: 'result' }]}
      fields={[
        {
          type: 'select',
          label: 'Operation',
          name: 'operation',
          value: operation,
          options: ['add', 'subtract', 'multiply', 'divide', 'modulo'],
          onChange: setOperation,
        },
      ]}
    />
  );
};
