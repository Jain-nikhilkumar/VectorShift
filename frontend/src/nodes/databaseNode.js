// databaseNode.js

import { useState } from 'react';
import { BaseNode } from './BaseNode';

export const DatabaseNode = ({ id, data }) => {
  const [dbType, setDbType] = useState(data?.dbType || 'PostgreSQL');
  const [query, setQuery] = useState(data?.query || 'SELECT * FROM table');

  return (
    <BaseNode
      id={id}
      data={data}
      title="Database"
      icon="🗄️"
      color="#0f766e"
      inputs={[{ id: 'params', label: 'params' }]}
      outputs={[
        { id: 'rows', label: 'rows' },
        { id: 'count', label: 'count' },
      ]}
      fields={[
        {
          type: 'select',
          label: 'Database',
          name: 'dbType',
          value: dbType,
          options: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Redis'],
          onChange: setDbType,
        },
        {
          type: 'textarea',
          label: 'Query',
          name: 'query',
          value: query,
          placeholder: 'SELECT * FROM...',
          onChange: setQuery,
        },
      ]}
    />
  );
};
