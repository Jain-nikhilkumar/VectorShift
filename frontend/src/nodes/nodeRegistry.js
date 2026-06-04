// nodes/nodeRegistry.js
// Single source of truth for all node types
// Each node is defined with metadata + a render function using BaseNode

import { useState, useMemo } from 'react';
import { BaseNode } from './BaseNode';
import {
  Inbox, Send, Bot, FileText, Filter, Calculator, Globe, Clock, Database,
  Webhook, Braces, GitBranch, Repeat, Lock, Mail, MessageSquare, Upload,
  Image as ImageIcon, Boxes, Code, Calendar, Wand2, Search, Sparkles,
} from 'lucide-react';

const ICON_PROPS = { size: 14, strokeWidth: 2.5 };

// ============= ORIGINAL 4 NODES =============

const InputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(data?.inputName || id.replace('customInput-', 'input_'));
  const [inputType, setInputType] = useState(data?.inputType || 'Text');
  return (
    <BaseNode id={id} data={data} title="Input" icon={<Inbox {...ICON_PROPS} />} color="#3b82f6"
      inputs={[{ id: 'trigger', label: 'trigger' }]}
      outputs={[{ id: 'value', label: 'value' }]}
      fields={[
        { type: 'text', label: 'Name', name: 'inputName', value: currName, onChange: setCurrName },
        { type: 'select', label: 'Type', name: 'inputType', value: inputType, options: ['Text', 'File', 'Number', 'JSON'], onChange: setInputType },
      ]}
    />
  );
};

const OutputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(data?.outputName || id.replace('customOutput-', 'output_'));
  const [outputType, setOutputType] = useState(data?.outputType || 'Text');
  return (
    <BaseNode id={id} data={data} title="Output" icon={<Send {...ICON_PROPS} />} color="#10b981"
      inputs={[{ id: 'value', label: 'value' }]}
      outputs={[{ id: 'forward', label: 'forward' }]}
      fields={[
        { type: 'text', label: 'Name', name: 'outputName', value: currName, onChange: setCurrName },
        { type: 'select', label: 'Type', name: 'outputType', value: outputType, options: ['Text', 'Image', 'JSON', 'File'], onChange: setOutputType },
      ]}
    />
  );
};

const LLMNode = ({ id, data }) => {
  const [model, setModel] = useState(data?.model || 'gpt-4');
  const [temperature, setTemperature] = useState(data?.temperature || '0.7');
  return (
    <BaseNode id={id} data={data} title="LLM" icon={<Bot {...ICON_PROPS} />} color="#8b5cf6"
      inputs={[{ id: 'system', label: 'system' }, { id: 'prompt', label: 'prompt' }]}
      outputs={[{ id: 'response', label: 'response' }]}
      fields={[
        { type: 'select', label: 'Model', name: 'model', value: model,
          options: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'llama-3-70b'], onChange: setModel },
        { type: 'text', label: 'Temperature', name: 'temperature', value: temperature, onChange: setTemperature },
      ]}
    />
  );
};

// Special TextNode — uses BaseNode + dynamic {{var}} handles
const VAR_REGEX = /\{\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\}/g;

