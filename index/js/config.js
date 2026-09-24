(async function () {
    try {
        const response = await fetch("./config/cambric.config.json", { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Config request failed: ${response.status}`);
        }

        window.CAMBRIC_CONFIG = await response.json();
    } catch {
        window.CAMBRIC_CONFIG = {
            product: {
                id: "cambric-web-product",
                name: "Cambric Web Product",
                description: "Cambric local-first web template.",
                version: "1.0.0",
                websiteTitle: "Cambric Web Product"
            },
            release: {
                repository: "cambricsoftware/web-template",
                apiBase: "https://api.github.com",
                allowFallbackCache: true
            },
            features: {
                offline: true,
                cache: true,
                releaseDiscovery: true,
                downloadPage: true,
                localization: true,
                ecosystem: true
            }
        };
    }

    window.CambricConfig = window.CAMBRIC_CONFIG;
})();
