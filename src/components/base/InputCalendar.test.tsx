import { render } from '@testing-library/react-native';

import { getLocalDateTimestamp, toDateString } from '@/utils/time';

import InputCalendar from './InputCalendar';

jest.mock('./Calendar', () => (props: object) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('Calendar', {...props, testID: 'calendar'});
});
jest.mock('@/utils/time', () => ({getLocalDateTimestamp: jest.fn(), toDateString: jest.fn()}));
beforeEach(() => {
    jest.clearAllMocks();
});

describe('InputCalendar', () => {
    test('does not select a date when its value is empty', async () => {
        const screen = await render(<InputCalendar
            label="Date"
            setValue={jest.fn()}
        />);
        const calendar = screen.getByTestId('calendar');

        expect(screen.getByText('Date')).toBeTruthy();
        expect(calendar.props.initialDate).toBe('');
        expect(calendar.props.selectedDates).toEqual([]);
        expect(toDateString).not.toHaveBeenCalled();
    });

    test('shows its value as the selected calendar date', async () => {
        jest.mocked(toDateString).mockReturnValue('2026-09-21');
        const screen = await render(<InputCalendar
            label="Date"
            value={1234}
            setValue={jest.fn()}
        />);
        const calendar = screen.getByTestId('calendar');

        expect(calendar.props.initialDate).toBe('2026-09-21');
        expect(calendar.props.selectedDates).toEqual(['2026-09-21']);
        expect(toDateString).toHaveBeenCalledWith(1234);
    });

    test('converts a pressed day to a timestamp and reports it', async () => {
        jest.mocked(getLocalDateTimestamp).mockReturnValue(1234);
        const setValue = jest.fn();
        const screen = await render(<InputCalendar
            label="Date"
            setValue={setValue}
        />);
        const selectedDay = {year: 2026, month: 9, day: 21};

        screen.getByTestId('calendar').props.onDayPress(selectedDay);

        expect(getLocalDateTimestamp).toHaveBeenCalledWith(selectedDay);
        expect(setValue).toHaveBeenCalledWith(1234);
    });
});
