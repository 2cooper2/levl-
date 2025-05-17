// Service worker registration function to be called client-side
export default function registerServiceWorker() {
  // Only run in browser environment
  if (typeof window === "undefined") return

  // Skip in development to avoid caching issues
  if (process.env.NODE_ENV !== "production") {
    console.log("Service worker registration skipped in development")
    return
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      try {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("ServiceWorker registered:", registration.scope)
          })
          .catch((error) => {
            console.error("ServiceWorker registration failed:", error)
            // Don't break the app on service worker failure
          })
      } catch (error) {
        console.error("Error during service worker registration:", error)
        // Don't break the app on service worker failure
      }
    })
  }
}

// Default service worker content
export const DEFAULT_SERVICE_WORKER_CONTENT = `
// Service Worker for Levl Platform
const CACHE_NAME = 'levl-cache-v1';
const OFFLINE_URL = '/offline';
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  self.skipWaiting(); // Ensure new service worker activates immediately
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(STATIC_ASSETS);
      } catch (error) {
        console.error('Service worker installation failed:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      try {
        const cacheKeys = await caches.keys();
        const deletePromises = cacheKeys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key));
          
        await Promise.all(deletePromises);
        await self.clients.claim(); // Take control of all clients
      } catch (error) {
        console.error('Service worker activation failed:', error);
      }
    })()
  );
});

// Fetch event - network-first for API, cache-first for static assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || 
      !url.protocol.startsWith('http')) {
    return;
  }
  
  // API and auth endpoints - network only
  if (url.pathname.startsWith('/api/') || 
      url.pathname.includes('/auth/') ||
      url.pathname.includes('/_next/data/')) {
    event.respondWith(
      fetch(event.request)
        .catch(error => {
          console.error('Network request failed:', error);
          return new Response(JSON.stringify({ error: 'Network connection lost' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }
  
  // HTML pages - network first, then cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(async () => {
          // Return cached version if available
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          
          // Otherwise return the offline page
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }
  
  // Static assets - cache first, then network
  event.respondWith(
    (async () => {
      try {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        
        // Not in cache, get from network
        const networkResponse = await fetch(event.request);
        
        // Cache valid responses
        if (networkResponse.ok && networkResponse.type === 'basic') {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        console.error('Error in fetch handler:', error);
        return new Response('Network error', { status: 503 });
      }
    })()
  );
});

// Handle errors
self.addEventListener('error', event => {
  console.error('Service worker error:', event.error);
});
`
