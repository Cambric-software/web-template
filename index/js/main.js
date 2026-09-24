'use strict';

document.documentElement.classList.add('js-enabled');

const CambricWeb = {
    ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    },

    qs(selector, parent = document) {
        return parent.querySelector(selector);
    },

    qsa(selector, parent = document) {
        return [...parent.querySelectorAll(selector)];
    }
};

CambricWeb.ready(() => {
    // Product-specific JavaScript belongs here.
});
