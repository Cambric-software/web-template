(function (global) {
    class CambricOfflineManager {
        constructor() {
            this.state = typeof navigator === "undefined" || navigator.onLine ? "online" : "offline";
            this.listeners = [];
            this.attach();
        }

        attach() {
            if (typeof window === "undefined") {
                return;
            }

            const update = (value) => this.setState(value);
            window.addEventListener("online", () => update("online"));
            window.addEventListener("offline", () => update("offline"));
        }

        setState(nextState) {
            if (nextState !== "online" && nextState !== "offline") {
                return this.state;
            }

            this.state = nextState;
            this.listeners.forEach((listener) => listener(this.state));
            return this.state;
        }

        onChange(listener) {
            if (typeof listener === "function") {
                this.listeners.push(listener);
            }
            return this;
        }

        isOffline() {
            return this.state === "offline";
        }

        getStatus() {
            return {
                state: this.state,
                online: this.state === "online",
                timestamp: new Date().toISOString()
            };
        }
    }

    const CambricOffline = new CambricOfflineManager();

    if (typeof module !== "undefined") {
        module.exports = { CambricOffline, CambricOfflineManager };
    }

    if (global) {
        global.CambricOffline = CambricOffline;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
