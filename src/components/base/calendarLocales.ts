import { LocaleConfig } from 'react-native-calendars';

import type { SupportedLanguage } from '@/i18n/language';
import { translationResources } from '@/i18n/resources';

Object.entries(translationResources).forEach(([language, translation]) => {
    LocaleConfig.locales[language] = translation.calendar;
});

export function setCalendarLanguage(language: SupportedLanguage) {
    LocaleConfig.defaultLocale = language;
}
