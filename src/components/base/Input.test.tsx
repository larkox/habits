import { fireEvent, render } from '@testing-library/react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

import Input from './Input';

jest.mock('@/hooks/useThemeColor', () => ({useThemeColor: jest.fn()}));
const mockedThemeColor = jest.mocked(useThemeColor);
beforeEach(() => {
    jest.clearAllMocks();
    mockedThemeColor.mockImplementation(color => `color-${color}`);
});

describe('Input', () => {
    test('renders its value and sends text changes', async () => {
        const onChange = jest.fn();
        const screen = await render(<Input
            label="Name"
            value="Read"
            onChange={onChange}
            type="text"
            placeholder="Habit"
        />);

        await fireEvent.changeText(screen.getByDisplayValue('Read'), 'Exercise');

        expect(screen.getByText('Name')).toBeTruthy();
        expect(onChange).toHaveBeenCalledWith('Exercise');
    });

    test('shows validation errors', async () => {
        const screen = await render(<Input
            label="Name"
            value=""
            onChange={jest.fn()}
            type="text"
            error="Required"
        />);
        expect(screen.getByText('Required')).toBeTruthy();
    });
});