const TextNode = ({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');

  // Detect {{variable}} patterns
  const variables = useMemo(() => {
    const matches = [...currText.matchAll(VAR_REGEX)];
    return [...new Set(matches.map((m) => m[1]))];
  }, [currText]);

  // Convert variables to input handles
  const dynamicInputs = variables.map((v) => ({ id: v, label: v }));

  return (
    <BaseNode
      id={id}
      data={data}
      title="Text"
      icon={<FileText {...ICON_PROPS} />}
      color="#f59e0b"
      width={280}
      inputs={dynamicInputs}
      outputs={[{ id: 'output', label: 'output' }]}
      fields={[
        {
          type: 'textarea',
          label: 'Text',
          name: 'text',
          value: currText,
          placeholder: 'Type text. Use {{variableName}} for variables.',
          onChange: setCurrText,
          rows: 4,
        },
      ]}
    >
      {({ scale, px }) =>
        variables.length > 0 && (
          <div
            style={{
              marginTop: px(8),
              fontSize: px(10),
              color: 'var(--text-tertiary)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: px(4),
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 600 }}>Vars:</span>
            {variables.map((v) => (
              <span
                key={v}
                style={{
                  background: 'rgba(245,158,11,0.15)',
                  color: '#f59e0b',
                  padding: `${px(2)} ${px(6)}`,
                  borderRadius: px(4),
                  fontWeight: 600,
                }}
              >
                {v}
              </span>
            ))}
          </div>
        )
      }
    </BaseNode>
  );
};

// ============= 5 ORIGINAL NEW NODES =============

const FilterNode = ({ id, data }) => {
  const [condition, setCondition] = useState(data?.condition || 'contains');
  const [value, setValue] = useState(data?.value || '');
  return (
    <BaseNode id={id} data={data} title="Filter" icon={<Filter {...ICON_PROPS} />} color="#ef4444"
      inputs={[{ id: 'input', label: 'input' }]}
      outputs={[{ id: 'pass', label: 'pass' }, { id: 'fail', label: 'fail' }]}
      fields={[
        { type: 'select', label: 'Condition', name: 'condition', value: condition,
          options: ['contains', 'equals', 'startsWith', 'endsWith', 'regex', 'notEquals'], onChange: setCondition },
        { type: 'text', label: 'Value', name: 'value', value: value, placeholder: 'Filter value...', onChange: setValue },
      ]}
    />
  );
};

const MathNode = ({ id, data }) => {
  const [op, setOp] = useState(data?.operation || 'add');
  return (
    <BaseNode id={id} data={data} title="Math" icon={<Calculator {...ICON_PROPS} />} color="#06b6d4"
      inputs={[{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }]}
      outputs={[{ id: 'result', label: 'result' }]}
      fields={[
        { type: 'select', label: 'Operation', name: 'operation', value: op,
          options: ['add', 'subtract', 'multiply', 'divide', 'modulo', 'power'], onChange: setOp },
      ]}
    />
  );
};

const ApiNode = ({ id, data }) => {
  const [method, setMethod] = useState(data?.method || 'GET');
  const [url, setUrl] = useState(data?.url || 'https://api.example.com');
  return (
    <BaseNode id={id} data={data} title="API Request" icon={<Globe {...ICON_PROPS} />} color="#0ea5e9"
      inputs={[{ id: 'headers', label: 'headers' }, { id: 'body', label: 'body' }]}
      outputs={[{ id: 'response', label: 'response' }, { id: 'status', label: 'status' }]}
      fields={[
        { type: 'select', label: 'Method', name: 'method', value: method,
          options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], onChange: setMethod },
        { type: 'text', label: 'URL', name: 'url', value: url, placeholder: 'https://...', onChange: setUrl },
      ]}
    />
  );
};

const DelayNode = ({ id, data }) => {
  const [duration, setDuration] = useState(data?.duration || '1000');
  const [unit, setUnit] = useState(data?.unit || 'ms');
  return (
    <BaseNode id={id} data={data} title="Delay" icon={<Clock {...ICON_PROPS} />} color="#a855f7"
      inputs={[{ id: 'trigger', label: 'trigger' }]}
      outputs={[{ id: 'output', label: 'output' }]}
      fields={[
        { type: 'text', label: 'Duration', name: 'duration', value: duration, onChange: setDuration },
        { type: 'select', label: 'Unit', name: 'unit', value: unit, options: ['ms', 'seconds', 'minutes'], onChange: setUnit },
      ]}
    />
  );
};

