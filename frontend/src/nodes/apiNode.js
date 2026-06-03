// apiNode.js

import { useState } from 'react';
import { BaseNode } from './BaseNode';

export const ApiNode = ({ id, data }) => {
  const [method, setMethod] = useState(data?.method || 'GET');
  const [url, setUrl] = useState(data?.url || 'https://api.example.com');

  return (
    <BaseNode
      id={id}
      data={data}
      title="API Request"
      icon="🌐"
      color="#0ea5e9"
      inputs={[
        { id: 'headers', label: 'headers' },
        { id: 'body', label: 'body' },
      ]}
      outputs={[
        { id: 'response', label: 'response' },
        { id: 'status', label: 'status' },
      ]}
      fields={[
        {
          type: 'select',
          label: 'Method',
          name: 'method',
          value: method,
          options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
          onChange: setMethod,
        },
        {
          type: 'text',
          label: 'URL',
          name: 'url',
          value: url,
          placeholder: 'https://...',
          onChange: setUrl,
        },
      ]}
    />
  );
};
