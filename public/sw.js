// Minimal no-op service worker to enable PWA installability
// public/sw.js
self.addEventListener('install', () => {
  // Activate worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Become available to all pages
  event.waitUntil(self.clients.claim());
});

// Optional: respond to ping (useful for debugging)
// self.addEventListener('message', (event) => {
//   if (event.data && event.data.type === 'PING') {
//     event.ports[0]?.postMessage({ type: 'PONG' });
//   }
// });
