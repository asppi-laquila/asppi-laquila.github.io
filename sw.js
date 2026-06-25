// ============================================================
// ASPPI L'Aquila — Service Worker
// Gestisce cache offline e aggiornamenti automatici
// ============================================================

const CACHE_NAME    = "asppi-v1";
const CACHE_STATIC  = "asppi-static-v1";

// File da mettere in cache subito (app shell)
const PRECACHE = [
  "/",
  "/index.html",
  "/static/js/main.chunk.js",
  "/static/js/bundle.js",
  "/static/css/main.chunk.css",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// ── INSTALL: metti in cache i file statici ───────────────────
self.addEventListener("install", event => {
  console.log("[SW] Install");
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      return cache.addAll(PRECACHE).catch(err => {
        console.log("[SW] Precache parziale:", err);
      });
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: pulisci cache vecchie ─────────────────────────
self.addEventListener("activate", event => {
  console.log("[SW] Activate");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_STATIC && k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: strategia Network First per API, Cache First per asset ──
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Richieste al backend Google (sempre online)
  if (url.hostname.includes("script.google.com")) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ ok: false, error: "Sei offline. Riprova quando hai connessione." }), {
          headers: { "Content-Type": "application/json" }
        })
      )
    );
    return;
  }

  // Richieste di navigazione (HTML) — Network First
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_STATIC).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Asset statici (JS, CSS, immagini) — Cache First
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_STATIC).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});

// ── PUSH NOTIFICATIONS (future) ──────────────────────────────
self.addEventListener("push", event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || "ASPPI L'Aquila", {
    body   : data.body || "",
    icon   : "/icons/icon-192.png",
    badge  : "/icons/icon-96.png",
    vibrate: [200, 100, 200],
    data   : { url: data.url || "/" },
  });
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || "/")
  );
});
