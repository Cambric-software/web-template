(function () {
    // ── Theme (dark mode) ─────────────────────────────────────────────────────
    // Uses CambricStorage for consistent namespaced persistence.
    // Falls back to localStorage directly if CambricStorage is not yet loaded.

    function getStorage() {
        return window.CambricStorage || {
            get: (k, d) => { try { return localStorage.getItem('cambric:' + k) || d; } catch { return d; } },
            set: (k, v) => { try { localStorage.setItem('cambric:' + k, v); } catch {} }
        };
    }

    function setTheme(theme) {
        const nextTheme = theme === 'dark' ? 'dark' : 'light';
        document.documentElement.dataset.theme = nextTheme;
        // Persist with CambricStorage (namespaced, versioned)
        getStorage().set('theme', nextTheme);
        document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
            button.setAttribute('aria-pressed', String(nextTheme === 'dark'));
            button.textContent = nextTheme === 'dark' ? 'Light mode' : 'Dark mode';
        });
    }

    function initTheme() {
        // Prefer stored preference, fall back to OS preference
        const stored = getStorage().get('theme', null);
        const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(stored || preferred);
        document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
            button.addEventListener('click', () => {
                setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
            });
        });
    }

    // ── Language switcher ─────────────────────────────────────────────────────

    function setLanguage(lang) {
        if (!window.CambricI18n) return;
        window.CambricI18n.setLanguage(lang);
        // Persist choice
        getStorage().set('language', lang);
        // Update switcher button label
        document.querySelectorAll('[data-language-toggle]').forEach((btn) => {
            btn.textContent = lang === 'ar' ? 'English' : 'العربية';
            btn.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'Switch to Arabic');
        });
        // Update connectivity status text
        const statusEl = document.getElementById('connectivity-status');
        if (statusEl) {
            const state = statusEl.dataset.state || 'online';
            statusEl.textContent = window.CambricI18n.get(state);
        }
    }

    function initLanguage() {
        const stored = getStorage().get('language', 'en');
        if (stored && stored !== 'en') setLanguage(stored);

        document.querySelectorAll('[data-language-toggle]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const current = document.documentElement.lang || 'en';
                setLanguage(current === 'ar' ? 'en' : 'ar');
            });
        });
    }

    // ── Contact form ──────────────────────────────────────────────────────────

    function showFieldError(field, message) {
        const error = document.querySelector(`[data-error-for="${field.name}"]`);
        field.setAttribute('aria-invalid', String(Boolean(message)));
        if (error) error.textContent = message || '';
    }

    function initContactForm() {
        const form = document.querySelector('[data-contact-form]');
        if (!form || !window.CambricForms) return;

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const values = Object.fromEntries(new FormData(form).entries());
            const result = window.CambricForms.validateContactForm(values);
            Object.entries(values).forEach(([name]) => {
                const field = form.elements.namedItem(name);
                if (field) showFieldError(field, result.errors[name]);
            });

            const status = form.querySelector('[data-form-status]');
            if (result.valid) {
                form.reset();
                status.textContent = 'Thanks. Your message is ready to send.';
                status.dataset.state = 'success';
            } else {
                status.textContent = 'Please check the highlighted fields.';
                status.dataset.state = 'error';
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initLanguage();
        initContactForm();
    });
})();
