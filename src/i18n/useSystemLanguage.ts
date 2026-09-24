import { useEffect } from 'react';

import { useSystemLocales } from '@/platform/localization';
import { changeTranslationLanguage, getTranslationLanguage } from '@/platform/translations';

import { getSystemLanguage } from './language';

import './i18n';

export default function useSystemLanguage() {
    const locales = useSystemLocales();
    const language = getSystemLanguage(locales);

    useEffect(() => {
        if (getTranslationLanguage() !== language) {
            changeTranslationLanguage(language);
        }
    }, [language]);
}
