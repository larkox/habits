import { act, render } from '@testing-library/react-native';

import { useHabitCalendar } from '@/store/hooks';
import { getMonthStart, toDateString } from '@/utils/time';

import HabitCalendar from './HabitCalendar';

jest.mock('@/components/base/Calendar', () => (props: object) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('HabitCalendarView', {...props, testID: 'habit-calendar'});
});
jest.mock('@/store/hooks', () => ({useHabitCalendar: jest.fn()}));
jest.mock('@/utils/time', () => ({getMonthStart: jest.fn(), toDateString: jest.fn()}));

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getMonthStart).mockReturnValue(1000);
});

describe('HabitCalendar', () => {
    test('loads the current month and marks habit completion dates', async () => {
        jest.mocked(useHabitCalendar).mockReturnValue([{date: 10}, {date: 20}]);
        jest.mocked(toDateString).mockImplementation(date => date === 10 ? '2026-09-10' : '2026-09-20');

        const screen = await render(<HabitCalendar id="habit"/>);
        const calendar = screen.getByTestId('habit-calendar');

        expect(getMonthStart).toHaveBeenCalledWith();
        expect(useHabitCalendar).toHaveBeenCalledWith('habit', 1000);
        expect(calendar.props.readOnly).toBe(true);
        expect(calendar.props.selectedDates).toEqual(['2026-09-10', '2026-09-20']);
    });

    test('loads the selected month when the calendar changes', async () => {
        const selectedMonth = {year: 2026, month: 10, day: 1};
        jest.mocked(getMonthStart).mockImplementation(date => date ? 2000 : 1000);
        jest.mocked(useHabitCalendar).mockImplementation((_id, monthStart) => monthStart === 2000 ? [{date: 30}] : [{date: 10}]);
        jest.mocked(toDateString).mockImplementation(date => date === 30 ? '2026-10-30' : '2026-09-10');
        const screen = await render(<HabitCalendar id="habit"/>);

        await act(() => {
            screen.getByTestId('habit-calendar').props.onMonthChange(selectedMonth);
        });

        expect(getMonthStart).toHaveBeenCalledWith(selectedMonth);
        expect(useHabitCalendar).toHaveBeenLastCalledWith('habit', 2000);
        expect(screen.getByTestId('habit-calendar').props.selectedDates).toEqual(['2026-10-30']);
    });

    test('has no selected dates while history is loading', async () => {
        jest.mocked(useHabitCalendar).mockReturnValue(undefined);

        const screen = await render(<HabitCalendar id="habit"/>);

        expect(screen.getByTestId('habit-calendar').props.selectedDates).toBeUndefined();
    });
});
