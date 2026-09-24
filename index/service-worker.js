const CACHE_NAME = "cambric-web-v1";

const STATIC_ASSET_PATHS = [
    "",
    "index.html",
    "manifest.webmanifest",
    "index/assets/cambric-logo.png",
    "index/css/main.css",
    "index/js/version.js",
    "index/js/config.js",
    "index/js/app.js",
    "services/version.js",
    "services/storage.js",
    "services/cache.js",
    "services/i18n.js",
    "services/offline.js",
    "services/ecosystem.js",
    "config/cambric.config.json"
];

const STATIC_ASSETS = STATIC_ASSET_PATHS.map(assetPath =>
    new URL(assetPath, self.registration.scope).toString()
);

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key.startsWith("cambric-") && key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    event.respondWith(
        caches.match(request).then(cached => {
            const network = fetch(request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(request, copy));
                    }

                    return response;
                })
                .catch(() => cached);

            return cached || network;
        })
    );
});
