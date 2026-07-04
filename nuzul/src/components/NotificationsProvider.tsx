'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Notif = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
  data: Record<string, unknown> | null;
};

type Ctx = {
  items: Notif[];
  unread: number;
  unreadMessages: number;
  markAllRead: () => void;
  refresh: () => void;
};

const NotificationsContext = createContext<Ctx>({
  items: [],
  unread: 0,
  unreadMessages: 0,
  markAllRead: () => {},
  refresh: () => {},
});

export function useNotifications() {
  return useContext(NotificationsContext);
}

/**
 * Single source of truth for in-app notifications. Polls `/api/notifications` every 45s (and
 * on window focus) and shares the result with the header bell and the bottom-nav messages
 * badge, so they stay in sync without each polling on its own.
 */
export default function NotificationsProvider({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const json = await res.json();
      setItems(json.data ?? []);
      setUnread(json.unread ?? 0);
    } catch {
      /* offline / transient — keep the last known state */
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const id = setInterval(refresh, 45000);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [enabled, refresh]);

  const markAllRead = useCallback(async () => {
    const now = new Date().toISOString();
    setUnread(0);
    setItems((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: now })));
    try {
      await fetch('/api/notifications', { method: 'POST' });
    } catch {
      /* best-effort; next poll reconciles */
    }
  }, []);

  const unreadMessages = items.filter((n) => n.type === 'message_received' && !n.readAt).length;

  return (
    <NotificationsContext.Provider value={{ items, unread, unreadMessages, markAllRead, refresh }}>
      {children}
    </NotificationsContext.Provider>
  );
}
