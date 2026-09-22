import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import useStorageMutation from '@/hooks/useStorageMutation';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTodo } from '@/store/hooks';
import { removeTodo } from '@/store/storage';
import { getDue } from '@/utils/time';

import TodoElement from './TodoElement';

jest.mock('@/store/hooks', () => ({useTodo: jest.fn()}));
jest.mock('@/store/storage', () => ({removeTodo: jest.fn()}));
jest.mock('@/utils/time', () => ({getDue: jest.fn()}));
jest.mock('expo-router', () => ({useRouter: jest.fn()}));
jest.mock('react-i18next', () => ({useTranslation: () => [(key: string, options?: {val?: number}) => options?.val === undefined ? key : `${key}:${options.val}`]}));
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

describe('TodoElement', () => {
    test.each([
        [2, 'foreground', 'foregroundText'],
        [-1, 'foregroundOverdue', 'foregroundOverdueText'],
    ] as const)('uses the correct colors when the due value is %i', async (due, background, textColor) => {
        jest.mocked(getDue).mockReturnValue(due);
        jest.mocked(useTodo).mockReturnValue({id: 'todo', name: 'Call', date: 100});
        const screen = await render(<TodoElement id="todo"/>);

        expect(screen.getByTestId('todo-card')).toHaveStyle({backgroundColor: `color-${background}`});
        expect(screen.getByText('Call')).toHaveStyle({color: `color-${textColor}`});
    });

    test('removes a todo when its button is pressed', async () => {
        jest.mocked(useTodo).mockReturnValue({id: 'todo', name: 'Call', date: 100});
        const screen = await render(<TodoElement id="todo"/>);

        await fireEvent.press(screen.getByRole('button'));

        expect(removeTodo).toHaveBeenCalledTimes(1);
        expect(removeTodo).toHaveBeenCalledWith('todo');
        expect(navigate).not.toHaveBeenCalled();
    });

    test('opens a todo for editing when its name is long-pressed', async () => {
        jest.mocked(useTodo).mockReturnValue({id: 'todo', name: 'Call', date: 100});
        const screen = await render(<TodoElement id="todo"/>);

        await fireEvent(screen.getByText('Call'), 'onLongPress');

        expect(navigate).toHaveBeenCalledWith('/(details)/todo/edit?id=todo');
        expect(removeTodo).not.toHaveBeenCalled();
    });
});

describe('missing records', () => {
    test('renders nothing while a record is unavailable', async () => {
        jest.mocked(useTodo).mockReturnValue(undefined);
        const screen = await render(<TodoElement id="missing"/>);
        expect(screen.toJSON()).toBeNull();
    });
});
