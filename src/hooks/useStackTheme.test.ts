import { renderHook } from '@testing-library/react-native';

import useStackTheme from './useStackTheme';
import { useThemeColor } from './useThemeColor';

jest.mock('./useThemeColor', () => ({useThemeColor: jest.fn()}));

const mockedThemeColor = jest.mocked(useThemeColor);

describe('useStackTheme', () => {
    test('builds navigation styles from the active theme', async () => {
        const colors = {
            background: '#background',
            foreground: '#foreground',
            foregroundText: '#text',
        } as const;
        mockedThemeColor.mockImplementation(color => colors[color as keyof typeof colors]);

        const {result} = await renderHook(useStackTheme);

        expect(result.current).toEqual({
            contentStyle: {backgroundColor: '#background'},
            headerStyle: {backgroundColor: '#foreground'},
            headerTintColor: '#text',
            headerShadowVisible: false,
            headerTitleStyle: {color: '#text'},
        });
    });

    test('keeps the same options object while its colors do not change', async () => {
        mockedThemeColor.mockReturnValue('#same');
        const {result, rerender} = await renderHook(useStackTheme);
        const initial = result.current;

        await rerender(undefined);

        expect(result.current).toBe(initial);
    });
});
