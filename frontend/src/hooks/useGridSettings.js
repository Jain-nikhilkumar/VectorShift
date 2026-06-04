// hooks/useGridSettings.js

import { useState, useEffect } from 'react';

const KEY = 'vs-grid-settings';

const DEFAULTS = {
  gridType: 'dots',   // 'dots' | 'lines' | 'none'
  snapEnabled: true,
  snapSize: 16,
  showGuides: true,   // alignment guides while dragging
};

export const useGridSettings = () => {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings));
  }, [settings]);

  const update = (patch) => setSettings((s) => ({ ...s, ...patch }));

  return { settings, update };
};
