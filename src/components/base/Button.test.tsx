import { fireEvent, render } from '@testing-library/react-native';

import useSmartLoading from '@/hooks/useSmartLoading';
import { useThemeColor } from '@/hooks/useThemeColor';

import Button from './Button';

jest.mock('@/hooks/useSmartLoading', () => jest.fn());
jest.mock('@/hooks/useThemeColor', () => ({useThemeColor: jest.fn()}));
const mockedThemeColor = jest.mocked(useThemeColor);
beforeEach(() => {
    jest.clearAllMocks();
    mockedThemeColor.mockImplementation(color => `color-${color}`);
});
const mockedLoading = jest.mocked(useSmartLoading);
beforeEach(() => mockedLoading.mockReturnValue({isLoading: false, showLoader: false}));

describe('Button', () => {
    test('handles presses and exposes its enabled state', async () => {
        const onPress = jest.fn();
        const screen = await render(<Button
            text="Save"
            onPress={onPress}
        />);

        await fireEvent.press(screen.getByRole('button'));

        expect(onPress).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('button').props.accessibilityState).toEqual({disabled: false, busy: false});
    });

    test('disables interaction and displays the delayed loading indicator', async () => {
        mockedLoading.mockReturnValue({isLoading: true, showLoader: true});
        const onPress = jest.fn();
        const screen = await render(<Button
            text="Save"
            onPress={onPress}
            loading
        />);

        await fireEvent.press(screen.getByRole('button'));

        expect(onPress).not.toHaveBeenCalled();
        expect(screen.getByLabelText('loading')).toBeTruthy();
        expect(screen.getByRole('button').props.accessibilityState).toEqual({disabled: true, busy: true});
    });
});
