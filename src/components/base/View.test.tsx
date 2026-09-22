import { StyleSheet } from 'react-native';

import { render } from '@testing-library/react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

import View from './View';

jest.mock('@/hooks/useThemeColor', () => ({useThemeColor: jest.fn()}));
const mockedThemeColor = jest.mocked(useThemeColor);
beforeEach(() => {
    jest.clearAllMocks();
    mockedThemeColor.mockImplementation(color => color === 'transparent' ? undefined : `color-${color}`);
});

describe('View', () => {
    test('renders a button border with the themed background', async () => {
        const screen = await render(<View
            testID="view"
            color="button"
            border="button"
        />);

        expect(screen.getByTestId('view')).toHaveStyle({
            backgroundColor: 'color-button',
            borderColor: 'color-buttonBorder',
            borderWidth: 1,
            borderRadius: 8,
            padding: 8,
        });
    });

    test('renders a card border with the themed background', async () => {
        const screen = await render(<View
            testID="view"
            color="foreground"
            border="view"
        />);

        expect(screen.getByTestId('view')).toHaveStyle({
            backgroundColor: 'color-foreground',
            borderColor: 'color-buttonBorder',
            borderWidth: 1,
            borderRadius: 8,
            padding: 8,
        });
    });

    test('renders without a border when none is requested', async () => {
        const screen = await render(<View testID="view"/>);
        const style = StyleSheet.flatten(screen.getByTestId('view').props.style);

        expect(style).toEqual(expect.objectContaining({
            backgroundColor: undefined,
            borderColor: undefined,
            borderWidth: undefined,
            borderRadius: undefined,
            padding: 8,
        }));
    });
});
