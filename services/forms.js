(function (global) {
    function validateContactForm(values) {
        const fields = values || {};
        const errors = {};
        const name = String(fields.name || '').trim();
        const email = String(fields.email || '').trim();
        const message = String(fields.message || '').trim();

        if (name.length < 2) {
            errors.name = 'Please enter your name.';
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address.';
        }

        if (message.length < 10) {
            errors.message = 'Please provide at least 10 characters.';
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors
        };
    }

    const CambricForms = { validateContactForm };

    if (typeof module !== 'undefined') {
        module.exports = { CambricForms, validateContactForm };
    }

    if (global) {
        global.CambricForms = CambricForms;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this);
