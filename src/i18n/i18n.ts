import { initializeTranslations } from '@/platform/translations';

import { getSystemLanguage, SUPPORTED_LANGUAGES } from './language';
import { translationResources } from './resources';

import '@formatjs/intl-getcanonicallocales/polyfill.js';

import '@formatjs/intl-locale/polyfill.js';

import '@formatjs/intl-pluralrules/polyfill.js';

import '@formatjs/intl-pluralrules/locale-data/en.js';
import '@formatjs/intl-pluralrules/locale-data/es.js';

import '@formatjs/intl-relativetimeformat/polyfill.js';

import '@formatjs/intl-relativetimeformat/locale-data/en.js';
import '@formatjs/intl-relativetimeformat/locale-data/es.js';

const resources = Object.fromEntries(
    Object.entries(translationResources).map(([language, translation]) => [
        language,
        {translation},
    ]),
);

initializeTranslations({
    resources,
    language: getSystemLanguage(),
    fallbackLanguage: 'en',
    supportedLanguages: SUPPORTED_LANGUAGES,
});
