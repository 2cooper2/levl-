// This is a client-side only file
export default function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("ServiceWorker registration successful")
        })
        .catch((error) => {
          console.error("ServiceWorker registration failed:", error)
        })
    })
  }
}

// The actual service worker code should be in a public/sw.js file
// This is just a TypeScript definition of what that file would contain
export const serviceWorkerScript = `
const CACHE_NAME = "levl-cache-v1";
const urlsToCache = ["/", "/favicon.ico", "/manifest.json"];

self.addEventListener("install", (event) => {
  // Skip waiting to activate the new service worker immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Only cache GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // Clone the request because it's a one-time use stream
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Clone the response because it's a one-time use stream
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Network failed, try to return a fallback
        return caches.match('/offline.html');
      });
    })
  );
});

// Clean up old caches when a new service worker activates
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );
});
`

// Create an offline.html file for fallback
export const offlineHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - Levl Marketplace</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
      color: #333;
    }
    h1 {
      margin-bottom: 1rem;
    }
    p {
      margin-bottom: 2rem;
      max-width: 500px;
    }
    button {
      background-color: #7e22ce;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
    }
    button:hover {
      background-color: #6b21a8;
    }
  </style>
</head>
<body>
  <h1>You're offline</h1>
  <p>It looks like you've lost your internet connection. Please check your connection and try again.</p>
  <button onclick="window.location.reload()">Try Again</button>
</body>
</html>
`
