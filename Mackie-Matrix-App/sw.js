/**
 * @file sw.js
 * @author Rogerr Carvajal (@rogerrcarvajal)
 * @description Service Worker Offline-First para Mackie Matrix Console M2 en iPadOS 17+
 */

const CACHE_NAME = 'mackie-matrix-m2-v1.0.0';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/mackie-parser.js',
  './js/dsp-engine.js',
  './js/app.js',
  './manifest.webmanifest',
  './presets/MainStream-Config-Backup-V2.mackie',
  './presets/Mackie-Mainstream-Backup-V1.mackie',
  './assets/matrix-software.png',
  './assets/Mainstream_Top.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
