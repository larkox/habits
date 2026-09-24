import { renderHook } from '@testing-library/react-native';

import { useSystemLocales } from '@/platform/localization';
import { changeTranslationLanguage, getTranslationLanguage } from '@/platform/translations';

import useSystemLanguage from './useSystemLanguage';

jest.mock('./i18n', () => ({}));
jest.mock('@/platform/localization', () => ({
    useSystemLocales: jest.fn(),
}));
jest.mock('@/platform/translations', () => ({
    changeTranslationLanguage: jest.fn(),
    getTranslationLanguage: jest.fn(),
}));

const mockedUseSystemLocales = jest.mocked(useSystemLocales);
const mockedGetTranslationLanguage = jest.mocked(getTranslationLanguage);

beforeEach(() => {
    jest.clearAllMocks();
});

test('changes i18next to the system language', async () => {
    mockedUseSystemLocales.mockReturnValue([{languageCode: 'es'}]);
    mockedGetTranslationLanguage.mockReturnValue('en');

    await renderHook(() => useSystemLanguage());

    expect(changeTranslationLanguage).toHaveBeenCalledWith('es');
});

test('does not change i18next when it already uses the system language', async () => {
    mockedUseSystemLocales.mockReturnValue([{languageCode: 'en'}]);
    mockedGetTranslationLanguage.mockReturnValue('en');

    await renderHook(() => useSystemLanguage());

    expect(changeTranslationLanguage).not.toHaveBeenCalled();
});
