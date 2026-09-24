(function (global) {
    function detectPlatform() {
        if (typeof navigator === "undefined") {
            return "web";
        }

        const userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.includes("android")) {
            return "android";
        }

        if (userAgent.includes("win")) {
            return "windows";
        }

        if (userAgent.includes("linux")) {
            return "linux";
        }

        return "web";
    }

    function selectBestAsset(assets, platform) {
        const normalizedPlatform = (platform || detectPlatform()).toLowerCase();
        const candidates = Array.isArray(assets) ? assets : [];

        const preferred = {
            windows: ["windows", "win", ".exe"],
            linux: ["linux", "tar.gz", ".deb"],
            android: ["android", "apk", "aab"],
            web: ["web", "zip", "tar.gz"]
        };

        const searchTerms = preferred[normalizedPlatform] || preferred.web;
        const exactMatches = candidates.filter((asset) => {
            const name = (asset.name || "").toLowerCase();
            return searchTerms.some((term) => name.includes(term));
        });

        if (exactMatches.length) {
            return exactMatches[0];
        }

        return candidates[0] || null;
    }

    const DownloadService = {
        detectPlatform,
        selectBestAsset,
        async getText(url, options = {}) {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }
            return response.text();
        },
        async getJson(url, options = {}) {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }
            return response.json();
        }
    };

    if (typeof module !== "undefined") {
        module.exports = { DownloadService, detectPlatform, selectBestAsset };
    }

    if (global) {
        global.CambricDownload = DownloadService;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
