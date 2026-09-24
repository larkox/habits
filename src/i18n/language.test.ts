import { getSupportedLanguage, getSystemLanguage } from './language';

describe('getSupportedLanguage', () => {
    it('returns a supported language', () => {
        expect(getSupportedLanguage('es')).toBe('es');
    });

    it('falls back to the default language', () => {
        expect(getSupportedLanguage('fr')).toBe('en');
    });
});

describe('getSystemLanguage', () => {
    it('uses Spanish when the system reports the Spanish language code', () => {
        expect(getSystemLanguage([{ languageCode: 'es' }])).toBe('es');
    });

    it('uses English when the system reports the English language code', () => {
        expect(getSystemLanguage([{ languageCode: 'en' }])).toBe('en');
    });

    it('uses the first supported language in the system preference order', () => {
        expect(getSystemLanguage([
            { languageCode: 'fr' },
            { languageCode: 'es' },
            { languageCode: 'en' },
        ])).toBe('es');
    });

    it('falls back to English when no system language is supported', () => {
        expect(getSystemLanguage([
            { languageCode: 'fr' },
            { languageCode: null },
        ])).toBe('en');
    });
});
