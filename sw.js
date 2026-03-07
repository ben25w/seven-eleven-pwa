const CACHE_NAME = '7eleven-v5';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/teacher.html',
  '/teacher.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Never intercept API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For navigation requests (HTML pages), always go to network first
  // This prevents Safari's "redirect served by service worker" error
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For all other assets, try cache first then network
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
