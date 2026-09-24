import { renderHook } from '@testing-library/react-native';
import * as Localization from 'expo-localization';

import { getSystemLocales, useSystemCalendarSettings, useSystemLocales } from './localization';

jest.mock('expo-localization', () => ({
    getLocales: jest.fn(),
    useCalendars: jest.fn(),
    useLocales: jest.fn(),
}));

const mockedGetLocales = jest.mocked(Localization.getLocales);
const mockedUseCalendars = jest.mocked(Localization.useCalendars);
const mockedUseLocales = jest.mocked(Localization.useLocales);

describe('getSystemLocales', () => {
    test('reduces regional Expo locales to the language codes needed by the app', () => {
        mockedGetLocales.mockReturnValue([
            {languageCode: 'es', languageTag: 'es-ES'},
            {languageCode: 'en', languageTag: 'en-US'},
        ] as never);

        expect(getSystemLocales()).toEqual([
            {languageCode: 'es'},
            {languageCode: 'en'},
        ]);
    });
});

describe('useSystemLocales', () => {
    test('returns only the language information needed by the app', async () => {
        mockedUseLocales.mockReturnValue([
            {languageCode: 'es', languageTag: 'es-ES'},
        ] as never);

        const { result } = await renderHook(() => useSystemLocales());

        expect(result.current).toEqual([{languageCode: 'es'}]);
    });
});

describe('useSystemCalendarSettings', () => {
    test.each([
        [1, 0],
        [2, 1],
        [7, 6],
        [null, 0],
    ])('maps Expo weekday %s to calendar weekday %s', async (firstWeekday, expected) => {
        mockedUseCalendars.mockReturnValue([{firstWeekday}] as never);

        const { result } = await renderHook(() => useSystemCalendarSettings());

        expect(result.current.firstDayOfWeek).toBe(expected);
    });
});
