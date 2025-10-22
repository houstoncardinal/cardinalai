import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Pre-defined keyboard shortcuts for IDE
export const IDE_SHORTCUTS = {
  NEW_FILE: { key: 'n', ctrl: true, description: 'Create new file' },
  SAVE_FILE: { key: 's', ctrl: true, description: 'Save current file' },
  CLOSE_TAB: { key: 'w', ctrl: true, description: 'Close current tab' },
  COMMAND_PALETTE: { key: 'p', ctrl: true, shift: true, description: 'Open command palette' },
  TOGGLE_TERMINAL: { key: '`', ctrl: true, description: 'Toggle terminal' },
  TOGGLE_AI: { key: 'j', ctrl: true, description: 'Toggle AI panel' },
  FIND: { key: 'f', ctrl: true, description: 'Find in file' },
  FIND_IN_FILES: { key: 'f', ctrl: true, shift: true, description: 'Find in files' },
  TOGGLE_SIDEBAR: { key: 'b', ctrl: true, description: 'Toggle sidebar' },
};