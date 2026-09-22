import { renderHook } from '@testing-library/react-native';

import { Colors } from '@/constants/Colors';

import { useColorScheme } from './useColorScheme';
import { useThemeColor } from './useThemeColor';

jest.mock('./useColorScheme', () => ({useColorScheme: jest.fn()}));

const mockedColorScheme = jest.mocked(useColorScheme);

describe('useThemeColor', () => {
    test('returns a light theme color', async () => {
        mockedColorScheme.mockReturnValue('light');

        const {result} = await renderHook(() => useThemeColor('background'));

        expect(result.current).toBe(Colors.light.background);
    });

    test('returns a dark theme color', async () => {
        mockedColorScheme.mockReturnValue('dark');

        const {result} = await renderHook(() => useThemeColor('background'));

        expect(result.current).toBe(Colors.dark.background);
    });

    test('uses the light theme when the system has no preference', async () => {
        mockedColorScheme.mockReturnValue(undefined as never);

        const {result} = await renderHook(() => useThemeColor('background'));

        expect(result.current).toBe(Colors.light.background);
    });

    test('returns undefined for a transparent color', async () => {
        mockedColorScheme.mockReturnValue('dark');

        const {result} = await renderHook(() => useThemeColor('transparent'));

        expect(result.current).toBeUndefined();
    });
});
