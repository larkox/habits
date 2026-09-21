import type { ChartValue } from '@/types/model';
import { getChartValueForToday } from '@/utils/charts';

function chartValue(id: string, value: number, date: number): ChartValue {
    return {id, chartId: 'chart', value, date};
}

describe('getChartValueForToday', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    test('returns undefined without values', () => {
        expect(getChartValueForToday(undefined)).toBeUndefined();
        expect(getChartValueForToday([])).toBeUndefined();
    });

    test('returns undefined for a sparse values array', () => {
        expect(getChartValueForToday(new Array<ChartValue>(1))).toBeUndefined();
    });

    test('returns the final value when it belongs to today', () => {
        jest.useFakeTimers().setSystemTime(new Date(2026, 8, 21, 12));
        const today = new Date(2026, 8, 21).getTime();
        const values = [chartValue('old', 1, new Date(2026, 8, 20).getTime()), chartValue('today', 2, today)];
        expect(getChartValueForToday(values)).toEqual(values[1]);
    });

    test('returns undefined when the final value is not from today', () => {
        jest.useFakeTimers().setSystemTime(new Date(2026, 8, 21, 12));
        const values = [chartValue('old', 1, new Date(2026, 8, 20).getTime())];
        expect(getChartValueForToday(values)).toBeUndefined();
    });
});
