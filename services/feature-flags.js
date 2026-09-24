(function (global) {
    const defaultFeatureFlags = {
        offline: true,
        cache: true,
        ecosystem: true,
        localization: true,
        pwa: false,
        extensions: false
    };

    const state = { ...defaultFeatureFlags };

    function getFeatureFlags() {
        const configFlags = (global && global.CAMBRIC_CONFIG && global.CAMBRIC_CONFIG.features) || {};
        return { ...defaultFeatureFlags, ...state, ...configFlags };
    }

    function setFeatureFlag(name, value) {
        if (!name || typeof name !== "string") {
            return null;
        }

        state[name] = Boolean(value);
        return state[name];
    }

    function isFeatureEnabled(name) {
        const flags = getFeatureFlags();
        return Boolean(flags[name]);
    }

    if (typeof module !== "undefined") {
        module.exports = {
            defaultFeatureFlags,
            getFeatureFlags,
            setFeatureFlag,
            isFeatureEnabled
        };
    }

    if (global) {
        global.CambricFeatureFlags = {
            getFeatureFlags,
            setFeatureFlag,
            isFeatureEnabled
        };
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
