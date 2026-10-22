/*
 * Applies the saved theme before first paint.
 *
 * Kept separate from site.js so it can load synchronously in <head> without an
 * inline script (the page's CSP does not allow inline scripts). site.js owns
 * the toggle; this file owns the initial state and the storage key.
 */
(function () {
    'use strict';

    var KEY = 'cambric:theme';
    var root = document.documentElement;

    function read() {
        try {
            return window.localStorage.getItem(KEY);
        } catch (error) {
            return null;
        }
    }

    function write(theme) {
        try {
            window.localStorage.setItem(KEY, theme);
        } catch (error) {
            /* Private mode or storage disabled: the theme still applies for
               this visit, it just will not be remembered. */
        }
    }

    function systemTheme() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    function metaColor(theme) {
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', theme === 'dark' ? '#0e1015' : '#f6f7fb');
        }
    }

    function apply(theme) {
        var next = theme === 'dark' ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        metaColor(next);
        return next;
    }

    var stored = read();
    apply(stored === 'dark' || stored === 'light' ? stored : systemTheme());

    window.CambricTheme = {
        key: KEY,
        get: function () {
            return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        },
        set: function (theme) {
            var next = apply(theme);
            write(next);
            return next;
        },
        toggle: function () {
            return this.set(this.get() === 'dark' ? 'light' : 'dark');
        }
    };
})();
