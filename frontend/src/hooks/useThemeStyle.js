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
const STORAGE_VERSION_KEY = 'vs-theme-style-version';
// Bump this number whenever you want to force ALL users back to DEFAULT_STYLE
// (e.g., when changing the default or making big visual changes)
const CURRENT_VERSION = '2';
const DEFAULT_STYLE = 'liquid-glass';

const applyStyle = (style) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-style', style);
};

// Run on first import — BEFORE React renders — to avoid flash
if (typeof document !== 'undefined') {
  const savedVersion = localStorage.getItem(STORAGE_VERSION_KEY);

  // If user is on an old version (or new visitor), reset to default
  if (savedVersion !== CURRENT_VERSION) {
    localStorage.setItem(STORAGE_KEY, DEFAULT_STYLE);
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
    applyStyle(DEFAULT_STYLE);
  } else {
    const saved = localStorage.getItem(STORAGE_KEY);
    applyStyle(saved && THEME_STYLES[saved] ? saved : DEFAULT_STYLE);
  }
}

export const useThemeStyle = () => {
  const [style, setStyleState] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_STYLE;
    const savedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
    if (savedVersion !== CURRENT_VERSION) return DEFAULT_STYLE;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && THEME_STYLES[saved] ? saved : DEFAULT_STYLE;
  });

  useEffect(() => {
    applyStyle(style);
    localStorage.setItem(STORAGE_KEY, style);
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
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
