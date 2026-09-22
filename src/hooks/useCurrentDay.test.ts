import { AppState, AppStateStatus } from 'react-native';

import { act, renderHook } from '@testing-library/react-native';

import { getStartOfDay } from '@/utils/time';

import useCurrentDay from './useCurrentDay';

jest.mock('@/utils/time', () => ({getStartOfDay: jest.fn()}));

const mockedStartOfDay = jest.mocked(getStartOfDay);
let appStateListener: ((state: AppStateStatus) => void) | undefined;
const removeSubscription = jest.fn();

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 8, 21, 12));
    jest.clearAllMocks();
    appStateListener = undefined;
    mockedStartOfDay.mockReturnValue(1000);
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
        appStateListener = listener;
        return {remove: removeSubscription};
    });
});

afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
});

describe('useCurrentDay', () => {
    test('refreshes the day when the app becomes active', async () => {
        const {result} = await renderHook(useCurrentDay);
        mockedStartOfDay.mockReturnValue(2000);

        await act(async () => {
            appStateListener?.('background');
        });
        expect(result.current).toBe(1000);

        await act(async () => {
            appStateListener?.('active');
        });
        expect(result.current).toBe(2000);
    });

    test('refreshes at the next local midnight', async () => {
        jest.setSystemTime(new Date(2026, 8, 21, 23, 59, 59, 500));
        const {result} = await renderHook(useCurrentDay);
        mockedStartOfDay.mockReturnValue(2000);

        await act(async () => {
            await jest.advanceTimersByTimeAsync(499);
        });
        expect(result.current).toBe(1000);

        await act(async () => {
            await jest.advanceTimersByTimeAsync(1);
        });
        expect(result.current).toBe(2000);
    });

    test('removes its listener and timer when unmounted', async () => {
        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
        const {unmount} = await renderHook(useCurrentDay);

        await act(() => {
            unmount();
        });

        expect(removeSubscription).toHaveBeenCalledTimes(1);
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });
});
