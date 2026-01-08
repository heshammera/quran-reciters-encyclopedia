// Service Worker for Quran Reciters Encyclopedia
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const AUDIO_CACHE = `audio-${CACHE_VERSION}`;

// Static assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/offline',
    '/logo.png',
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name.startsWith('v') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== AUDIO_CACHE)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome extensions and other protocols
    if (!url.protocol.startsWith('http')) return;

    // Audio files - Cache First strategy
    if (request.url.includes('.mp3') || request.url.includes('.m4a') || request.url.includes('audio')) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('[SW] Serving audio from cache:', request.url);
                    return cachedResponse;
                }

                return fetch(request).then((response) => {
                    // Only cache successful responses
                    if (!response || response.status !== 200) {
                        return response;
                    }

                    const responseToCache = response.clone();
                    caches.open(AUDIO_CACHE).then((cache) => {
                        console.log('[SW] Caching new audio:', request.url);
                        cache.put(request, responseToCache);
                    });

                    return response;
                }).catch(() => {
                    return new Response('Audio not available offline', { status: 503 });
                });
            })
        );
        return;
    }

    // API requests - Network First strategy
    if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const responseToCache = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(request).then((cachedResponse) => {
                        return cachedResponse || new Response('Offline - data not available', { status: 503 });
                    });
                })
        );
        return;
    }

    // Static assets and pages - Cache First, fallback to Network
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((response) => {
                // Only cache successful responses
                if (!response || response.status !== 200) {
                    return response;
                }

                const responseToCache = response.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.put(request, responseToCache);
                });

                return response;
            }).catch(() => {
                // Return offline page for navigation requests
                if (request.mode === 'navigate') {
                    return caches.match('/offline');
                }
                return new Response('Offline', { status: 503 });
            });
        })
    );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_AUDIO') {
        const { url } = event.data;
        caches.open(AUDIO_CACHE).then((cache) => {
            fetch(url).then((response) => {
                cache.put(url, response);
                event.ports[0].postMessage({ success: true });
            }).catch(() => {
                event.ports[0].postMessage({ success: false });
            });
        });
    }

    if (event.data && event.data.type === 'DELETE_AUDIO') {
        const { url } = event.data;
        caches.open(AUDIO_CACHE).then((cache) => {
            cache.delete(url).then(() => {
                event.ports[0].postMessage({ success: true });
            });
        });
    }
});
