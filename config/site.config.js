const SiteConfig = {
    siteName: "Cambric Website",
    companyName: "Cambric Software",
    description: "Cambric Software local-first website template.",
    localFirst: true,
    allowNetworkEnhancements: true,
    productId: "cambric-web-product",
    productName: "Cambric Website",
    version: "1.0.1",
    templateVersion: "1.0.0"
};

if (typeof module !== "undefined") {
    module.exports = SiteConfig;
}

if (typeof window !== "undefined") {
    window.SiteConfig = SiteConfig;
}
