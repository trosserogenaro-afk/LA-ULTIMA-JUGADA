const CACHE = "luj-v12";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./logo-luj.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.hostname.includes("espn.com") || url.hostname.includes("api-sports") || url.hostname.includes("googleapis") || url.hostname.includes("corsproxy") || url.hostname.includes("allorigins")) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // HTML siempre red primero (evita ver versión vieja con duplicados)
  if (e.request.mode === "navigate" || (e.request.headers.get("accept")||"").includes("text/html") || url.pathname.endsWith(".html") || url.pathname === "/" || url.pathname.endsWith("/")) {
    e.respondWith(
      fetch(e.request).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match(e.request).then((x) => x || caches.match("./index.html")))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const net = fetch(e.request).then((res) => {
        if (res && res.ok && e.request.method === "GET") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return net || cached;
    })
  );
});
