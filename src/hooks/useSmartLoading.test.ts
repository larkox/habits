import { act, renderHook } from '@testing-library/react-native';

import useSmartLoading from './useSmartLoading';

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
});

afterEach(() => {
    jest.useRealTimers();
});

describe('useSmartLoading', () => {
    test('does not show the loader when loading finishes within 500ms', async () => {
        const {result, rerender} = await renderHook(
            ({loading}: {loading: boolean}) => useSmartLoading(loading),
            {initialProps: {loading: true}},
        );

        await act(async () => {
            await jest.advanceTimersByTimeAsync(499);
        });
        expect(result.current).toEqual({isLoading: true, showLoader: false});

        await rerender({loading: false});
        await act(async () => {
            await jest.runAllTimersAsync();
        });

        expect(result.current).toEqual({isLoading: false, showLoader: false});
    });

    test('shows the loader after 500ms', async () => {
        const {result} = await renderHook(() => useSmartLoading(true));

        await act(async () => {
            await jest.advanceTimersByTimeAsync(500);
        });

        expect(result.current).toEqual({isLoading: true, showLoader: true});
    });

    test('keeps a visible loader on screen for at least one second', async () => {
        const {result, rerender} = await renderHook(
            ({loading}: {loading: boolean}) => useSmartLoading(loading),
            {initialProps: {loading: true}},
        );

        await act(async () => {
            await jest.advanceTimersByTimeAsync(500);
        });
        await rerender({loading: false});

        await act(async () => {
            await jest.advanceTimersByTimeAsync(999);
        });
        expect(result.current).toEqual({isLoading: true, showLoader: true});

        await act(async () => {
            await jest.advanceTimersByTimeAsync(1);
        });
        expect(result.current).toEqual({isLoading: false, showLoader: false});
    });
});
