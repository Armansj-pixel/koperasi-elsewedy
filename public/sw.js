// public/sw.js
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Hanya melakukan pass-through, tapi cukup untuk memenuhi syarat PWA
  event.respondWith(fetch(event.request).catch(() => new Response('Sedang Offline')));
});
