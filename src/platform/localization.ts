import { getLocales, useCalendars, useLocales } from 'expo-localization';

export type SystemLocale = {
    languageCode: string | null;
};

export type SystemCalendarSettings = {
    /** First day of the week, where Sunday is 0 and Saturday is 6. */
    firstDayOfWeek: number;
};

function toSystemLocales(locales: ReturnType<typeof getLocales>): SystemLocale[] {
    return locales.map(({ languageCode }) => ({languageCode}));
}

export function getSystemLocales(): SystemLocale[] {
    return toSystemLocales(getLocales());
}

export function useSystemLocales(): SystemLocale[] {
    return toSystemLocales(useLocales());
}

export function useSystemCalendarSettings(): SystemCalendarSettings {
    const [calendar] = useCalendars();

    return {
        firstDayOfWeek: calendar.firstWeekday === null ? 0 : calendar.firstWeekday - 1,
    };
}
