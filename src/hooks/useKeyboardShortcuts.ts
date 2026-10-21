'use client';

import { useEffect } from 'react';

interface KeyboardShortcutOptions {
  onTogglePlay?: () => void;
  onSeekBackward?: () => void;
  onSeekForward?: () => void;
  onToggleMute?: () => void;
  isEnabled?: boolean;
}

export function useKeyboardShortcuts({
  onTogglePlay,
  onSeekBackward,
  onSeekForward,
  onToggleMute,
  isEnabled = true,
}: KeyboardShortcutOptions) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement instanceof HTMLElement && activeElement.isContentEditable);

      if (isInputFocused) return;

      if (event.code === 'Space') {
        event.preventDefault();
        onTogglePlay?.();
      } else if (event.code === 'ArrowLeft') {
        event.preventDefault();
        onSeekBackward?.();
      } else if (event.code === 'ArrowRight') {
        event.preventDefault();
        onSeekForward?.();
      } else if (event.code === 'KeyM') {
        event.preventDefault();
        onToggleMute?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEnabled, onTogglePlay, onSeekBackward, onSeekForward, onToggleMute]);
}