// hooks/useKeyboardShortcuts.js

import { useEffect } from 'react';
import { useStore } from '../store';
import toast from 'react-hot-toast';

export const useKeyboardShortcuts = () => {
  const {
    undo,
    redo,
    deleteSelected,
    copySelected,
    paste,
    duplicateSelected,
    selectedNodes,
  } = useStore();

  useEffect(() => {
    const handler = (e) => {
      // Skip if user is typing in input/textarea
      const target = e.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;

      // Undo: Ctrl+Z
      if (ctrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
        toast('↶ Undo', { duration: 1000 });
        return;
      }
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((ctrl && e.shiftKey && e.key.toLowerCase() === 'z') || (ctrl && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        redo();
        toast('↷ Redo', { duration: 1000 });
        return;
      }
      // Copy: Ctrl+C
      if (ctrl && e.key.toLowerCase() === 'c' && selectedNodes.length > 0) {
        e.preventDefault();
        const c = copySelected();
        if (c) toast.success(`Copied ${c.nodes.length} node(s)`, { duration: 1500 });
        return;
      }
      // Paste: Ctrl+V
      if (ctrl && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        paste();
        toast.success('Pasted', { duration: 1000 });
        return;
      }
      // Duplicate: Ctrl+D
      if (ctrl && e.key.toLowerCase() === 'd' && selectedNodes.length > 0) {
        e.preventDefault();
        duplicateSelected();
        toast.success('Duplicated', { duration: 1000 });
        return;
      }
      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodes.length > 0) {
        e.preventDefault();
        deleteSelected();
        toast.success(`Deleted ${selectedNodes.length} node(s)`, { duration: 1500 });
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, deleteSelected, copySelected, paste, duplicateSelected, selectedNodes]);
};
