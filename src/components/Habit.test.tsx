import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import useStorageMutation from '@/hooks/useStorageMutation';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useHabit } from '@/store/hooks';
import { doHabit } from '@/store/storage';
import { getDue, getStartOfDay } from '@/utils/time';

import Habit from './Habit';

jest.mock('@/store/hooks', () => ({useHabit: jest.fn()}));
jest.mock('@/store/storage', () => ({doHabit: jest.fn()}));
jest.mock('@/utils/time', () => ({getDue: jest.fn(), getStartOfDay: jest.fn()}));
jest.mock('expo-router', () => ({useRouter: jest.fn()}));
jest.mock("@/platform/translations", () => ({useTranslate: () => (key: string, options?: {val?: number}) => options?.val === undefined ? key : `${key}:${options.val}`}));
jest.mock('@/hooks/useStorageMutation', () => jest.fn());
jest.mock('@/hooks/useThemeColor', () => ({useThemeColor: jest.fn()}));

const run = jest.fn();
const navigate = jest.fn();
beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useRouter).mockReturnValue({navigate} as never);
    jest.mocked(useStorageMutation).mockReturnValue({run, isPending: false});
    jest.mocked(useThemeColor).mockImplementation(color => `color-${color}`);
    run.mockImplementation(async operation => {
        await operation();
        return true;
    });
});
beforeEach(() => {
    jest.mocked(getDue).mockReturnValue(2);
    jest.mocked(getStartOfDay).mockReturnValue(100);
});

describe('Habit', () => {
    test('renders nothing while a habit is unavailable', async () => {
        jest.mocked(useHabit).mockReturnValue(undefined);

        const screen = await render(<Habit id="missing"/>);

        expect(screen.toJSON()).toBeNull();
    });

    test.each([
        [50, 2, 'foreground', 'foregroundText'],
        [50, -1, 'foregroundOverdue', 'foregroundOverdueText'],
        [100, 2, 'foregroundDone', 'foregroundDoneText'],
    ] as const)('uses the correct colors for last completion %i and due value %i', async (lastDone, due, background, textColor) => {
        jest.mocked(getDue).mockReturnValue(due);
        jest.mocked(useHabit).mockReturnValue({id: 'habit', title: 'Read', lastDone, periodicity: 1});
        const screen = await render(<Habit id="habit"/>);

        expect(screen.getByTestId('habit-card')).toHaveStyle({backgroundColor: `color-${background}`});
        expect(screen.getByText('Read')).toHaveStyle({color: `color-${textColor}`});
    });

    test('completes a habit when its button is pressed', async () => {
        jest.mocked(useHabit).mockReturnValue({id: 'habit', title: 'Read', lastDone: 50, periodicity: 1});
        const screen = await render(<Habit id="habit"/>);

        await fireEvent.press(screen.getByRole('button'));

        expect(doHabit).toHaveBeenCalledTimes(1);
        expect(doHabit).toHaveBeenCalledWith('habit');
        expect(navigate).not.toHaveBeenCalled();
        expect(screen.getByText('habits.due:2')).toBeTruthy();
    });

    test('opens a habit for editing when its title is long-pressed', async () => {
        jest.mocked(useHabit).mockReturnValue({id: 'habit', title: 'Read', lastDone: 50, periodicity: 1});
        const screen = await render(<Habit id="habit"/>);

        await fireEvent(screen.getByText('Read'), 'onLongPress');

        expect(navigate).toHaveBeenCalledWith('/(details)/habits/edit?id=habit');
        expect(doHabit).not.toHaveBeenCalled();
    });

    test('shows a completed habit with a disabled button', async () => {
        jest.mocked(useHabit).mockReturnValue({id: 'habit', title: 'Read', lastDone: 100, periodicity: 1});
        const screen = await render(<Habit id="habit"/>);
        expect(screen.getByText('habits.doneToday')).toBeTruthy();
        expect(screen.getByRole('button').props.accessibilityState.disabled).toBe(true);
    });
});
