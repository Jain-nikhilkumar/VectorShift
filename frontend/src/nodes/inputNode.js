// inputNode.js

import { useState } from 'react';
import { BaseNode } from './BaseNode';

export const InputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(
    data?.inputName || id.replace('customInput-', 'input_')
  );
  const [inputType, setInputType] = useState(data?.inputType || 'Text');

  return (
    <BaseNode
      id={id}
      data={data}
      title="Input"
      icon="📥"
      color="#3b82f6"
      outputs={[{ id: 'value', label: 'value' }]}
      fields={[
        {
          type: 'text',
          label: 'Name',
          name: 'inputName',
          value: currName,
          onChange: setCurrName,
        },
        {
          type: 'select',
          label: 'Type',
          name: 'inputType',
          value: inputType,
          options: ['Text', 'File'],
          onChange: setInputType,
        },
      ]}
    />
  );
};