const DatabaseNode = ({ id, data }) => {
  const [dbType, setDbType] = useState(data?.dbType || 'PostgreSQL');
  const [query, setQuery] = useState(data?.query || 'SELECT * FROM users');
  return (
    <BaseNode id={id} data={data} title="Database" icon={<Database {...ICON_PROPS} />} color="#0f766e"
      inputs={[{ id: 'params', label: 'params' }]}
      outputs={[{ id: 'rows', label: 'rows' }, { id: 'count', label: 'count' }]}
      fields={[
        { type: 'select', label: 'Database', name: 'dbType', value: dbType,
          options: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Redis', 'Supabase'], onChange: setDbType },
        { type: 'textarea', label: 'Query', name: 'query', value: query, placeholder: 'SELECT * FROM...', onChange: setQuery },
      ]}
    />
  );
};

// ============= 10+ NEW PRODUCTION NODES =============

const WebhookNode = ({ id, data }) => {
  const [url, setUrl] = useState(data?.url || 'https://hooks.example.com/abc');
  return (
    <BaseNode id={id} data={data} title="Webhook" icon={<Webhook {...ICON_PROPS} />} color="#7c3aed"
      inputs={[{ id: 'trigger', label: 'trigger' }]}
      outputs={[{ id: 'payload', label: 'payload' }, { id: 'headers', label: 'headers' }]}
      fields={[
        { type: 'text', label: 'Webhook URL', name: 'url', value: url, onChange: setUrl },
      ]}
    />
  );
};

const JsonParserNode = ({ id, data }) => {
  const [path, setPath] = useState(data?.path || '$.data');
  return (
    <BaseNode id={id} data={data} title="JSON Parser" icon={<Braces {...ICON_PROPS} />} color="#db2777"
      inputs={[{ id: 'json', label: 'json' }]}
      outputs={[{ id: 'result', label: 'result' }]}
      fields={[
        { type: 'text', label: 'JSONPath', name: 'path', value: path, placeholder: '$.data.items[0]', onChange: setPath },
      ]}
    />
  );
};

const ConditionalNode = ({ id, data }) => {
  const [op, setOp] = useState(data?.op || '==');
  const [compareTo, setCompareTo] = useState(data?.compareTo || '');
  return (
    <BaseNode id={id} data={data} title="If / Else" icon={<GitBranch {...ICON_PROPS} />} color="#dc2626"
      inputs={[{ id: 'value', label: 'value' }]}
      outputs={[{ id: 'true', label: 'true' }, { id: 'false', label: 'false' }]}
      fields={[
        { type: 'select', label: 'Operator', name: 'op', value: op,
          options: ['==', '!=', '>', '<', '>=', '<=', 'truthy', 'falsy'], onChange: setOp },
        { type: 'text', label: 'Compare To', name: 'compareTo', value: compareTo, onChange: setCompareTo },
      ]}
    />
  );
};

const LoopNode = ({ id, data }) => {
  const [type, setType] = useState(data?.loopType || 'forEach');
  return (
    <BaseNode id={id} data={data} title="Loop" icon={<Repeat {...ICON_PROPS} />} color="#ea580c"
      inputs={[{ id: 'items', label: 'items' }]}
      outputs={[{ id: 'item', label: 'item' }, { id: 'index', label: 'index' }, { id: 'done', label: 'done' }]}
      fields={[
        { type: 'select', label: 'Loop Type', name: 'loopType', value: type,
          options: ['forEach', 'map', 'filter', 'reduce', 'while'], onChange: setType },
      ]}
    />
  );
};

const AuthNode = ({ id, data }) => {
  const [method, setMethod] = useState(data?.authMethod || 'Bearer');
  const [token, setToken] = useState(data?.token || '');
  return (
    <BaseNode id={id} data={data} title="Auth" icon={<Lock {...ICON_PROPS} />} color="#475569"
      inputs={[{ id: 'credentials', label: 'credentials' }]}
      outputs={[{ id: 'headers', label: 'headers' }]}
      fields={[
        { type: 'select', label: 'Method', name: 'authMethod', value: method,
          options: ['Bearer', 'Basic', 'API Key', 'OAuth2'], onChange: setMethod },
        { type: 'text', label: 'Token / Key', name: 'token', value: token, placeholder: '••••••••', onChange: setToken },
      ]}
    />
  );
};

const EmailNode = ({ id, data }) => {
  const [to, setTo] = useState(data?.to || '');
  const [subject, setSubject] = useState(data?.subject || '');
  return (
    <BaseNode id={id} data={data} title="Email" icon={<Mail {...ICON_PROPS} />} color="#1d4ed8"
      inputs={[{ id: 'body', label: 'body' }, { id: 'attachments', label: 'attachments' }]}
      outputs={[{ id: 'sent', label: 'sent' }]}
      fields={[
        { type: 'text', label: 'To', name: 'to', value: to, placeholder: 'user@email.com', onChange: setTo },
        { type: 'text', label: 'Subject', name: 'subject', value: subject, onChange: setSubject },
      ]}
    />
  );
};

const SlackNode = ({ id, data }) => {
  const [channel, setChannel] = useState(data?.channel || '#general');
  return (
    <BaseNode id={id} data={data} title="Slack" icon={<MessageSquare {...ICON_PROPS} />} color="#4A154B"
      inputs={[{ id: 'message', label: 'message' }]}
      outputs={[{ id: 'ts', label: 'timestamp' }]}
      fields={[
        { type: 'text', label: 'Channel', name: 'channel', value: channel, placeholder: '#general', onChange: setChannel },
      ]}
    />
  );
};

const FileUploadNode = ({ id, data }) => {
  const [accept, setAccept] = useState(data?.accept || 'image/*');
  return (
    <BaseNode id={id} data={data} title="File Upload" icon={<Upload {...ICON_PROPS} />} color="#0891b2"
      inputs={[{ id: 'trigger', label: 'trigger' }]}
      outputs={[{ id: 'file', label: 'file' }, { id: 'url', label: 'url' }]}
      fields={[
        { type: 'select', label: 'Accept', name: 'accept', value: accept,
          options: ['image/*', 'video/*', 'audio/*', '.pdf', '.csv', '*'], onChange: setAccept },
      ]}
    />
  );
};

const ImageGenNode = ({ id, data }) => {
  const [model, setModel] = useState(data?.imgModel || 'dall-e-3');
  const [size, setSize] = useState(data?.size || '1024x1024');
  return (
    <BaseNode id={id} data={data} title="Image Gen" icon={<ImageIcon {...ICON_PROPS} />} color="#be185d"
      inputs={[{ id: 'prompt', label: 'prompt' }]}
      outputs={[{ id: 'image', label: 'image' }]}
      fields={[
        { type: 'select', label: 'Model', name: 'imgModel', value: model,
          options: ['dall-e-3', 'dall-e-2', 'stable-diffusion', 'midjourney'], onChange: setModel },
        { type: 'select', label: 'Size', name: 'size', value: size,
          options: ['256x256', '512x512', '1024x1024', '1792x1024'], onChange: setSize },
      ]}
    />
  );
};

const VectorDBNode = ({ id, data }) => {
  const [provider, setProvider] = useState(data?.provider || 'Pinecone');
  const [topK, setTopK] = useState(data?.topK || '5');
  return (
    <BaseNode id={id} data={data} title="Vector DB" icon={<Boxes {...ICON_PROPS} />} color="#16a34a"
      inputs={[{ id: 'query', label: 'query' }, { id: 'embedding', label: 'embedding' }]}
      outputs={[{ id: 'matches', label: 'matches' }]}
      fields={[
        { type: 'select', label: 'Provider', name: 'provider', value: provider,
          options: ['Pinecone', 'Weaviate', 'Qdrant', 'Chroma', 'Milvus'], onChange: setProvider },
        { type: 'text', label: 'Top K', name: 'topK', value: topK, onChange: setTopK },
      ]}
    />
  );
};

const CodeNode = ({ id, data }) => {
  const [lang, setLang] = useState(data?.lang || 'python');
  const [code, setCode] = useState(data?.code || '# input is the variable name\nresult = input * 2');
  return (
    <BaseNode id={id} data={data} title="Code" icon={<Code {...ICON_PROPS} />} color="#1e293b"
      inputs={[{ id: 'input', label: 'input' }]}
      outputs={[{ id: 'result', label: 'result' }]}
      fields={[
        { type: 'select', label: 'Language', name: 'lang', value: lang,
          options: ['python', 'javascript', 'typescript', 'bash'], onChange: setLang },
        { type: 'textarea', label: 'Code', name: 'code', value: code, rows: 4, onChange: setCode },
      ]}
    />
  );
};

const ScheduleNode = ({ id, data }) => {
  const [cron, setCron] = useState(data?.cron || '0 * * * *');
  return (
    <BaseNode id={id} data={data} title="Schedule" icon={<Calendar {...ICON_PROPS} />} color="#9333ea"
      inputs={[{ id: 'control', label: 'control' }]}
      outputs={[{ id: 'trigger', label: 'trigger' }, { id: 'time', label: 'time' }]}
      fields={[
        { type: 'text', label: 'Cron Expression', name: 'cron', value: cron, placeholder: '0 * * * *', onChange: setCron },
      ]}
    />
  );
};

const TransformNode = ({ id, data }) => {
  const [tx, setTx] = useState(data?.transform || 'uppercase');
  return (
    <BaseNode id={id} data={data} title="Transform" icon={<Wand2 {...ICON_PROPS} />} color="#c026d3"
      inputs={[{ id: 'input', label: 'input' }]}
      outputs={[{ id: 'output', label: 'output' }]}
      fields={[
        { type: 'select', label: 'Transform', name: 'transform', value: tx,
          options: ['uppercase', 'lowercase', 'trim', 'reverse', 'json-stringify', 'json-parse', 'base64-encode', 'base64-decode'], onChange: setTx },
      ]}
    />
  );
};

const SearchNode = ({ id, data }) => {
  const [engine, setEngine] = useState(data?.engine || 'Google');
  const [n, setN] = useState(data?.n || '10');
  return (
    <BaseNode id={id} data={data} title="Web Search" icon={<Search {...ICON_PROPS} />} color="#0284c7"
      inputs={[{ id: 'query', label: 'query' }]}
      outputs={[{ id: 'results', label: 'results' }]}
      fields={[
        { type: 'select', label: 'Engine', name: 'engine', value: engine,
          options: ['Google', 'Bing', 'DuckDuckGo', 'Brave', 'Tavily'], onChange: setEngine },
        { type: 'text', label: 'Results', name: 'n', value: n, onChange: setN },
      ]}
    />
  );
};

const AgentNode = ({ id, data }) => {
  const [role, setRole] = useState(data?.role || 'Assistant');
  return (
    <BaseNode id={id} data={data} title="AI Agent" icon={<Sparkles {...ICON_PROPS} />} color="#7c3aed"
      inputs={[{ id: 'task', label: 'task' }, { id: 'context', label: 'context' }, { id: 'tools', label: 'tools' }]}
      outputs={[{ id: 'result', label: 'result' }, { id: 'thoughts', label: 'thoughts' }]}
      fields={[
        { type: 'select', label: 'Role', name: 'role', value: role,
          options: ['Assistant', 'Researcher', 'Coder', 'Analyst', 'Creative Writer'], onChange: setRole },
      ]}
    />
  );
};

// ============= REGISTRY =============

export const NODE_REGISTRY = {
  // Originals
  customInput:   { type: 'customInput',   label: 'Input',       icon: <Inbox {...ICON_PROPS} />,          color: '#3b82f6', category: 'I/O',         component: InputNode },
  customOutput:  { type: 'customOutput',  label: 'Output',      icon: <Send {...ICON_PROPS} />,           color: '#10b981', category: 'I/O',         component: OutputNode },
  llm:           { type: 'llm',           label: 'LLM',         icon: <Bot {...ICON_PROPS} />,            color: '#8b5cf6', category: 'AI',          component: LLMNode },
  text:          { type: 'text',          label: 'Text',        icon: <FileText {...ICON_PROPS} />,       color: '#f59e0b', category: 'I/O',         component: TextNode },

  // Originally added
  filter:        { type: 'filter',        label: 'Filter',      icon: <Filter {...ICON_PROPS} />,         color: '#ef4444', category: 'Logic',       component: FilterNode },
  math:          { type: 'math',          label: 'Math',        icon: <Calculator {...ICON_PROPS} />,     color: '#06b6d4', category: 'Logic',       component: MathNode },
  api:           { type: 'api',           label: 'API',         icon: <Globe {...ICON_PROPS} />,          color: '#0ea5e9', category: 'Integrations',component: ApiNode },
  delay:         { type: 'delay',         label: 'Delay',       icon: <Clock {...ICON_PROPS} />,          color: '#a855f7', category: 'Logic',       component: DelayNode },
  database:      { type: 'database',      label: 'Database',    icon: <Database {...ICON_PROPS} />,       color: '#0f766e', category: 'Data',        component: DatabaseNode },

  // New production nodes
  webhook:       { type: 'webhook',       label: 'Webhook',     icon: <Webhook {...ICON_PROPS} />,        color: '#7c3aed', category: 'Triggers',    component: WebhookNode },
  jsonParser:    { type: 'jsonParser',    label: 'JSON Parser', icon: <Braces {...ICON_PROPS} />,         color: '#db2777', category: 'Data',        component: JsonParserNode },
  conditional:   { type: 'conditional',   label: 'If / Else',   icon: <GitBranch {...ICON_PROPS} />,      color: '#dc2626', category: 'Logic',       component: ConditionalNode },
  loop:          { type: 'loop',          label: 'Loop',        icon: <Repeat {...ICON_PROPS} />,         color: '#ea580c', category: 'Logic',       component: LoopNode },
  auth:          { type: 'auth',          label: 'Auth',        icon: <Lock {...ICON_PROPS} />,           color: '#475569', category: 'Integrations',component: AuthNode },
  email:         { type: 'email',         label: 'Email',       icon: <Mail {...ICON_PROPS} />,           color: '#1d4ed8', category: 'Integrations',component: EmailNode },
  slack:         { type: 'slack',         label: 'Slack',       icon: <MessageSquare {...ICON_PROPS} />,  color: '#4A154B', category: 'Integrations',component: SlackNode },
  fileUpload:    { type: 'fileUpload',    label: 'File Upload', icon: <Upload {...ICON_PROPS} />,         color: '#0891b2', category: 'I/O',         component: FileUploadNode },
  imageGen:      { type: 'imageGen',      label: 'Image Gen',   icon: <ImageIcon {...ICON_PROPS} />,      color: '#be185d', category: 'AI',          component: ImageGenNode },
  vectorDB:      { type: 'vectorDB',      label: 'Vector DB',   icon: <Boxes {...ICON_PROPS} />,          color: '#16a34a', category: 'Data',        component: VectorDBNode },
  code:          { type: 'code',          label: 'Code',        icon: <Code {...ICON_PROPS} />,           color: '#1e293b', category: 'Logic',       component: CodeNode },
  schedule:      { type: 'schedule',      label: 'Schedule',    icon: <Calendar {...ICON_PROPS} />,       color: '#9333ea', category: 'Triggers',    component: ScheduleNode },
  transform:     { type: 'transform',     label: 'Transform',   icon: <Wand2 {...ICON_PROPS} />,          color: '#c026d3', category: 'Data',        component: TransformNode },
  search:        { type: 'search',        label: 'Web Search',  icon: <Search {...ICON_PROPS} />,         color: '#0284c7', category: 'Integrations',component: SearchNode },
  agent:         { type: 'agent',         label: 'AI Agent',    icon: <Sparkles {...ICON_PROPS} />,       color: '#7c3aed', category: 'AI',          component: AgentNode },
};

export const NODE_TYPES = Object.fromEntries(
  Object.entries(NODE_REGISTRY).map(([k, v]) => [k, v.component])
);

export const NODE_CATEGORIES = [
  'Triggers',
  'I/O',
  'AI',
  'Logic',
  'Data',
  'Integrations',
];

export const getNodeColor = (type) => NODE_REGISTRY[type]?.color || '#94a3b8';
