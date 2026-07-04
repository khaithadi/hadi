'use client';

import { useEffect } from 'react';

/**
 * App-wide behavior: focusing any numeric input selects its current value, so the first
 * keystroke replaces the old number instead of appending to it. Mounted once in the root
 * layout; covers every `type="number"` / `inputMode="numeric"` field, present and future.
 */
export default function NumberInputSelect() {
  useEffect(() => {
    const handler = (e: FocusEvent) => {
      const el = e.target;
      if (el instanceof HTMLInputElement && (el.type === 'number' || el.inputMode === 'numeric')) {
        // Defer so the browser's own caret placement doesn't override the selection.
        requestAnimationFrame(() => {
          try {
            el.select();
          } catch {
            /* some input types disallow select(); ignore */
          }
        });
      }
    };
    document.addEventListener('focusin', handler);
    return () => document.removeEventListener('focusin', handler);
  }, []);

  return null;
}
