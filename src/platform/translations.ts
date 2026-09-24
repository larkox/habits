import i18next, { changeLanguage, init, use as registerPlugin } from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

import { getSupportedLanguage, type SupportedLanguage } from '@/i18n/language';

type TranslationResources = Record<string, {
    translation: Record<string, unknown>;
}>;

type InitializeTranslationsOptions = {
    fallbackLanguage: SupportedLanguage;
    language: SupportedLanguage;
    resources: TranslationResources;
    supportedLanguages: readonly SupportedLanguage[];
};

export function initializeTranslations({
    fallbackLanguage,
    language,
    resources,
    supportedLanguages,
}: InitializeTranslationsOptions) {
    registerPlugin(initReactI18next);
    void init({
        resources,
        lng: language,
        fallbackLng: fallbackLanguage,
        supportedLngs: supportedLanguages,
        interpolation: {
            escapeValue: false,
        },
        cleanCode: true,
        ns: ['translation'],
        defaultNS: 'translation',
        compatibilityJSON: 'v4',
    });
}

export function getTranslationLanguage(): SupportedLanguage {
    return getSupportedLanguage(i18next.resolvedLanguage);
}

export function changeTranslationLanguage(language: SupportedLanguage) {
    void changeLanguage(language);
}

export function useTranslate() {
    return useTranslation().t;
}

export function useTranslationLanguage() {
    return getSupportedLanguage(useTranslation().i18n.resolvedLanguage);
}
