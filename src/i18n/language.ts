import { getSystemLocales, type SystemLocale } from '@/platform/localization';

export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

function isSupportedLanguage(language: string | null): language is SupportedLanguage {
    return SUPPORTED_LANGUAGES.some((supportedLanguage) => supportedLanguage === language);
}

export function getSupportedLanguage(language: string | null | undefined): SupportedLanguage {
    const normalizedLanguage = language ?? null;
    return isSupportedLanguage(normalizedLanguage) ? normalizedLanguage : DEFAULT_LANGUAGE;
}

export function getSystemLanguage(locales: SystemLocale[] = getSystemLocales()): SupportedLanguage {
    for (const { languageCode } of locales) {
        if (isSupportedLanguage(languageCode)) {
            return languageCode;
        }
    }

    return DEFAULT_LANGUAGE;
}
