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
                name: "Cambric Website",
                description: "Cambric local-first web template.",
                version: "1.0.1",
                websiteTitle: "Cambric Website"
            },
            features: {
                offline: true,
                cache: true,
                localization: true,
                ecosystem: true
            }
        };
    }

    window.CambricConfig = window.CAMBRIC_CONFIG;
})();
