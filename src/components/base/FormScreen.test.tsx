import { Keyboard, Platform, Text } from 'react-native';

import { act, render } from '@testing-library/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FormScreen from './FormScreen';

jest.mock('react-native-safe-area-context', () => ({useSafeAreaInsets: jest.fn()}));

beforeEach(() => {
    jest.mocked(useSafeAreaInsets).mockReturnValue({top: 0, right: 0, bottom: 24, left: 0});
});

test('keeps form content scrollable above the keyboard and bottom system area', async () => {
    const screen = await render(<FormScreen><Text>Form content</Text></FormScreen>);

    expect(screen.getByText('Form content')).toBeTruthy();
    expect(screen.getByTestId('form-keyboard-avoider')).toBeTruthy();
    expect(screen.getByTestId('form-scroll').props.keyboardShouldPersistTaps).toBe('always');
    expect(screen.getByTestId('form-scroll').props.contentContainerStyle).toEqual([
        expect.objectContaining({flexGrow: 1}),
        {paddingBottom: 32},
    ]);
});

test('adds Android keyboard height so covered content remains scrollable', async () => {
    const originalPlatform = Platform.OS;
    Platform.OS = 'android';
    const listeners = new Map<string, (event: {endCoordinates: {height: number}}) => void>();
    const addListener = jest.spyOn(Keyboard, 'addListener').mockImplementation((name, callback) => {
        listeners.set(name, callback as (event: {endCoordinates: {height: number}}) => void);
        return {remove: jest.fn()} as never;
    });

    try {
        const screen = await render(<FormScreen><Text>Form content</Text></FormScreen>);

        await act(() => {
            listeners.get('keyboardDidShow')?.({endCoordinates: {height: 600}});
        });
        expect(screen.getByTestId('form-scroll').props.contentContainerStyle[1].paddingBottom).toBe(632);

        await act(() => {
            listeners.get('keyboardDidHide')?.({endCoordinates: {height: 0}});
        });
        expect(screen.getByTestId('form-scroll').props.contentContainerStyle[1].paddingBottom).toBe(32);
    } finally {
        addListener.mockRestore();
        Platform.OS = originalPlatform;
    }
});
