// filterNode.js — demonstrates BaseNode abstraction

import { useState } from 'react';
import { BaseNode } from './BaseNode';

export const FilterNode = ({ id, data }) => {
  const [condition, setCondition] = useState(data?.condition || 'contains');
  const [value, setValue] = useState(data?.value || '');

  return (
    <BaseNode
      id={id}
      data={data}
      title="Filter"
      icon="🔍"
      color="#ef4444"
      inputs={[{ id: 'input', label: 'input' }]}
      outputs={[
        { id: 'pass', label: 'pass' },
        { id: 'fail', label: 'fail' },
      ]}
      fields={[
        {
          type: 'select',
          label: 'Condition',
          name: 'condition',
          value: condition,
          options: ['contains', 'equals', 'startsWith', 'endsWith', 'regex'],
          onChange: setCondition,
        },
        {
          type: 'text',
          label: 'Value',
          name: 'value',
          value: value,
          placeholder: 'Filter value...',
          onChange: setValue,
        },
      ]}
    />
  );
};
