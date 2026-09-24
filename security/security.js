(function (global) {
    function sanitizeText(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function isSafeUrl(value) {
        if (!value || typeof value !== "string") {
            return false;
        }

        try {
            const url = new URL(value);
            const allowed = ["https:", "http:", "blob:", "file:"];
            return allowed.includes(url.protocol) || value.startsWith("/");
        } catch {
            return false;
        }
    }

    function scanSecrets(text) {
        const matches = [];
        const patterns = [
            /(?:AKIA|ASIA)[A-Z0-9]{12,}/g,
            /ghp_[A-Za-z0-9]{20,}/g,
            /(?:sk|pk|api[_-]?key|token|secret)[A-Za-z0-9_:-]{8,}/gi,
            /-----BEGIN [A-Z ]+ PRIVATE KEY-----/g,
            /password\s*[:=]\s*["']?[^\s"']+/gi
        ];

        for (const pattern of patterns) {
            const found = text.match(pattern);
            if (found) {
                matches.push(...found.map((value) => ({ type: "likely-secret", value })));
            }
        }

        return matches;
    }

    function validateReleaseMetadata(metadata) {
        if (!metadata || typeof metadata !== "object") {
            return { valid: false, reason: "release metadata was not an object" };
        }

        if (!metadata.version || !String(metadata.version).trim()) {
            return { valid: false, reason: "release metadata is missing a version" };
        }

        if (!metadata.releaseUrl && !metadata.html_url) {
            return { valid: false, reason: "release metadata is missing a source URL" };
        }

        return { valid: true };
    }

    const SecurityService = {
        sanitizeText,
        isSafeUrl,
        scanSecrets,
        validateReleaseMetadata,
        isHttps() {
            if (typeof window === "undefined") {
                return false;
            }
            return window.location.protocol === "https:";
        }
    };

    if (typeof module !== "undefined") {
        module.exports = { SecurityService, sanitizeText, isSafeUrl, scanSecrets, validateReleaseMetadata };
    }

    if (global) {
        global.CambricSecurity = SecurityService;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
