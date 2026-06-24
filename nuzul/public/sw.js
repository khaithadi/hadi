// Nuzul service worker — app-shell + offline fallback + push handling.
const CACHE = 'nuzul-v1';
const SHELL = ['/ar', '/ar/offline'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

// Network-first for navigations (fresh content), cache fallback, then offline page.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (new URL(request.url).pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/ar/offline'))),
    );
    return;
  }

  // Cache-first for static assets.
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});

// Web Push → notification.
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const payload = (() => {
    try {
      return event.data.json();
    } catch {
      return { title: 'Nuzul', body: event.data.text() };
    }
  })();
  event.waitUntil(
    self.registration.showNotification(payload.title || 'Nuzul', {
      body: payload.body,
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      data: payload.data,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/ar/trips'));
});
