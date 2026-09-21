import {
    getDue,
    getLocalDateTimestamp,
    getMonthAndDay,
    getMonthAndDayTimestamp,
    getMonthEnd,
    getMonthStart,
    getNextMonthAndDay,
    getStartOfDay,
    getYesterday,
    isDone,
    toDateString,
} from '@/utils/time';

function localDate(year: number, month: number, day: number) {
    return new Date(year, month - 1, day).getTime();
}

afterEach(() => {
    jest.useRealTimers();
});

describe('getStartOfDay', () => {
    test('returns the start of the current local day', () => {
        jest.useFakeTimers().setSystemTime(new Date(2026, 8, 21, 18, 30));
        expect(getStartOfDay()).toBe(localDate(2026, 9, 21));
    });
});

describe('getLocalDateTimestamp', () => {
    test('creates a timestamp from a local calendar date', () => {
        expect(getLocalDateTimestamp({year: 2024, month: 2, day: 29})).toBe(localDate(2024, 2, 29));
    });
});

describe('getYesterday', () => {
    test('returns the previous local calendar day', () => {
        jest.useFakeTimers().setSystemTime(new Date(2026, 0, 10, 12));
        expect(getYesterday()).toBe(localDate(2026, 1, 9));
    });
});

describe('getDue', () => {
    test('calculates the number of days until a habit is due', () => {
        jest.useFakeTimers().setSystemTime(new Date(2026, 0, 10, 12));
        expect(getDue(localDate(2026, 1, 8), 5)).toBe(3);
    });
});

describe('isDone', () => {
    test('reports whether a habit was completed today', () => {
        jest.useFakeTimers().setSystemTime(new Date(2026, 0, 10, 12));
        expect(isDone(localDate(2026, 1, 10))).toBe(true);
        expect(isDone(localDate(2026, 1, 9))).toBe(false);
    });
});

describe('getMonthStart', () => {
    test('returns the first day of the current or supplied month', () => {
        jest.useFakeTimers().setSystemTime(new Date(2026, 11, 15));
        expect(getMonthStart()).toBe(localDate(2026, 12, 1));
        expect(getMonthStart({year: 2024, month: 2, day: 20})).toBe(localDate(2024, 2, 1));
    });
});

describe('getMonthEnd', () => {
    test('returns the start of the next month across a year boundary', () => {
        expect(getMonthEnd(localDate(2026, 12, 1))).toBe(localDate(2027, 1, 1));
    });
});

describe('toDateString', () => {
    test('formats a timestamp as a local ISO calendar date', () => {
        const timestamp = localDate(2026, 3, 7);
        expect(toDateString(timestamp)).toBe('2026-03-07');
    });
});

describe('getMonthAndDay', () => {
    test('formats a timestamp as a local month and day', () => {
        const timestamp = localDate(2026, 3, 7);
        expect(getMonthAndDay(timestamp)).toBe('03-07');
    });
});

describe('getMonthAndDayTimestamp', () => {
    test('maps a month and day into the current year', () => {
        jest.useFakeTimers().setSystemTime(new Date(2026, 0, 10));
        expect(getMonthAndDayTimestamp('12-25')).toBe(localDate(2026, 12, 25));
        expect(getMonthAndDayTimestamp('invalid')).toBe(localDate(2026, 1, 10));
    });

    test('maps February 29 to the next leap year', () => {
        jest.useFakeTimers().setSystemTime(new Date(2025, 0, 10));
        expect(getMonthAndDayTimestamp('02-29')).toBe(localDate(2028, 2, 29));
    });
});

describe('getNextMonthAndDay', () => {
    test('returns this year occurrence when it is today or upcoming', () => {
        const today = localDate(2026, 6, 15);
        expect(getNextMonthAndDay('06-15', today)).toBe(today);
        expect(getNextMonthAndDay('06-20', today)).toBe(localDate(2026, 6, 20));
    });

    test('returns next year occurrence when this year has passed', () => {
        expect(getNextMonthAndDay('01-05', localDate(2026, 6, 15))).toBe(localDate(2027, 1, 5));
    });

    test('observes February 29 birthdays on February 28 in non-leap years', () => {
        expect(getNextMonthAndDay('02-29', localDate(2027, 1, 1))).toBe(localDate(2027, 2, 28));
    });

    test('uses today for an invalid month and day', () => {
        jest.useFakeTimers().setSystemTime(new Date(2026, 0, 10, 12));
        expect(getNextMonthAndDay('invalid')).toBe(localDate(2026, 1, 10));
    });
});
