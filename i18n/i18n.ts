import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from './en/translation.json';
import translationEs from './es/translation.json';

import '@formatjs/intl-getcanonicallocales/polyfill.js';

import '@formatjs/intl-locale/polyfill.js';

import '@formatjs/intl-pluralrules/polyfill.js';

import '@formatjs/intl-pluralrules/locale-data/en.js';
import '@formatjs/intl-pluralrules/locale-data/es.js';

import '@formatjs/intl-relativetimeformat/polyfill.js';

import '@formatjs/intl-relativetimeformat/locale-data/en.js';
import '@formatjs/intl-relativetimeformat/locale-data/es.js';

const resources = {
    en: {
        translation: translationEn,
    },
    es: {
        translation: translationEs,
    },
};

i18next
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        supportedLngs: ['en', 'es'],
        interpolation: {
            escapeValue: false,
        },
        cleanCode: true,
        ns: ['translation'],
        defaultNS: 'translation',
        compatibilityJSON: 'v4',
    })
    .then();

export default i18next;
