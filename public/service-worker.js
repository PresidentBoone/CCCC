// College Climb Service Worker
// Provides offline caching and improved performance

const CACHE_NAME = 'college-climb-v2.0.0';
const RUNTIME_CACHE = 'college-climb-runtime';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/dashboard.html',
  '/index.html',
  '/login',
  '/signup.html',
  '/profile.html',
  '/questions.html',
  '/discovery.html',
  '/essaycoach.html',
  '/scholarship.html',
  '/myapp.html',
  '/images/default-avatar.svg',
  '/images/whiteclearcc.png',
  '/js/logger.js',
  '/js/college-api.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'no-cache' })));
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    // Cache external assets like fonts and icons
    if (url.hostname.includes('googleapis.com') ||
        url.hostname.includes('cdnjs.cloudflare.com') ||
        url.hostname.includes('gstatic.com')) {
      event.respondWith(cacheFirst(request));
    }
    return;
  }

  // API requests - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Firebase requests - always network
  if (url.hostname.includes('firebase')) {
    return;
  }

  // Static assets - Cache first
  event.respondWith(cacheFirst(request));
});

// Cache first strategy - for static assets
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[Service Worker] Serving from cache:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      console.log('[Service Worker] Caching new resource:', request.url);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);

    // Return offline page if available
    const offlineResponse = await cache.match('/offline.html');
    return offlineResponse || new Response('Offline - Please check your connection', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// Network first strategy - for API calls
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);

    // Cache successful API responses (except mutations)
    if (response.ok && request.method === 'GET') {
      console.log('[Service Worker] Caching API response:', request.url);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'No cached data available. Please check your connection.'
    }), {
      status: 503,
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data.action === 'clearCache') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

console.log('[Service Worker] Loaded');
