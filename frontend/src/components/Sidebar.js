// components/Sidebar.js — Left sidebar with searchable, categorized nodes

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { NODE_REGISTRY, NODE_CATEGORIES } from '../nodes/nodeRegistry';

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');

  const nodesByCategory = useMemo(() => {
    const grouped = {};
    Object.values(NODE_REGISTRY).forEach((n) => {
      if (query && !n.label.toLowerCase().includes(query.toLowerCase())) return;
      if (!grouped[n.category]) grouped[n.category] = [];
      grouped[n.category].push(n);
    });
    return grouped;
  }, [query]);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType }));
    event.dataTransfer.effectAllowed = 'move';
  };

  if (collapsed) {
    return (
      <aside
        style={{
          width: '40px', background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-primary)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10px',
        }}
      >
        <button className="btn btn-ghost btn-icon" onClick={() => setCollapsed(false)}>
          <ChevronRight size={16} />
        </button>
      </aside>
    );
  }

  return (
    <aside
      style={{
        width: '240px', background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-primary)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '12px 14px', borderBottom: '1px solid var(--border-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Nodes
        </span>
        <button className="btn btn-ghost btn-icon" style={{ width: 26, height: 26 }} onClick={() => setCollapsed(true)}>
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes..."
            className="input-base"
            style={{ paddingLeft: 28 }}
          />
        </div>
      </div>

      {/* Categories */}
      <div style={{ flex: 1, overflow: 'auto', padding: '10px 8px' }}>
        {NODE_CATEGORIES.map((category) => {
          const items = nodesByCategory[category];
          if (!items || items.length === 0) return null;
          return (
            <div key={category} style={{ marginBottom: '14px' }}>
              <div style={{
                fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)',
                textTransform: 'uppercase', letterSpacing: '0.7px',
                padding: '4px 8px', marginBottom: '6px',
              }}>
                {category}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {items.map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 10px', borderRadius: '8px',
                      background: 'var(--bg-tertiary)',
                      cursor: 'grab', userSelect: 'none',
                      transition: 'all 0.15s',
                      border: '1px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-primary)';
                      e.currentTarget.style.borderColor = node.color;
                      e.currentTarget.style.transform = 'translateX(2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      background: node.color, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: 'white', flexShrink: 0,
                    }}>
                      {node.icon}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {node.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {Object.keys(nodesByCategory).length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
            No nodes match "{query}"
          </div>
        )}
      </div>

      {/* Hint */}
      <div style={{
        padding: '10px 12px', borderTop: '1px solid var(--border-primary)',
        fontSize: '10px', color: 'var(--text-tertiary)', textAlign: 'center',
        lineHeight: 1.5,
      }}>
        💡 Drag a node onto the canvas
      </div>
    </aside>
  );
};
