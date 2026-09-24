import translationEn from './en/translation.json';
import translationEs from './es/translation.json';
import type { SupportedLanguage } from './language';

export const translationResources = {
    en: translationEn,
    es: translationEs,
} satisfies Record<SupportedLanguage, typeof translationEn>;
