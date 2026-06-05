// hooks/useThemeStyle.js
// Manages the global theme style (liquid-glass | neo-brutalism)
// Persists choice to localStorage and applies it to <html data-style="...">

import { useEffect, useState, useCallback } from 'react';

export const THEME_STYLES = {
  'liquid-glass': {
    id: 'liquid-glass',
    name: 'Liquid Glass',
    tagline: 'Apple WWDC 2025 - frosted, glowing, atmospheric',
    emoji: '🔮',
  },
  'neo-brutalism': {
    id: 'neo-brutalism',
    name: 'Neo Brutalism',
    tagline: 'Bold borders, hard shadows, loud personality',
    emoji: '🟨',
  },
};

const STORAGE_KEY = 'vs-theme-style';
const DEFAULT_STYLE = 'liquid-glass';

// Apply attribute synchronously before any render so we don't see a flash
const applyStyle = (style) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-style', style);
};

// Init from localStorage on first import (avoids flash on refresh)
if (typeof document !== 'undefined') {
  const saved = localStorage.getItem(STORAGE_KEY);
  applyStyle(saved && THEME_STYLES[saved] ? saved : DEFAULT_STYLE);
}

export const useThemeStyle = () => {
  const [style, setStyleState] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_STYLE;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && THEME_STYLES[saved] ? saved : DEFAULT_STYLE;
  });

  useEffect(() => {
    applyStyle(style);
    localStorage.setItem(STORAGE_KEY, style);
  }, [style]);

  const setStyle = useCallback((newStyle) => {
    if (THEME_STYLES[newStyle]) {
      setStyleState(newStyle);
    }
  }, []);

  return {
    style,
    setStyle,
    styles: Object.values(THEME_STYLES),
    current: THEME_STYLES[style],
  };
};
