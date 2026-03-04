const CACHE_NAME = '7eleven-v1';

// List every file your game uses — images, CSS, JS, HTML
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/teacher.html',
  '/teacher.js',
  '/manifest.json',
  // ADD ALL YOUR PRODUCT IMAGES HERE:
  '/images/item1.png',
  '/images/item2.png',
  '/images/item3.png',
  '/images/item4.png',
  '/images/item5.png',
  '/images/item6.png',
  '/images/item7.png',
  '/images/item8.png',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

// Install: cache everything
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
