const CACHE_NAME = 'timewallet-shell-v1';

// Base application shell assets
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icons.svg',
];

// Precache list - Vite build plugin replaces this or adds to it
const PRECACHE_ASSETS = self.__PRECACHE_MANIFEST || CORE_ASSETS;

// Detect if this is raw unbuilt dev service worker on localhost
const isDev =
  !self.__PRECACHE_MANIFEST &&
  (self.location.hostname === 'localhost' ||
    self.location.hostname === '127.0.0.1' ||
    self.location.port === '5173');

if (isDev) {
  // In development, immediately self-destruct and never intercept Vite dev requests
  self.addEventListener('install', () => {
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.claim())
    );
  });

  // Never intercept in dev mode
  self.addEventListener('fetch', () => {
    return;
  });
} else {
  // Production Offline Service Worker Logic

  // Install phase: Precache application shell
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(PRECACHE_ASSETS).catch((err) => {
            console.warn('[SW] Core asset precache partial failure:', err);
          });
        })
        .then(() => self.skipWaiting())
    );
  });

  // Activate phase: Clean up obsolete caches and claim clients
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames
              .filter((name) => name !== CACHE_NAME)
              .map((name) => caches.delete(name))
          );
        })
        .then(() => self.clients.claim())
    );
  });

  // Fetch phase: Offline navigation fallback and asset caching
  self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Only handle GET requests
    if (request.method !== 'GET') {
      return;
    }

    const url = new URL(request.url);

    // Requirement: Do NOT cache external exchange API requests in Service Worker
    // Exchange rates are managed exclusively by IndexedDB cache.
    if (url.hostname.includes('frankfurter.dev') || url.pathname.includes('/v2/rate/')) {
      return;
    }

    // Never intercept Vite dev server paths if running on localhost
    if (
      url.pathname.startsWith('/@') ||
      url.pathname.startsWith('/src/') ||
      url.search.includes('?t=')
    ) {
      return;
    }

    // Navigation requests (HTML / SPA routes such as /app or /)
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request).catch(() => {
          return caches.match('/index.html').then((cachedIndex) => {
            if (cachedIndex) return cachedIndex;
            return caches.match('/');
          });
        })
      );
      return;
    }

    // Static Assets (scripts, styles, fonts, images)
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          // Cache valid same-origin responses or Google fonts
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (url.origin === self.location.origin || url.hostname.includes('fonts.g'))
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
  });
}
