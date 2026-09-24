(async function () {
    const setStatus = (message, type = "info") => {
        const statusNode = document.getElementById("connectivity-status");
        if (!statusNode) {
            return;
        }
        statusNode.textContent = message;
        statusNode.dataset.state = type;
    };

    CambricI18n.init();

    const ecosystemId = CambricEcosystem.ensureIdentity();
    CambricEcosystem.registerProduct({
        productId: window.CAMBRIC_CONFIG?.product?.id || "cambric-web-product",
        name: window.CAMBRIC_CONFIG?.product?.name || "Cambric Web Product",
        version: window.CAMBRIC_CONFIG?.product?.version || window.CAMBRIC_VERSION || "1.0.0",
        platform: "web",
        capabilities: ["offline", "cache", "release-discovery"],
        ecosystemVersion: 1,
        lastSeen: new Date().toISOString()
    });

    document.querySelectorAll("[data-cambric-version]").forEach((element) => {
        element.textContent = window.CAMBRIC_CONFIG?.product?.version || window.CAMBRIC_VERSION || "unknown";
    });

    const productNameNode = document.getElementById("product-name");
    if (productNameNode) {
        productNameNode.textContent = window.CAMBRIC_CONFIG?.product?.name || "Cambric Web Product";
    }

    const releaseNode = document.getElementById("release-name");
    const versionNode = document.querySelector("[data-release-version]");
    const releaseLinkNode = document.querySelector("[data-release-url]");
    const downloadContainer = document.getElementById("downloads");

    const updateOfflineState = () => {
        const status = CambricOffline.getStatus();
        setStatus(status.online ? CambricI18n.get("online") : CambricI18n.get("offline"), status.online ? "online" : "offline");
    };

    CambricOffline.onChange(updateOfflineState);
    updateOfflineState();

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./service-worker.js").catch(() => {
            setStatus("Offline cache unavailable", "offline");
        });
    }

    if (releaseNode) {
        releaseNode.textContent = CambricI18n.get("loading");
    }

    const release = await CambricRelease.discover();

    if (versionNode) {
        versionNode.textContent = release?.version || "Unavailable";
    }

    if (releaseNode) {
        releaseNode.textContent = release?.name || CambricI18n.get("releaseUnavailable");
    }

    if (releaseLinkNode && release?.releaseUrl) {
        releaseLinkNode.href = release.releaseUrl;
        releaseLinkNode.hidden = false;
    }

    if (downloadContainer) {
        if (!release || !release.assets || !release.assets.length) {
            downloadContainer.innerHTML = `<p class="status-message info">${CambricI18n.get("noDownloads")}</p>`;
        } else {
            downloadContainer.innerHTML = release.assets.map((asset) => {
                const safeName = (asset.name || "Download").replace(/</g, "&lt;");
                return `<a class="download-button" href="${asset.url || '#'}" target="_blank" rel="noopener noreferrer">${safeName}</a>`;
            }).join("");
        }
    }

    window.dispatchEvent(new CustomEvent("cambric-ready", { detail: { ecosystemId, release } }));
})();
