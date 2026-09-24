(function (global) {
    const CAMBRIC_CACHE_VERSION = "cambric-web-v1";
    const CAMBRIC_CACHE_NAMES = [
        CAMBRIC_CACHE_VERSION,
        "cambric-release-metadata-v1"
    ];

    function getCacheStorage() {
        return typeof caches !== "undefined" ? caches : null;
    }

    class CambricCacheManager {
        constructor(options = {}) {
            this.prefix = options.prefix || "cambric-";
            this.version = options.version || CAMBRIC_CACHE_VERSION;
            this.defaultNames = options.defaultNames || CAMBRIC_CACHE_NAMES;
        }

        getSupportedStrategies() {
            return [
                "cacheFirst",
                "networkFirst",
                "staleWhileRevalidate",
                "networkOnly",
                "cacheOnly"
            ];
        }

        normalizeRequest(request) {
            if (typeof request === "string") {
                return request;
            }
            return request && request.url ? request.url : String(request);
        }

        async clearCaches() {
            const cacheStorage = getCacheStorage();
            if (!cacheStorage) {
                return [];
            }

            const keys = await cacheStorage.keys();
            const filtered = keys.filter((key) => key.startsWith(this.prefix));
            await Promise.all(filtered.map((key) => cacheStorage.delete(key)));
            return filtered;
        }

        async getCacheInfo() {
            const cacheStorage = getCacheStorage();
            if (!cacheStorage) {
                return { caches: [], rowCount: 0, timestamp: new Date().toISOString() };
            }

            const names = await cacheStorage.keys();
            const filtered = names.filter((name) => name.startsWith(this.prefix));
            return {
                caches: filtered,
                rowCount: filtered.length,
                timestamp: new Date().toISOString()
            };
        }

        async cleanupOldCaches() {
            const cacheStorage = getCacheStorage();
            if (!cacheStorage) {
                return [];
            }

            const keys = await cacheStorage.keys();
            const stale = keys.filter((key) => key.startsWith(this.prefix) && !this.defaultNames.includes(key));
            await Promise.all(stale.map((key) => cacheStorage.delete(key)));
            return stale;
        }

        registerCache(cacheName, strategy = "cacheFirst") {
            return {
                cacheName,
                strategy,
                supported: this.getSupportedStrategies().includes(strategy)
            };
        }

        buildServiceWorker() {
            return `const CACHE_PREFIX = "cambric-";
const CACHE_NAME = "cambric-web-v1";
const OFFLINE_URL = "/index/index.html";

const ASSETS = [
  "/index/index.html",
  "/index/css/main.css",
  "/index/js/config.js",
  "/index/js/app.js",
  "/index/js/version.js",
  "/services/storage.js",
  "/services/cache.js",
  "/services/i18n.js",
  "/services/release.js",
  "/services/download.js",
  "/services/offline.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        const refreshed = fetch(request).then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        }).catch(() => cached);
        return refreshed;
      }

      return fetch(request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match(OFFLINE_URL).then((fallback) => fallback || Response.error()));
    })
  );
});`;
        }
    }

    const CambricCache = new CambricCacheManager();
    const cambricClearCaches = () => CambricCache.clearCaches();
    const cambricCacheInfo = () => CambricCache.getCacheInfo();

    if (typeof module !== "undefined") {
        module.exports = {
            CAMBRIC_CACHE_VERSION,
            CAMBRIC_CACHE_NAMES,
            CambricCache,
            CambricCacheManager,
            cambricClearCaches,
            cambricCacheInfo
        };
    }

    if (global) {
        global.CAMBRIC_CACHE_VERSION = CAMBRIC_CACHE_VERSION;
        global.CAMBRIC_CACHE_NAMES = CAMBRIC_CACHE_NAMES;
        global.CambricCache = CambricCache;
        global.cambricClearCaches = cambricClearCaches;
        global.cambricCacheInfo = cambricCacheInfo;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
