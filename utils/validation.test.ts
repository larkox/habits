import {
    isValidMonthAndDay,
    normalizeRequiredText,
    parseBirthYear,
    parseLocalizedNumber,
    parsePositiveInteger,
} from '@/utils/validation';

describe('normalizeRequiredText', () => {
    test('normalizes required text', () => {
        expect(normalizeRequiredText('  Read  ')).toBe('Read');
        expect(normalizeRequiredText('   ')).toBeUndefined();
    });
});

describe('parseLocalizedNumber', () => {
    test.each([
        ['12', 12],
        [' -1.5 ', -1.5],
        ['+0,75', 0.75],
        ['.5', 0.5],
        [',5', 0.5],
    ])('parses the localized number %s', (input, expected) => {
        expect(parseLocalizedNumber(input)).toBe(expected);
    });

    test.each(['', '1,2.3', '1 000', 'Infinity', '1e3', '--1'])('rejects the localized number %s', input => {
        expect(parseLocalizedNumber(input)).toBeUndefined();
    });

    test('rejects a syntactically valid number that overflows', () => {
        expect(parseLocalizedNumber('9'.repeat(400))).toBeUndefined();
    });
});

describe('parsePositiveInteger', () => {
    test.each([
        ['1', 1],
        [' 42 ', 42],
    ])('parses the positive integer %s', (input, expected) => {
        expect(parsePositiveInteger(input)).toBe(expected);
    });

    test.each(['0', '-1', '+1', '1.5', '01', '9007199254740992'])('rejects the positive integer %s', input => {
        expect(parsePositiveInteger(input)).toBeUndefined();
    });
});

describe('parseBirthYear', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    test('accepts birth years up to the current year', () => {
        jest.useFakeTimers().setSystemTime(new Date(2026, 5, 15));
        expect(parseBirthYear('2026')).toBe(2026);
        expect(parseBirthYear('2027')).toBeUndefined();
        expect(parseBirthYear('0')).toBeUndefined();
    });
});

describe('isValidMonthAndDay', () => {
    test.each(['01-01', '02-29', '12-31'])('accepts the month and day %s', value => {
        expect(isValidMonthAndDay(value)).toBe(true);
    });

    test.each(['2-29', '02-30', '00-10', '13-01', '12-00', 'not-a-date'])('rejects the month and day %s', value => {
        expect(isValidMonthAndDay(value)).toBe(false);
    });
});
