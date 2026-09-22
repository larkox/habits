import { render } from '@testing-library/react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

import Calendar from './Calendar';

jest.mock('react-native-calendars', () => ({
    Calendar: (props: object) => {
        const {createElement} = jest.requireActual<typeof import('react')>('react');
        return createElement('NativeCalendar', {...props, testID: 'native-calendar'});
    },
}));
jest.mock('@/hooks/useThemeColor', () => ({useThemeColor: jest.fn()}));
const mockedThemeColor = jest.mocked(useThemeColor);
beforeEach(() => {
    jest.clearAllMocks();
    mockedThemeColor.mockImplementation(color => `color-${color}`);
});

describe('Calendar', () => {
    test('maps selected dates, theme colors, and calendar callbacks', async () => {
        const onDayPress = jest.fn();
        const onMonthChange = jest.fn();
        const screen = await render(<Calendar
            initialDate="2026-09-21"
            selectedDates={['2026-09-20', '2026-09-21']}
            onDayPress={onDayPress}
            onMonthChange={onMonthChange}
        />);
        const calendar = screen.getByTestId('native-calendar');

        calendar.props.onDayPress({year: 2026, month: 9, day: 21, timestamp: 0, dateString: ''});
        calendar.props.onMonthChange({year: 2026, month: 10, day: 1, timestamp: 0, dateString: ''});

        expect(calendar.props.markedDates).toEqual({
            '2026-09-20': {selected: true},
            '2026-09-21': {selected: true},
        });
        expect(calendar.props.theme.calendarBackground).toBe('color-foreground');
        expect(onDayPress).toHaveBeenCalledWith({year: 2026, month: 9, day: 21});
        expect(onMonthChange).toHaveBeenCalledWith({year: 2026, month: 10, day: 1});
    });

    test('does not select days in read-only mode', async () => {
        const onDayPress = jest.fn();
        const screen = await render(<Calendar
            readOnly
            onDayPress={onDayPress}
        />);
        const calendar = screen.getByTestId('native-calendar');

        calendar.props.onDayPress({year: 2026, month: 9, day: 21});

        expect(calendar.props.disableAllTouchEvents).toBe(true);
        expect(onDayPress).not.toHaveBeenCalled();
    });
});
