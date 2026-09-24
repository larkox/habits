import { renderHook } from '@testing-library/react-native';
import { changeLanguage, init, use as registerPlugin } from 'i18next';
import { useTranslation } from 'react-i18next';

import { changeTranslationLanguage, getTranslationLanguage, initializeTranslations, useTranslate, useTranslationLanguage } from './translations';

jest.mock('i18next', () => ({
    __esModule: true,
    changeLanguage: jest.fn(),
    default: {
        resolvedLanguage: 'en',
    },
    init: jest.fn(),
    use: jest.fn(),
}));
jest.mock('react-i18next', () => ({
    initReactI18next: {type: '3rdParty'},
    useTranslation: jest.fn(),
}));

const mockedUseTranslation = jest.mocked(useTranslation);

beforeEach(() => {
    jest.clearAllMocks();
});

test('initializes the translation engine', () => {
    initializeTranslations({
        resources: {en: {translation: {title: 'Title'}}},
        language: 'en',
        fallbackLanguage: 'en',
        supportedLanguages: ['en', 'es'],
    });

    expect(registerPlugin).toHaveBeenCalledTimes(1);
    expect(init).toHaveBeenCalledWith(expect.objectContaining({
        fallbackLng: 'en',
        lng: 'en',
        supportedLngs: ['en', 'es'],
    }));
});

test('returns and changes the active translation language', () => {
    expect(getTranslationLanguage()).toBe('en');

    changeTranslationLanguage('es');

    expect(changeLanguage).toHaveBeenCalledWith('es');
});

test('returns the translation function', async () => {
    const translate = jest.fn();
    mockedUseTranslation.mockReturnValue({t: translate} as never);

    const { result } = await renderHook(() => useTranslate());

    expect(result.current).toBe(translate);
});

test.each([
    ['es', 'es'],
    ['fr', 'en'],
    [undefined, 'en'],
])('maps active language %s to supported language %s', async (resolvedLanguage, expected) => {
    mockedUseTranslation.mockReturnValue({i18n: {resolvedLanguage}} as never);

    const { result } = await renderHook(() => useTranslationLanguage());

    expect(result.current).toBe(expected);
});
