const CACHE_NAME = 'tss-attendance-v1';
const ASSETS = [
  '/today',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Only handle GET requests. Bypass POST/PUT/DELETE, etc.
  if (e.request.method !== 'GET') {
    return;
  }

  // Handle page navigation requests
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          // If response is valid, update the cache with the new version
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fall back to '/today' ONLY if they are requesting the /today page
            const url = new URL(e.request.url);
            if (url.pathname === '/today') {
              return caches.match('/today');
            }
            // If they are visiting another page while offline and it's not cached,
            // return a basic offline html
            return new Response(
              '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Offline</title><style>body { font-family: sans-serif; text-align: center; padding: 50px; background: #0a0a0a; color: white; }</style></head><body><h1>You are offline</h1><p>Please check your internet connection and try again.</p></body></html>',
              {
                status: 503,
                headers: { 'Content-Type': 'text/html' }
              }
            );
          });
        })
    );
    return;
  }

  // For other resources (images, fonts, stylesheets, scripts, etc.), use cache first falling back to network
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
