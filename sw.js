// ASPPI Service Worker — cache minimo per abilitare PWA
const CACHE = 'asppi-v1';
const ASSETS = ['/index.html', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Passa tutto al network, fallback alla cache solo se offline
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
