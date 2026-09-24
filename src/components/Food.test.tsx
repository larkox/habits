import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import useStorageMutation from '@/hooks/useStorageMutation';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useFood } from '@/store/hooks';
import { removeFoodFromFridge } from '@/store/storage';
import { getDue } from '@/utils/time';

import Food from './Food';

jest.mock('@/store/hooks', () => ({useFood: jest.fn()}));
jest.mock('@/store/storage', () => ({removeFoodFromFridge: jest.fn()}));
jest.mock('@/utils/time', () => ({getDue: jest.fn()}));
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

describe('Food', () => {
    test('renders nothing while food is unavailable', async () => {
        jest.mocked(useFood).mockReturnValue(undefined);

        const screen = await render(<Food id="missing"/>);

        expect(screen.toJSON()).toBeNull();
    });

    test.each([
        [2, 'foreground', 'foregroundText'],
        [-1, 'foregroundOverdue', 'foregroundOverdueText'],
    ] as const)('uses the correct colors when the due value is %i', async (due, background, textColor) => {
        jest.mocked(getDue).mockReturnValue(due);
        jest.mocked(useFood).mockReturnValue({id: 'food', name: 'Milk', date: 100});
        const screen = await render(<Food id="food"/>);

        expect(screen.getByTestId('food-card')).toHaveStyle({backgroundColor: `color-${background}`});
        expect(screen.getByText('Milk')).toHaveStyle({color: `color-${textColor}`});
    });

    test('removes food when its button is pressed', async () => {
        jest.mocked(useFood).mockReturnValue({id: 'food', name: 'Milk', date: 100});
        const screen = await render(<Food id="food"/>);

        await fireEvent.press(screen.getByRole('button'));

        expect(removeFoodFromFridge).toHaveBeenCalledTimes(1);
        expect(removeFoodFromFridge).toHaveBeenCalledWith('food');
        expect(navigate).not.toHaveBeenCalled();
    });

    test('opens food for editing when its name is long-pressed', async () => {
        jest.mocked(useFood).mockReturnValue({id: 'food', name: 'Milk', date: 100});
        const screen = await render(<Food id="food"/>);

        await fireEvent(screen.getByText('Milk'), 'onLongPress');

        expect(navigate).toHaveBeenCalledWith('/(details)/fridge/edit?id=food');
        expect(removeFoodFromFridge).not.toHaveBeenCalled();
    });
});
