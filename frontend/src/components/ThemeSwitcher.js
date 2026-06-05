// components/ThemeSwitcher.js — palette icon button + popup with theme previews

import { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useThemeStyle, THEME_STYLES } from '../hooks/useThemeStyle';

// Mini visual preview of each style (rendered inline in the popup)
const LiquidGlassPreview = ({ selected }) => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      height: 110,
      borderRadius: 12,
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #f0f1f8 0%, #e8e6f5 100%)',
      border: selected ? '2px solid #6366f1' : '1px solid rgba(0,0,0,0.08)',
      boxShadow: selected ? '0 0 24px rgba(99,102,241,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
      transition: 'all 0.2s',
    }}
  >
    {/* Aurora blobs */}
    <div style={{
      position: 'absolute', width: 80, height: 80, borderRadius: '50%',
      background: 'radial-gradient(circle, #8b5cf6, transparent 70%)',
      filter: 'blur(20px)', opacity: 0.6, top: -20, left: -20,
    }} />
    <div style={{
      position: 'absolute', width: 100, height: 100, borderRadius: '50%',
      background: 'radial-gradient(circle, #ec4899, transparent 70%)',
      filter: 'blur(22px)', opacity: 0.5, bottom: -30, right: -20,
    }} />
    {/* Glass mini node */}
    <div style={{
      position: 'absolute', top: 30, left: 22, right: 22,
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.6)',
      borderRadius: 8,
      boxShadow: '0 4px 16px rgba(99,102,241,0.15)',
      overflow: 'hidden',
    }}>
      <div style={{
        background: 'rgba(99,102,241,0.85)',
        padding: '4px 8px',
        fontSize: 9,
        fontWeight: 700,
        color: 'white',
        letterSpacing: 0.3,
      }}>● LLM</div>
      <div style={{ padding: '6px 8px' }}>
        <div style={{
          height: 14,
          background: 'rgba(255,255,255,0.5)',
          borderRadius: 3,
        }} />
      </div>
    </div>
  </div>
);

const NeoBrutalismPreview = ({ selected }) => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      height: 110,
      borderRadius: 8,
      overflow: 'hidden',
      background: '#fff5e1',
      border: selected ? '2.5px solid #ff2d87' : '2.5px solid #000',
      boxShadow: selected ? '4px 4px 0 #ff2d87' : '4px 4px 0 #000',
      transition: 'all 0.2s',
    }}
  >
    {/* Brutalist mini node */}
    <div style={{
      position: 'absolute', top: 20, left: 18, right: 18,
      background: '#ffffff',
      border: '2px solid #000',
      borderRadius: 5,
      boxShadow: '3px 3px 0 #000',
      overflow: 'hidden',
    }}>
      <div style={{
        background: '#ffd600',
        padding: '4px 8px',
        fontSize: 9,
        fontWeight: 800,
        color: '#000',
        borderBottom: '2px solid #000',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}>● LLM</div>
      <div style={{ padding: '6px 8px' }}>
        <div style={{
          height: 14,
          background: '#fff5e1',
          border: '1.5px solid #000',
          borderRadius: 3,
        }} />
      </div>
    </div>
    {/* Decorative pink shape */}
    <div style={{
      position: 'absolute', bottom: -8, right: -8,
      width: 30, height: 30,
      background: '#ff2d87',
      border: '2.5px solid #000',
      transform: 'rotate(15deg)',
    }} />
  </div>
);

const PREVIEW_MAP = {
  'liquid-glass': LiquidGlassPreview,
  'neo-brutalism': NeoBrutalismPreview,
};

export const ThemeSwitcher = () => {
  const { style, setStyle, styles, current } = useThemeStyle();
  const [open, setOpen] = useState(false);
  const popupRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        className="btn btn-ghost btn-icon tooltip"
        data-tooltip={`Theme style: ${current.name}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Change theme style"
      >
        <Palette size={18} />
      </button>

      {open && (
        <div
          ref={popupRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 340,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            padding: 14,
            zIndex: 1000,
            animation: 'scaleIn 0.15s ease',
            transformOrigin: 'top right',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <Palette size={14} />
            Theme Style
          </div>
          <div style={{
            fontSize: 11,
            color: 'var(--text-tertiary)',
            marginBottom: 12,
          }}>
            Switches design language instantly
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {styles.map((s) => {
              const Preview = PREVIEW_MAP[s.id];
              const isActive = style === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setStyle(s.id);
                    setTimeout(() => setOpen(false), 200);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {Preview ? <Preview selected={isActive} /> : null}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 8,
                    padding: '0 4px',
                  }}>
                    <div>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                        <span>{s.emoji}</span>
                        {s.name}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: 'var(--text-tertiary)',
                        marginTop: 2,
                      }}>
                        {s.tagline}
                      </div>
                    </div>
                    {isActive && (
                      <div style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        color: 'var(--accent-fg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
