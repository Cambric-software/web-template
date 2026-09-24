(function (global) {
    const registryKey = "ecosystem-registry";

    function getRegistry() {
        const storage = global && global.CambricStorage ? global.CambricStorage : null;
        const fallback = {
            ecosystemVersion: 1,
            ecosystemId: null,
            products: [],
            connections: []
        };

        if (!storage) {
            return fallback;
        }

        return storage.get(registryKey, fallback);
    }

    function saveRegistry(registry) {
        const storage = global && global.CambricStorage ? global.CambricStorage : null;
        if (storage) {
            storage.set(registryKey, registry);
        }
    }

    const CambricEcosystem = {
        registryKey,
        getRegistry,
        saveRegistry,
        ensureIdentity() {
            const registry = this.getRegistry();
            if (!registry.ecosystemId) {
                registry.ecosystemId = global && global.crypto && global.crypto.randomUUID
                    ? global.crypto.randomUUID()
                    : `cambric-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                this.saveRegistry(registry);
            }
            return registry.ecosystemId;
        },
        registerProduct(product) {
            const registry = this.getRegistry();
            const existing = registry.products.find((item) => item.productId === product.productId);
            if (existing) {
                Object.assign(existing, product);
            } else {
                registry.products.push(product);
            }
            this.saveRegistry(registry);
            return registry.products;
        },
        getProducts() {
            return this.getRegistry().products;
        },
        getConnections() {
            return this.getRegistry().connections;
        },
        addConnection(connection) {
            const registry = this.getRegistry();
            const exists = registry.connections.some((item) => item.from === connection.from && item.to === connection.to);
            if (!exists) {
                registry.connections.push(connection);
                this.saveRegistry(registry);
            }
            return registry.connections;
        },
        removeConnection(from, to) {
            const registry = this.getRegistry();
            registry.connections = registry.connections.filter((item) => !(item.from === from && item.to === to));
            this.saveRegistry(registry);
            return registry.connections;
        }
    };

    if (typeof module !== "undefined") {
        module.exports = { CambricEcosystem, getRegistry, saveRegistry };
    }

    if (global) {
        global.CambricEcosystem = CambricEcosystem;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
