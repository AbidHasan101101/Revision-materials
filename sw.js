// Service Worker for HSC Science Revision Master (sw.js)
// Caches local assets and external dependencies (Tailwind CDN, Google Fonts) after first visit.

const CACHE_NAME = 'hsc-tracker-v2';

const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './data.js',
  './app.js',
  'https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-caching non-fatal warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Strategy: Cache-first with network fallback for local and CDN assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache successful responses for Google Fonts or gstatic or local origin
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (url.origin === location.origin ||
            url.hostname.includes('gstatic.com') ||
            url.hostname.includes('googleapis.com'))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Return offline fallback if available
        return caches.match('./index.html');
      });
    })
  );
});
