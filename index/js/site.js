(function () {
    const themeKey = 'cambric-theme';
    const root = document.documentElement;

    function setTheme(theme) {
        const nextTheme = theme === 'dark' ? 'dark' : 'light';
        root.dataset.theme = nextTheme;
        localStorage.setItem(themeKey, nextTheme);
        document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
            button.setAttribute('aria-pressed', String(nextTheme === 'dark'));
            button.textContent = nextTheme === 'dark' ? 'Light mode' : 'Dark mode';
        });
    }

    function initTheme() {
        const stored = localStorage.getItem(themeKey);
        const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(stored || preferred);
        document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
            button.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
        });
    }

    function showFieldError(field, message) {
        const error = document.querySelector(`[data-error-for="${field.name}"]`);
        field.setAttribute('aria-invalid', String(Boolean(message)));
        if (error) {
            error.textContent = message || '';
        }
    }

    function initContactForm() {
        const form = document.querySelector('[data-contact-form]');
        if (!form || !window.CambricForms) {
            return;
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const values = Object.fromEntries(new FormData(form).entries());
            const result = window.CambricForms.validateContactForm(values);
            Object.entries(values).forEach(([name]) => {
                const field = form.elements.namedItem(name);
                if (field) {
                    showFieldError(field, result.errors[name]);
                }
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
        initContactForm();
    });
})();
