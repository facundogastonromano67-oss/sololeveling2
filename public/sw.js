const CACHE_PREFIX = "g30-runtime-";
const CACHE = `${CACHE_PREFIX}v3`;
const CORE = ["./", "./manifest.webmanifest", "./assets/icon.svg", "./assets/hero-awakening.webp"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== location.origin) return;
  const normalized = new URL(event.request.url);
  normalized.search = "";
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok && response.type === "basic") caches.open(CACHE).then(cache => cache.put(new Request(normalized), response.clone()));
    return response;
  }).catch(() => caches.match(new Request(normalized)).then(cached => cached || (event.request.mode === "navigate" ? caches.match("./") : undefined))));
});
