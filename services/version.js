(function (global) {
    const CAMBRIC_VERSION = "1.0.1";
    const TEMPLATE_VERSION = "1.0.0";
    const BUILD_DATE = "2026-09-24";
    const BUILD_ID = "cambric-web-template-v1";

    function getVersionInfo() {
        return {
            semver: CAMBRIC_VERSION,
            version: CAMBRIC_VERSION,
            templateVersion: TEMPLATE_VERSION,
            buildDate: BUILD_DATE,
            buildId: BUILD_ID,
            timeStamp: new Date().toISOString(),
            channel: "web"
        };
    }

    if (typeof module !== "undefined") {
        module.exports = {
            CAMBRIC_VERSION,
            TEMPLATE_VERSION,
            BUILD_DATE,
            BUILD_ID,
            getVersionInfo
        };
    }

    if (global) {
        global.CAMBRIC_VERSION = CAMBRIC_VERSION;
        global.CambricVersion = {
            current: CAMBRIC_VERSION,
            templateVersion: TEMPLATE_VERSION,
            buildDate: BUILD_DATE,
            buildId: BUILD_ID,
            getVersionInfo
        };
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
