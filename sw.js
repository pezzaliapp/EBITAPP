// sw.js — simple offline cache
const CACHE = 'ebitapp-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/favicon.ico'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  e.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).then(resp => {
        // cache new navigations to assets already known
        const url = new URL(request.url);
        if (ASSETS.includes('./' + url.pathname.split('/').pop())) {
          const respClone = resp.clone();
          caches.open(CACHE).then(cache => cache.put(request, respClone));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});