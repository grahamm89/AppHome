const CACHE_NAME = 'dw-helper-v7';
const CORE = [
  './',
  './index.html',
  './app.js',
  './app_data.json',
  './manifest.json',
  './offline.html',
  './assets/icons/icon-192.png',
  './assets/icons/icon-256.png',
  './assets/icons/icon-384.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Navigations: network-first (no-store), fallback to cache then offline
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const net = await fetch(new Request(req, { cache: 'no-store' }));
        const cache = await caches.open(CACHE_NAME);
        cache.put('./index.html', net.clone());
        return net;
      } catch (e) {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match('./index.html')) || (await cache.match('./offline.html'));
      }
    })());
    return;
  }

  // SWR for app_data.json
  if (url.pathname.endsWith('/app_data.json')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      const network = fetch(req).then(res => { cache.put(req, res.clone()); return res; }).catch(() => cached);
      return cached || network;
    })());
    return;
  }

  // Cache-first for others
  event.respondWith(caches.match(req).then(r => r || fetch(req)));
});
