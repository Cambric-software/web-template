/*
 * Cambric web template behaviour.
 *
 * One file, no dependencies. It reads the identity from ./config.json, applies
 * the saved language, wires the theme toggle, reports connectivity, validates
 * the demo form and registers the service worker.
 *
 * The form validates locally and stops. Nothing is sent anywhere.
 */
(function () {
    'use strict';

    var STORAGE_LANGUAGE = 'cambric:language';
    var DEFAULT_LANGUAGE = 'en';

    var TEXT = {
        en: {
            'skip': 'Skip to content',
            'nav.home': 'Home',
            'nav.inside': "What's inside",
            'nav.components': 'Components',
            'nav.contact': 'Contact',
            'theme.dark': 'Dark',
            'theme.light': 'Light',
            'a11y.theme.dark': 'Switch to dark theme',
            'a11y.theme.light': 'Switch to light theme',
            'a11y.language.ar': 'Switch to Arabic',
            'a11y.language.en': 'Switch to English',
            'status.online': 'Online',
            'status.offline': 'Offline',
            'chip.static': 'Static',

            'hero.eyebrow': 'Cambric web template',
            'hero.lede': 'A calm, local-first foundation for Cambric websites. Static by default, bilingual, and one design system away from your product.',
            'hero.primary': "See what's inside",
            'hero.secondary': 'Component gallery',

            'inside.title': 'What you get',
            'inside.lede': 'Four decisions are already made, so a new site starts at the first product decision instead of at bootstrap.',
            'card.static.title': 'Static by default',
            'card.static.body': 'Plain HTML, CSS and JavaScript. No framework, no build step required to open it, and no runtime dependency.',
            'card.local.title': 'Local-first',
            'card.local.body': 'Settings live in this browser, the service worker keeps the shell available offline, and nothing is sent anywhere.',
            'card.bilingual.title': 'Bilingual',
            'card.bilingual.body': 'English and Arabic, including right-to-left layout, with the choice remembered between visits.',
            'card.design.title': 'One design',
            'card.design.body': 'The same palette, radii and component shapes as the Cambric app and download pages.',

            'how.title': 'How it works',
            'how.lede': 'Three edits turn the template into a product site.',
            'how.one.title': 'Set the identity',
            'how.one.body': 'Edit <code>index/config.json</code> and <code>cambric.manifest.json</code>: name, id, version, description.',
            'how.two.title': 'Replace the copy',
            'how.two.body': 'Rewrite the hero, the four cards and the contact section. Keep the structure and tokens.',
            'how.three.title': 'Deploy <code>dist/</code>',
            'how.three.body': 'Run <code>npm run build</code> and publish the output to any static host. The included workflow can deploy to GitHub Pages.',

            'components.title': 'The pieces are documented',
            'components.body': 'Buttons, cards, chips, status, form fields and empty states are on one page, so a new screen starts from a known component instead of a new one.',
            'components.action': 'Open the gallery',

            'contact.eyebrow': 'Contact form',
            'contact.title': 'Validation that works without a server',
            'contact.body': 'This form checks the fields in the browser and stops. It does not send anything and does not pretend to. Wire it to your own endpoint when the product is ready.',

            'form.name': 'Name',
            'form.email': 'Email',
            'form.message': 'Message',
            'form.submit': 'Validate message',
            'form.valid': 'Validation passed. Nothing was sent.',
            'form.invalid': 'Please check the highlighted fields.',
            'name.short': 'Enter at least two characters.',
            'email.invalid': 'Enter a valid email address.',
            'message.short': 'Write at least ten characters.',

            'gallery.eyebrow': 'Component gallery',
            'gallery.title': 'Useful pieces, already consistent.',
            'gallery.lede': 'Every control on this page is defined in <code>index/css/main.css</code>. Copy the markup, keep the classes, and the result matches the rest of the site.',
            'gallery.actions': 'Actions',
            'gallery.actions.lede': 'A button says what happens. A disabled button explains why it cannot be pressed.',
            'gallery.primary': 'Primary action',
            'gallery.secondary': 'Secondary action',
            'gallery.ghost': 'Quiet action',
            'gallery.disabled': 'Unavailable',
            'gallery.disabled.reason': 'Unavailable is disabled because this gallery has no destination for it. A disabled control without a reason is a bug.',
            'gallery.link': 'A text link back to the site',
            'gallery.cards': 'Cards and numbers',
            'gallery.card.label': 'Default card',
            'gallery.card.title': 'One idea per card',
            'gallery.card.body': 'Opaque surface, one-pixel border, radius 14. If it needs two headings, it is two cards.',
            'gallery.stat.label': 'Large value',
            'gallery.stat.body': 'Numbers use tabular figures so they do not shift when the value changes.',
            'gallery.status': 'Status and chips',
            'gallery.status.lede': 'Colour is never the only signal. Every status also has a word.',
            'gallery.form': 'Form fields',
            'gallery.form.lede': 'Labels are visible, errors sit next to the field, and the invalid state has text as well as colour.',
            'gallery.form.hint': 'A hint explains the expected value; it is not an error.',
            'gallery.form.button': 'A form button',
            'gallery.empty': 'Empty state',
            'gallery.empty.title': 'Nothing here yet',
            'gallery.empty.body': 'Say what would appear here and how to make it appear. Do not leave a blank panel.',
            'gallery.empty.action': 'Back to the site',

            'footer.licence': 'MIT licence',
            'footer.security': 'Security',
            'footer.source': 'Source'
        },
        ar: {
            'skip': 'انتقل إلى المحتوى',
            'nav.home': 'الرئيسية',
            'nav.inside': 'ما يتضمنه',
            'nav.components': 'المكوّنات',
            'nav.contact': 'تواصل',
            'theme.dark': 'داكن',
            'theme.light': 'فاتح',
            'a11y.theme.dark': 'التبديل إلى الوضع الداكن',
            'a11y.theme.light': 'التبديل إلى الوضع الفاتح',
            'a11y.language.ar': 'التبديل إلى العربية',
            'a11y.language.en': 'التبديل إلى الإنجليزية',
            'status.online': 'متصل',
            'status.offline': 'غير متصل',
            'chip.static': 'ثابت',

            'hero.eyebrow': 'قالب ويب من كامبريك',
            'hero.lede': 'أساس هادئ يعمل محليًا لمواقع كامبريك. ثابت افتراضيًا، ثنائي اللغة، وعلى بعد نظام تصميم واحد من منتجك.',
            'hero.primary': 'ما يتضمنه القالب',
            'hero.secondary': 'معرض المكوّنات',

            'inside.title': 'ما تحصل عليه',
            'inside.lede': 'أربعة قرارات جاهزة، ليبدأ الموقع الجديد من أول قرار يخص المنتج بدلًا من البداية.',
            'card.static.title': 'ثابت افتراضيًا',
            'card.static.body': 'HTML وCSS وJavaScript فقط. بلا إطار عمل، وبلا خطوة بناء لفتحه، وبلا اعتماد وقت التشغيل.',
            'card.local.title': 'يعمل محليًا أولًا',
            'card.local.body': 'الإعدادات تبقى في هذا المتصفح، ويحتفظ عامل الخدمة بالهيكل دون اتصال، ولا يُرسل أي شيء إلى أي مكان.',
            'card.bilingual.title': 'ثنائي اللغة',
            'card.bilingual.body': 'الإنجليزية والعربية، بما في ذلك التخطيط من اليمين إلى اليسار، مع تذكّر الاختيار بين الزيارات.',
            'card.design.title': 'تصميم واحد',
            'card.design.body': 'نفس الألوان وأنصاف الأقطار وأشكال المكوّنات المستخدمة في تطبيقات كامبريك وصفحات التنزيل.',

            'how.title': 'كيف يعمل',
            'how.lede': 'ثلاث تعديلات تحوّل القالب إلى موقع منتج.',
            'how.one.title': 'حدّد الهوية',
            'how.one.body': 'عدّل <code>index/config.json</code> و<code>cambric.manifest.json</code>: الاسم والمعرّف والإصدار والوصف.',
            'how.two.title': 'استبدل النصوص',
            'how.two.body': 'أعد كتابة المقدمة والبطاقات الأربع وقسم التواصل. أبقِ الهيكل والرموز.',
            'how.three.title': 'انشر <code>dist/</code>',
            'how.three.body': 'شغّل <code>npm run build</code> وانشر الناتج على أي استضافة ثابتة. سير العمل المرفق يمكنه النشر على GitHub Pages.',

            'components.title': 'المكوّنات موثّقة',
            'components.body': 'الأزرار والبطاقات والشرائح والحالات وحقول النماذج والحالات الفارغة في صفحة واحدة، ليبدأ أي شاشة جديدة من مكوّن معروف.',
            'components.action': 'افتح المعرض',

            'contact.eyebrow': 'نموذج التواصل',
            'contact.title': 'تحقّق يعمل دون خادم',
            'contact.body': 'يتحقق هذا النموذج من الحقول في المتصفح ثم يتوقف. لا يرسل شيئًا ولا يدّعي ذلك. اربطه بنقطتك الخاصة عندما يصبح المنتج جاهزًا.',

            'form.name': 'الاسم',
            'form.email': 'البريد الإلكتروني',
            'form.message': 'الرسالة',
            'form.submit': 'تحقّق من الرسالة',
            'form.valid': 'نجح التحقق. لم يُرسل شيء.',
            'form.invalid': 'تحقّق من الحقول المميّزة.',
            'name.short': 'أدخل اسمًا من حرفين على الأقل.',
            'email.invalid': 'أدخل بريدًا إلكترونيًا صالحًا.',
            'message.short': 'اكتب 10 أحرف على الأقل.',

            'gallery.eyebrow': 'معرض المكوّنات',
            'gallery.title': 'عناصر مفيدة ومتناسقة.',
            'gallery.lede': 'كل عنصر تحكم في هذه الصفحة معرّف في <code>index/css/main.css</code>. انسخ الترميز واحتفظ بالأصناف، وستطابق النتيجة بقية الموقع.',
            'gallery.actions': 'الإجراءات',
            'gallery.actions.lede': 'الزر يقول ما سيحدث. والزر المعطّل يشرح سبب تعذّر الضغط عليه.',
            'gallery.primary': 'إجراء أساسي',
            'gallery.secondary': 'إجراء ثانوي',
            'gallery.ghost': 'إجراء هادئ',
            'gallery.disabled': 'غير متاح',
            'gallery.disabled.reason': 'غير متاح معطّل لأن هذا المعرض لا يملك وجهة له. الزر المعطّل بلا سبب خطأ.',
            'gallery.link': 'رابط نصي يعود إلى الموقع',
            'gallery.cards': 'البطاقات والأرقام',
            'gallery.card.label': 'بطاقة افتراضية',
            'gallery.card.title': 'فكرة واحدة لكل بطاقة',
            'gallery.card.body': 'سطح معتم، حد بسماكة بكسل واحد، ونصف قطر 14. إن احتاجت عنوانين فهي بطاقتان.',
            'gallery.stat.label': 'قيمة كبيرة',
            'gallery.stat.body': 'الأرقام تستخدم أرقامًا جدولية حتى لا تتحرك عند تغيّر القيمة.',
            'gallery.status': 'الحالة والشرائح',
            'gallery.status.lede': 'اللون ليس الإشارة الوحيدة. كل حالة تحمل كلمة أيضًا.',
            'gallery.form': 'حقول النموذج',
            'gallery.form.lede': 'التسميات ظاهرة، والأخطاء بجوار الحقل، وحالة الخطأ تحمل نصًا لا لونًا فقط.',
            'gallery.form.hint': 'التلميح يشرح القيمة المتوقعة، وليس خطأً.',
            'gallery.form.button': 'زر نموذج',
            'gallery.empty': 'الحالة الفارغة',
            'gallery.empty.title': 'لا شيء هنا بعد',
            'gallery.empty.body': 'اذكر ما سيظهر هنا وكيف يظهر. لا تترك لوحة فارغة.',
            'gallery.empty.action': 'العودة إلى الموقع',

            'footer.licence': 'ترخيص MIT',
            'footer.security': 'الأمان',
            'footer.source': 'المصدر'
        }
    };

    var html = document.documentElement;
    var language = DEFAULT_LANGUAGE;
    var online = navigator.onLine;

    function read(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    function write(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch (error) {
            /* The choice applies for this visit but will not be remembered. */
        }
    }

    function translate(key) {
        var table = TEXT[language] || TEXT.en;
        return Object.prototype.hasOwnProperty.call(table, key)
            ? table[key]
            : (TEXT.en[key] || '');
    }

    function setTranslated(element, key) {
        var value = translate(key);
        element.setAttribute('data-i18n', key);
        element.innerHTML = value;
    }

    function updateThemeButton() {
        var theme = window.CambricTheme ? window.CambricTheme.get() : 'light';
        document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
            var label = button.querySelector('.theme-label');
            button.setAttribute('aria-pressed', String(theme === 'dark'));
            button.setAttribute('aria-label', translate(theme === 'dark' ? 'a11y.theme.light' : 'a11y.theme.dark'));
            if (label) {
                label.textContent = translate(theme === 'dark' ? 'theme.light' : 'theme.dark');
            }
        });
    }

    function updateLanguageButton() {
        document.querySelectorAll('[data-language-toggle]').forEach(function (button) {
            button.textContent = language === 'ar' ? 'English' : 'العربية';
            button.setAttribute('aria-label', translate(language === 'ar' ? 'a11y.language.en' : 'a11y.language.ar'));
        });
    }

    function updateConnectivity() {
        var status = document.querySelector('[data-connectivity]');
        if (!status) {
            return;
        }
        status.setAttribute('data-state', online ? 'online' : 'offline');
        var label = status.querySelector('[data-connectivity-label]');
        if (label) {
            label.textContent = translate(online ? 'status.online' : 'status.offline');
        }
    }

    function applyLanguage(next) {
        language = next === 'ar' ? 'ar' : 'en';
        html.setAttribute('lang', language);
        html.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
        write(STORAGE_LANGUAGE, language);

        document.querySelectorAll('[data-i18n]').forEach(function (element) {
            var key = element.getAttribute('data-i18n');
            var value = translate(key);
            if (value) {
                element.innerHTML = value;
            }
        });

        updateThemeButton();
        updateLanguageButton();
        updateConnectivity();
    }

    function bindTheme() {
        document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
            button.addEventListener('click', function () {
                if (window.CambricTheme) {
                    window.CambricTheme.toggle();
                    updateThemeButton();
                }
            });
        });
        updateThemeButton();
    }

    function bindLanguage() {
        document.querySelectorAll('[data-language-toggle]').forEach(function (button) {
            button.addEventListener('click', function () {
                applyLanguage(language === 'ar' ? 'en' : 'ar');
            });
        });
        updateLanguageButton();
    }

    function bindConnectivity() {
        window.addEventListener('online', function () {
            online = true;
            updateConnectivity();
        });
        window.addEventListener('offline', function () {
            online = false;
            updateConnectivity();
        });
        updateConnectivity();
    }

    function validate(values) {
        var errors = {};
        if ((values.name || '').trim().length < 2) {
            errors.name = translate('name.short');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((values.email || '').trim())) {
            errors.email = translate('email.invalid');
        }
        if ((values.message || '').trim().length < 10) {
            errors.message = translate('message.short');
        }
        return errors;
    }

    function bindForm() {
        var form = document.querySelector('[data-contact-form]');
        if (!form) {
            return;
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var values = {
                name: form.elements.name ? form.elements.name.value : '',
                email: form.elements.email ? form.elements.email.value : '',
                message: form.elements.message ? form.elements.message.value : ''
            };
            var errors = validate(values);
            var keys = Object.keys(errors);
            var firstInvalid = null;

            ['name', 'email', 'message'].forEach(function (name) {
                var field = form.elements[name];
                var errorNode = form.querySelector('[data-error-for="' + name + '"]');
                var message = errors[name] || '';
                if (field) {
                    field.setAttribute('aria-invalid', String(Boolean(message)));
                }
                if (errorNode) {
                    errorNode.textContent = message;
                    errorNode.removeAttribute('data-i18n');
                }
                if (message && !firstInvalid) {
                    firstInvalid = field;
                }
            });

            var status = form.querySelector('[data-form-status]');
            if (status) {
                setTranslated(status, keys.length === 0 ? 'form.valid' : 'form.invalid');
                status.setAttribute('data-state', keys.length === 0 ? 'success' : 'error');
            }

            if (firstInvalid) {
                firstInvalid.focus();
            }
        });
    }

    function loadIdentity() {
        fetch('./config.json', { cache: 'no-store' })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Config request failed: ' + response.status);
                }
                return response.json();
            })
            .then(function (config) {
                var product = config.product || {};
                var version = product.version || '';
                document.querySelectorAll('[data-version]').forEach(function (element) {
                    element.textContent = version ? 'v' + version : 'unknown';
                });

                var name = document.getElementById('product-name');
                if (name && product.name) {
                    name.textContent = product.name;
                    document.title = product.name;
                }

                var description = document.querySelector('meta[name="description"]');
                if (description && product.description) {
                    description.setAttribute('content', product.description);
                }
            })
            .catch(function () {
                document.querySelectorAll('[data-version]').forEach(function (element) {
                    element.textContent = 'unknown';
                });
            });
    }

    function registerServiceWorker() {
        if (!('serviceWorker' in navigator) || !/^https?:$/.test(window.location.protocol)) {
            return;
        }
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('./service-worker.js').catch(function () {
                /* The site still works online; offline caching is unavailable. */
            });
        });
    }

    function setYear() {
        document.querySelectorAll('[data-year]').forEach(function (element) {
            element.textContent = String(new Date().getFullYear());
        });
    }

    var storedLanguage = read(STORAGE_LANGUAGE);
    applyLanguage(storedLanguage === 'ar' ? 'ar' : DEFAULT_LANGUAGE);

    bindTheme();
    bindLanguage();
    bindConnectivity();
    bindForm();
    loadIdentity();
    registerServiceWorker();
    setYear();
})();
