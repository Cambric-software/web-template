const SiteConfig = {
    siteName: "Cambric Website",
    companyName: "Cambric Software",
    description: "Cambric Software website template.",
    localFirst: true,
    allowNetworkEnhancements: true,
    productId: "cambric-web-product",
    productName: "Cambric Web Product",
    version: "1.0.0",
    templateVersion: "1.0.0"
};

if (typeof module !== "undefined") {
    module.exports = SiteConfig;
}

if (typeof window !== "undefined") {
    window.SiteConfig = SiteConfig;
}
