const CACHE = "registro-pwa-v7"; // ⬅️ SUBE ESTO cada vez que cambies HTML/CSS/JS
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./logo.png",
  "./sw.js",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)));
      await self.clients.claim();
    })()
  );
});

/**
 * Estrategia:
 * - index.html: network-first (si hay red, quiero lo último; si no, lo cacheado)
 * - resto: cache-first + actualiza en segundo plano
 */
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Solo gestionamos mismo origen (evita problemas con cdn/extensiones)
  if (url.origin !== self.location.origin) return;

  // ✅ Para el HTML: SIEMPRE intentar red primero (evita “interfaz antigua”)
  if (url.pathname.endsWith("/") || url.pathname.endsWith("/index.html")) {
    e.respondWith(networkFirst(req));
    return;
  }

  // ✅ Para lo demás: cache-first + refresco
  e.respondWith(staleWhileRevalidate(req));
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(req);
    cache.put(req, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(req);
    return cached || caches.match("./index.html");
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);

  const fetchPromise = fetch(req)
    .then((fresh) => {
      cache.put(req, fresh.clone());
      return fresh;
    })
    .catch(() => null);

  return cached || (await fetchPromise) || caches.match("./index.html");
}
