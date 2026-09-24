(function (global) {
    const dictionaries = {
        en: {
            offline: "Offline",
            online: "Online",
            cached: "Cached information",
            firstRun: "Welcome to Cambric"
        },
        ar: {
            offline: "غير متصل",
            online: "متصل",
            cached: "معلومات محفوظة مؤقتًا",
            firstRun: "مرحبًا بك في Cambric"
        }
    };

    class CambricI18nManager {
        constructor() {
            this.language = "en";
            this.dictionaries = dictionaries;
        }

        setLanguage(language) {
            const nextLanguage = this.dictionaries[language] ? language : "en";
            this.language = nextLanguage;

            if (typeof document !== "undefined") {
                document.documentElement.lang = nextLanguage;
                document.documentElement.dir = nextLanguage === "ar" ? "rtl" : "ltr";
            }

            if (global && global.CambricStorage) {
                global.CambricStorage.set("language", nextLanguage);
            }

            return nextLanguage;
        }

        get(key) {
            return this.dictionaries[this.language]?.[key] || this.dictionaries.en[key] || key;
        }

        init() {
            const storageLanguage = global && global.CambricStorage ? global.CambricStorage.get("language", "en") : "en";
            return this.setLanguage(storageLanguage);
        }
    }

    const CambricI18n = new CambricI18nManager();

    if (typeof module !== "undefined") {
        module.exports = { CambricI18n, dictionaries };
    }

    if (global) {
        global.CambricI18n = CambricI18n;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
