(function (global) {
    class CambricStorage {
        constructor(options = {}) {
            this.namespace = options.namespace || "cambric";
            this.prefix = `${this.namespace}:`;
            this.schemaVersion = options.schemaVersion || 1;
            this.storage = typeof localStorage !== "undefined" ? localStorage : null;
            this.memoryStorage = new Map();
        }

        safeRead(key) {
            if (this.storage) {
                try {
                    return this.storage.getItem(this.prefix + key);
                } catch {
                    return null;
                }
            }

            return this.memoryStorage.has(this.prefix + key) ? this.memoryStorage.get(this.prefix + key) : null;
        }

        safeWrite(key, value) {
            if (this.storage) {
                try {
                    this.storage.setItem(this.prefix + key, value);
                    return true;
                } catch {
                    return false;
                }
            }

            this.memoryStorage.set(this.prefix + key, value);
            return true;
        }

        set(key, value) {
            const payload = {
                schemaVersion: this.schemaVersion,
                updatedAt: new Date().toISOString(),
                value
            };
            return this.safeWrite(key, JSON.stringify(payload));
        }

        get(key, fallback = null) {
            const raw = this.safeRead(key);
            if (raw === null) {
                return fallback;
            }

            try {
                const parsed = JSON.parse(raw);
                if (parsed && Object.prototype.hasOwnProperty.call(parsed, "value")) {
                    return parsed.value;
                }
                return parsed;
            } catch {
                return fallback;
            }
        }

        remove(key) {
            if (this.storage) {
                try {
                    this.storage.removeItem(this.prefix + key);
                    return true;
                } catch {
                    return false;
                }
            }

            return this.memoryStorage.delete(this.prefix + key);
        }

        clearNamespace() {
            if (this.storage) {
                const keys = [];
                for (let i = 0; i < this.storage.length; i += 1) {
                    const key = this.storage.key(i);
                    if (key && key.startsWith(this.prefix)) {
                        keys.push(key);
                    }
                }

                keys.forEach((key) => this.storage.removeItem(key));
                return keys.length;
            }

            const keys = [...this.memoryStorage.keys()].filter((key) => key.startsWith(this.prefix));
            keys.forEach((key) => this.memoryStorage.delete(key));
            return keys.length;
        }

        keys() {
            if (this.storage) {
                const keys = [];
                for (let i = 0; i < this.storage.length; i += 1) {
                    const key = this.storage.key(i);
                    if (key && key.startsWith(this.prefix)) {
                        keys.push(key.slice(this.prefix.length));
                    }
                }
                return keys;
            }

            return [...this.memoryStorage.keys()]
                .filter((key) => key.startsWith(this.prefix))
                .map((key) => key.slice(this.prefix.length));
        }
    }

    const defaultStorage = new CambricStorage();

    if (typeof module !== "undefined") {
        module.exports = { CambricStorage, createStorage: (options = {}) => new CambricStorage(options) };
    }

    if (global) {
        global.CambricStorage = defaultStorage;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
