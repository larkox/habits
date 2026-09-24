import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import useStorageMutation from '@/hooks/useStorageMutation';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useBirthday } from '@/store/hooks';
import { getDue, getNextMonthAndDay } from '@/utils/time';

import BirthdayElement from './BirthdayElement';

jest.mock('@/store/hooks', () => ({useBirthday: jest.fn()}));
jest.mock('@/utils/time', () => ({getDue: jest.fn(), getNextMonthAndDay: jest.fn()}));
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
beforeEach(() => jest.mocked(getDue).mockReturnValue(2));

describe('BirthdayElement', () => {
    test('renders nothing while a birthday is unavailable', async () => {
        jest.mocked(useBirthday).mockReturnValue(undefined);

        const screen = await render(<BirthdayElement id="missing"/>);

        expect(screen.toJSON()).toBeNull();
    });

    test.each([
        [2, 'foreground', 'foregroundText'],
        [-1, 'foregroundOverdue', 'foregroundOverdueText'],
    ] as const)('uses the correct colors when the due value is %i', async (due, background, textColor) => {
        jest.mocked(getDue).mockReturnValue(due);
        jest.mocked(useBirthday).mockReturnValue({id: 'birthday', name: 'Ada', date: '12-10', year: 2000});
        jest.mocked(getNextMonthAndDay).mockReturnValue(new Date(2026, 11, 10).getTime());
        const screen = await render(<BirthdayElement id="birthday"/>);

        expect(screen.getByTestId('birthday-card')).toHaveStyle({backgroundColor: `color-${background}`});
        expect(screen.getByText('Ada')).toHaveStyle({color: `color-${textColor}`});
    });

    test('shows the next age and opens a birthday for editing', async () => {
        jest.mocked(useBirthday).mockReturnValue({id: 'birthday', name: 'Ada', date: '12-10', year: 2000});
        jest.mocked(getNextMonthAndDay).mockReturnValue(new Date(2026, 11, 10).getTime());
        const screen = await render(<BirthdayElement id="birthday"/>);
        await fireEvent(screen.getByText('Ada'), 'onLongPress');
        expect(screen.getByText('26')).toBeTruthy();
        expect(navigate).toHaveBeenCalledWith('/(details)/birthdays/edit?id=birthday');
    });
});
