/**
 * SUD.TJ service worker.
 *
 * Server headers alone stop the browser re-downloading assets, but a returning
 * visitor still pays for the HTML document and every API round trip. This
 * worker keeps the app shell and the public read-only API in the Cache Storage
 * so a repeat visit renders instantly and survives a flaky connection.
 *
 * Strategy per request type:
 *   - hashed build assets  cache-first, forever (the URL changes when the
 *                           content changes, so they can never go stale)
 *   - navigations          network-first with a cached shell fallback, so a
 *                           deploy is picked up but an offline visit still works
 *   - allowlisted public GET  stale-while-revalidate: instant response,
 *                           refreshed in the background
 *   - everything else    never cached, always live
 */

const VERSION = 'sudtj-v1';
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;
const DATA = `${VERSION}-data`;

/** The shell is intentionally tiny: just enough to boot the SPA. */
const SHELL_URLS = ['/', '/index.html', '/offline.html'];

const PRECACHE = [...SHELL_URLS, '/supreme-court-day.jpg', '/supreme-court-night.jpg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(ASSETS)
      .then((cache) => cache.addAll(PRECACHE).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

const isAsset = (url) =>
  url.pathname.startsWith('/assets/') ||
  /\.(png|jpe?g|webp|avif|svg|ico|woff2?|glb|gltf|bin)$/i.test(url.pathname);

/**
 * Only these API reads are safe to reuse from Cache Storage.
 *
 * The alternative - caching every GET under /api/ - would store whatever the
 * endpoint happens to return. A future route serving per-user data would be
 * cached silently and served to whoever uses that browser next. An allowlist
 * fails closed: an endpoint is only reused once it is deliberately listed.
 */
const PUBLIC_API = [
  '/api/news',
  '/api/site-sections',
  '/api/design-settings',
  '/api/marquee-config',
  '/api/useful-sites',
  '/api/court-structure',
  '/api/judges',
  '/api/search',
];

const isPublicApi = (url) => PUBLIC_API.includes(url.pathname);

async function cacheFirst(request) {
  const cache = await caches.open(ASSETS);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response && response.ok && response.type === 'basic') {
    cache.put(request, response.clone()).catch(() => undefined);
  }
  return response;
}

async function networkFirstShell(request) {
  const cache = await caches.open(SHELL);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone()).catch(() => undefined);
    return response;
  } catch {
    return (
      (await cache.match(request)) ||
      (await cache.match('/index.html')) ||
      new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DATA);
  const hit = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone()).catch(() => undefined);
      return response;
    })
    .catch(() => undefined);
  return hit || (await network) || new Response('[]', { status: 504 });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Admin, uploads and the filings flow are user-specific: never cache them.
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api/admin') ||
    url.pathname.startsWith('/uploads') ||
    url.pathname.startsWith('/library-files')
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstShell(request));
    return;
  }
  if (isAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (isPublicApi(url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'sudtj:skip-waiting') self.skipWaiting();
});
