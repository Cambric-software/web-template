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
        name: window.CAMBRIC_CONFIG?.product?.name || "Cambric Website",
        version: window.CAMBRIC_CONFIG?.product?.version || window.CAMBRIC_VERSION || "1.0.1",
        platform: "web",
        capabilities: ["offline", "cache", "localization", "website"],
        ecosystemVersion: 1,
        lastSeen: new Date().toISOString()
    });

    document.querySelectorAll("[data-cambric-version]").forEach((element) => {
        element.textContent = window.CAMBRIC_CONFIG?.product?.version || window.CAMBRIC_VERSION || "unknown";
    });

    const productNameNode = document.getElementById("product-name");
    if (productNameNode) {
        productNameNode.textContent = window.CAMBRIC_CONFIG?.product?.name || "Cambric Website";
    }

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

    window.dispatchEvent(new CustomEvent("cambric-ready", { detail: { ecosystemId } }));
})();
