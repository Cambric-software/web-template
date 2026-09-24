(function (global) {
    function normalizeAsset(asset) {
        if (!asset || typeof asset !== "object") {
            return null;
        }

        return {
            name: asset.name || "asset",
            url: asset.browser_download_url || asset.url || "",
            size: typeof asset.size === "number" ? asset.size : 0,
            contentType: asset.content_type || "application/octet-stream"
        };
    }

    function normalizeReleaseMetadata(raw, repository) {
        if (!raw || typeof raw !== "object") {
            return null;
        }

        const version = raw.tag_name || raw.version || "";
        if (!version) {
            return null;
        }

        const releaseUrl = raw.html_url || raw.releaseUrl || "";
        const name = raw.name || raw.tag_name || raw.version || "Release";

        return {
            repository: repository || raw.repository || "",
            version,
            name,
            releaseUrl,
            publishedAt: raw.published_at || raw.publishedAt || "",
            body: raw.body || raw.description || "",
            assets: Array.isArray(raw.assets) ? raw.assets.map(normalizeAsset).filter(Boolean) : [],
            checkedAt: raw.checkedAt || new Date().toISOString(),
            isPrerelease: Boolean(raw.prerelease),
            isCached: Boolean(raw.isCached)
        };
    }

    function selectLatestRelease(rawReleases, repository) {
        if (!Array.isArray(rawReleases)) {
            return null;
        }

        const releases = rawReleases
            .filter((release) => release && !release.draft)
            .map((release) => normalizeReleaseMetadata(release, repository))
            .filter(Boolean);

        return releases[0] || null;
    }

    class CambricReleaseManager {
        constructor(options = {}) {
            this.cacheKey = options.cacheKey || "release-metadata";
            this.cacheDuration = options.cacheDuration || 24 * 60 * 60 * 1000;
            this.repository = options.repository || "";
            this.apiBase = options.apiBase || "https://api.github.com";
        }

        getCacheKeys() {
            return [this.cacheKey, `${this.cacheKey}:latest`];
        }

        static create(options = {}) {
            return new CambricReleaseManager(options);
        }

        getConfig() {
            const config = (global && global.CAMBRIC_CONFIG) || {};
            return {
                repository: this.repository || config?.release?.repository || "",
                apiBase: this.apiBase || config?.release?.apiBase || "https://api.github.com",
                allowFallbackCache: config?.release?.allowFallbackCache !== false
            };
        }

        loadCached() {
            const storage = global && global.CambricStorage ? global.CambricStorage : null;
            if (!storage) {
                return null;
            }

            const cached = storage.get(this.cacheKey, null);
            if (!cached || typeof cached !== "object") {
                return null;
            }

            return normalizeReleaseMetadata(cached, this.repository);
        }

        async discover() {
            const config = this.getConfig();
            const storage = global && global.CambricStorage ? global.CambricStorage : null;

            if (!config.repository) {
                return this.loadCached();
            }

            try {
                if (typeof fetch !== "function") {
                    throw new Error("Fetch API is unavailable.");
                }

                const response = await fetch(`${config.apiBase}/repos/${config.repository}/releases?per_page=20`, {
                    headers: { Accept: "application/vnd.github+json" }
                });

                if (!response.ok) {
                    throw new Error(`Release request failed: ${response.status}`);
                }

                const releases = await response.json();
                const metadata = selectLatestRelease(releases, config.repository);

                if (!metadata) {
                    throw new Error("Release metadata was malformed.");
                }

                if (storage) {
                    storage.set(this.cacheKey, metadata);
                }

                return metadata;
            } catch (error) {
                if (config.allowFallbackCache) {
                    const cached = this.loadCached();
                    if (cached) {
                        return { ...cached, isCached: true };
                    }
                }

                return null;
            }
        }
    }

    const CambricRelease = CambricReleaseManager;
    const CambricReleaseInstance = new CambricReleaseManager();

    if (typeof module !== "undefined") {
        module.exports = {
            CambricRelease,
            CambricReleaseManager,
            CambricReleaseInstance,
            normalizeReleaseMetadata,
            selectLatestRelease
        };
    }

    if (global) {
        global.CambricRelease = CambricReleaseInstance;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
