const CACHE_NAME = 'offline-cache-v14';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
    OFFLINE_URL,
    '/logo.png',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Caching offline page');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME && key.startsWith('offline-cache-')) {
                        console.log('[ServiceWorker] Removing old cache', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    // self.clients.claim(); // Disable aggressive claiming to prevent potential reloads
});

self.addEventListener('fetch', (event) => {
    // Only handle navigation requests for HTML pages
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    console.log('[ServiceWorker] Fetch failed; returning offline page');
                    return caches.match(OFFLINE_URL);
                })
        );
    }
});
