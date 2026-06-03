// outputNode.js

import { useState } from 'react';
import { BaseNode } from './BaseNode';

export const OutputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(
    data?.outputName || id.replace('customOutput-', 'output_')
  );
  const [outputType, setOutputType] = useState(data?.outputType || 'Text');

  return (
    <BaseNode
      id={id}
      data={data}
      title="Output"
      icon="📤"
      color="#10b981"
      inputs={[{ id: 'value', label: 'value' }]}
      fields={[
        {
          type: 'text',
          label: 'Name',
          name: 'outputName',
          value: currName,
          onChange: setCurrName,
        },
        {
          type: 'select',
          label: 'Type',
          name: 'outputType',
          value: outputType,
          options: ['Text', 'Image'],
          onChange: setOutputType,
        },
      ]}
    />
  );
};
