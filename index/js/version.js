const CambricVersion = (typeof window !== "undefined" && window.CambricVersion) || {
    current: "1.0.1",
    templateVersion: "1.0.0",
    get version() {
        return this.current;
    },
    get buildInfo() {
        return {
            version: this.current,
            templateVersion: this.templateVersion,
            buildDate: "2026-09-24",
            buildId: "cambric-web-template-v1"
        };
    }
};

window.CAMBRIC_VERSION = CambricVersion.current;
window.CambricVersion = CambricVersion;
