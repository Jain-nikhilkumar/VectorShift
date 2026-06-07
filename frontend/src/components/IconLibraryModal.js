// components/IconLibraryModal.js
// Searchable modal for picking cloud/tech icons.
// Renders previews lazily via Iconify CDN (bundle stays tiny).
// Uses React Portal so it escapes any transformed parent (like ShapesToolbar).

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Cloud } from 'lucide-react';
import { ICON_CATEGORIES, ALL_ICONS } from '../shapes/iconCatalog';
import { useStore } from '../store';
import { useReactFlow } from 'reactflow';

const ICONIFY_BASE = 'https://api.iconify.design';

export const IconLibraryModal = ({ open, onClose }) => {
  const reactFlowInstance = useReactFlow();
  const addNode = useStore((s) => s.addNode);
  const getNodeID = useStore((s) => s.getNodeID);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(ICON_CATEGORIES[0].name);
  const [iconifySearch, setIconifySearch] = useState({ loading: false, results: [], total: 0 });

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveCategory(ICON_CATEGORIES[0].name);
      setIconifySearch({ loading: false, results: [], total: 0 });
    }
  }, [open]);

  // Live search Iconify catalog when user types (debounced)
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setIconifySearch({ loading: false, results: [], total: 0 });
      return;
    }
    setIconifySearch((s) => ({ ...s, loading: true }));
    const t = setTimeout(() => {
      // Iconify Search API: returns icons matching query across ALL collections
      fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=64`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data) return setIconifySearch({ loading: false, results: [], total: 0 });
          setIconifySearch({
            loading: false,
            results: (data.icons || []).map((id) => ({
              id,
              label: id.split(':')[1]?.replace(/-/g, ' ') || id,
              category: id.split(':')[0],
              accent: '#6366f1',
            })),
            total: data.total || 0,
          });
        })
        .catch(() => setIconifySearch({ loading: false, results: [], total: 0 }));
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  // Filter logic: search across all, or show selected category
  const { curatedMatches, iconifyMatches } = useMemo(() => {
    if (query.trim()) {
      const q = query.toLowerCase();
      // 1. Curated matches first (instant, no network)
      const curated = ALL_ICONS.filter(
        (i) => i.label.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
      );
      // 2. Iconify global search (de-duped against curated)
      const curatedIds = new Set(curated.map((i) => i.id));
      const extra = iconifySearch.results.filter((i) => !curatedIds.has(i.id));
      return { curatedMatches: curated, iconifyMatches: extra };
    }
    const cat = ICON_CATEGORIES.find((c) => c.name === activeCategory);
    return {
      curatedMatches: cat ? cat.icons.map((i) => ({ ...i, category: cat.name, accent: cat.accent })) : [],
      iconifyMatches: [],
    };
  }, [query, activeCategory, iconifySearch.results]);

  const totalVisible = curatedMatches.length + iconifyMatches.length;

  const addIconToCanvas = (icon) => {
    if (!reactFlowInstance) return;
    const { x: vx, y: vy, zoom } = reactFlowInstance.getViewport();
    const wrapper = document.querySelector('.react-flow');
    if (!wrapper) return;
    const bounds = wrapper.getBoundingClientRect();
    const flowX = (bounds.width / 2 - vx) / zoom;
    const flowY = (bounds.height / 2 - vy) / zoom;
    const jitter = () => (Math.random() - 0.5) * 40;
    const nodeID = getNodeID('shape_cloudIcon');
    addNode({
      id: nodeID,
      type: 'shape_cloudIcon',
      position: { x: flowX + jitter() - 60, y: flowY + jitter() - 65 },
      data: {
        id: nodeID,
        nodeType: 'shape_cloudIcon',
        icon: icon.id,
        label: icon.label,
      },
    });
    onClose?.();
  };

  if (!open) return null;

  // Render via Portal so the modal escapes any transformed parent
  // (ShapesToolbar uses transform: translateX(-50%) which would offset us)
  return createPortal(
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(900px, 92vw)',
          height: 'min(680px, 88vh)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-xl, 0 20px 50px rgba(0,0,0,0.3))',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalIn 0.2s ease',
        }}
      >
        {/* HEADER */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
          }}>
            <Cloud size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Cloud & Tech Icons
            </h2>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-tertiary)' }}>
              {ALL_ICONS.length} quick picks · search to find any of 200,000+ icons
            </p>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            style={{ width: 32, height: 32 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* SEARCH */}
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-primary)',
          position: 'relative',
        }}>
          <Search size={14} style={{
            position: 'absolute',
            top: '50%',
            left: 28,
            transform: 'translateY(-50%)',
            color: 'var(--text-tertiary)',
            pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search 200,000+ icons globally... (e.g. lambda, postgres, kubernetes)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-sm, 6px)',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: 13,
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* BODY: sidebar + grid */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
          {/* Category sidebar (hidden when searching) */}
          {!query.trim() && (
            <div style={{
              width: 160,
              borderRight: '1px solid var(--border-primary)',
              padding: '10px 8px',
              overflow: 'auto',
              flexShrink: 0,
            }}>
              {ICON_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: activeCategory === cat.name ? 'var(--bg-hover)' : 'transparent',
                    border: 'none',
                    borderLeft: `3px solid ${activeCategory === cat.name ? cat.accent : 'transparent'}`,
                    color: activeCategory === cat.name ? 'var(--text-primary)' : 'var(--text-secondary)',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: activeCategory === cat.name ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: 4,
                    marginBottom: 2,
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={(e) => {
                    if (activeCategory !== cat.name) {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeCategory !== cat.name) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span>{cat.name}</span>
                  <span style={{
                    fontSize: 10,
                    color: 'var(--text-tertiary)',
                    fontFamily: 'ui-monospace, monospace',
                  }}>
                    {cat.icons.length}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Icon grid */}
          <div style={{
            flex: 1,
            padding: 14,
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
            minWidth: 0,
          }}>
            {totalVisible === 0 && !iconifySearch.loading ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-tertiary)',
                fontSize: 13,
                flexDirection: 'column',
                gap: 8,
              }}>
                <Search size={24} />
                <div>No icons match "{query}"</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>Try: aws, postgres, docker, react</div>
              </div>
            ) : (
              <>
                {/* Section 1: Quick Picks / curated results */}
                {curatedMatches.length > 0 && (
                  <>
                    {query.trim() && (
                      <SectionLabel
                        title="⚡ Quick picks"
                        subtitle="Popular icons we recommend"
                      />
                    )}
                    <IconGrid icons={curatedMatches} onPick={addIconToCanvas} />
                  </>
                )}

                {/* Section 2: Iconify global search results */}
                {iconifyMatches.length > 0 && (
                  <>
                    <SectionLabel
                      title="🔍 More from Iconify"
                      subtitle={`Other matches across all icon sets${iconifySearch.total > iconifyMatches.length ? ` (${iconifySearch.total}+ total)` : ''}`}
                    />
                    <IconGrid icons={iconifyMatches} onPick={addIconToCanvas} />
                  </>
                )}

                {/* Loading state */}
                {iconifySearch.loading && curatedMatches.length === 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 40,
                    color: 'var(--text-tertiary)',
                    fontSize: 12,
                    gap: 8,
                  }}>
                    <div className="spinner" style={{
                      width: 14, height: 14,
                      border: '2px solid var(--border-primary)',
                      borderTopColor: 'var(--accent-primary)',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }} />
                    Searching Iconify...
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{
          padding: '10px 18px',
          borderTop: '1px solid var(--border-primary)',
          fontSize: 11,
          color: 'var(--text-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>
            {query.trim()
              ? iconifySearch.loading
                ? `Searching for "${query}"...`
                : `${totalVisible} results${iconifySearch.total > iconifyMatches.length ? ` (${iconifySearch.total}+ more available)` : ''}`
              : `${totalVisible} in ${activeCategory}`}
          </span>
          <span>Click any icon to add to canvas</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Section header inside the modal grid
const SectionLabel = ({ title, subtitle }) => (
  <div style={{
    padding: '4px 4px 10px',
    borderBottom: '1px solid var(--border-primary)',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'baseline',
    gap: 10,
  }}>
    <span style={{
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--text-primary)',
      letterSpacing: 0.2,
    }}>
      {title}
    </span>
    {subtitle && (
      <span style={{
        fontSize: 10,
        color: 'var(--text-tertiary)',
        fontWeight: 500,
      }}>
        {subtitle}
      </span>
    )}
  </div>
);

const IconGrid = ({ icons, onPick }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
    gap: 8,
    marginBottom: 18,
  }}>
    {icons.map((icon) => (
      <IconCard key={icon.id} icon={icon} onClick={() => onPick(icon)} />
    ))}
  </div>
);

// Card showing a single icon preview
const IconCard = ({ icon, onClick }) => {
  const [svgContent, setSvgContent] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSvgContent(null);
    setFailed(false);
    fetch(`${ICONIFY_BASE}/${icon.id}.svg`)
      .then((r) => (r.ok ? r.text() : null))
      .then((text) => {
        if (cancelled) return;
        // Iconify returns 404 SVG ("?") for missing icons - check size/content
        if (text && text.length > 100 && !text.includes('?text')) {
          setSvgContent(text);
        } else {
          setFailed(true);
        }
      })
      .catch(() => !cancelled && setFailed(true));
    return () => { cancelled = true; };
  }, [icon.id]);

  return (
    <button
      onClick={onClick}
      title={`${icon.label} · ${icon.category}`}
      style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 8,
        padding: 8,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.15s',
        minHeight: 92,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = icon.accent || 'var(--accent-primary)';
        e.currentTarget.style.background = 'var(--bg-primary)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 4px 12px ${icon.accent || 'rgba(0,0,0,0.1)'}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-primary)';
        e.currentTarget.style.background = 'var(--bg-tertiary)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {svgContent ? (
          <div
            style={{ width: '100%', height: '100%' }}
            dangerouslySetInnerHTML={{
              __html: svgContent.replace(
                /<svg /,
                `<svg style="width:100%;height:100%;" preserveAspectRatio="xMidYMid meet" `
              ),
            }}
          />
        ) : failed ? (
          <div style={{
            width: 36, height: 36,
            background: icon.accent || '#94a3b8',
            color: 'white',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: -0.5,
          }}>
            {icon.label.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div style={{
            width: 24, height: 24,
            background: 'var(--bg-secondary)',
            borderRadius: 4,
            opacity: 0.5,
          }} />
        )}
      </div>
      <div style={{
        fontSize: 10,
        fontWeight: 600,
        color: 'var(--text-primary)',
        textAlign: 'center',
        lineHeight: 1.2,
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {icon.label}
      </div>
    </button>
  );
};
