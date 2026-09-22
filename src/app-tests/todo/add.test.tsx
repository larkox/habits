import { act, fireEvent, render } from '@testing-library/react-native';
import { useNavigation, useRouter } from 'expo-router';

import AddTodo from '@/app/(tabs)/todo/add';
import useStorageMutation from '@/hooks/useStorageMutation';
import { addTodo } from '@/store/storage';
import { getStartOfDay } from '@/utils/time';

jest.mock('expo-router', () => ({useNavigation: jest.fn(), useRouter: jest.fn()}));
jest.mock('react-i18next', () => ({useTranslation: () => [(key: string) => key]}));
jest.mock('@/hooks/useStorageMutation', () => jest.fn());
jest.mock('@/store/storage', () => ({addTodo: jest.fn()}));
jest.mock('@/utils/time', () => ({getStartOfDay: jest.fn()}));
jest.mock('@/components/base/Input', () => (props: object & {label: string}) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('Input', {...props, testID: props.label});
});
jest.mock('@/components/base/InputCalendar', () => (props: object & {label: string}) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('InputCalendar', {...props, testID: props.label});
});

const setOptions = jest.fn();
const back = jest.fn();
const run = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useNavigation).mockReturnValue({setOptions} as never);
    jest.mocked(useRouter).mockReturnValue({back} as never);
    jest.mocked(useStorageMutation).mockReturnValue({run, isPending: false});
    jest.mocked(getStartOfDay).mockReturnValue(1000);
    run.mockImplementation(async operation => {
        await operation();
        return true;
    });
});

async function renderSaveButton() {
    const HeaderButton = setOptions.mock.lastCall?.[0].headerRight;
    return render(<HeaderButton/>);
}

describe('todo add screen', () => {
    test('starts with today selected', async () => {
        const screen = await render(<AddTodo/>);

        expect(screen.getByTestId('todo.addTodo.inputLabels.date').props.value).toBe(1000);
    });

    test('shows validation and does not save an empty todo', async () => {
        const screen = await render(<AddTodo/>);
        const header = await renderSaveButton();

        await fireEvent.press(header.getByRole('button'));

        expect(screen.getByTestId('todo.addTodo.inputLabels.name').props.error).toBe('validation.required');
        expect(run).not.toHaveBeenCalled();
        expect(back).not.toHaveBeenCalled();
    });

    test('saves the normalized name and selected date', async () => {
        const screen = await render(<AddTodo/>);
        await act(() => {
            screen.getByTestId('todo.addTodo.inputLabels.name').props.onChange('  Call Ada  ');
            screen.getByTestId('todo.addTodo.inputLabels.date').props.setValue(2000);
        });
        const header = await renderSaveButton();

        await fireEvent.press(header.getByRole('button'));

        expect(addTodo).toHaveBeenCalledWith('Call Ada', 2000);
        expect(back).toHaveBeenCalledTimes(1);
    });

    test('stays on the form when saving fails', async () => {
        run.mockResolvedValue(false);
        const screen = await render(<AddTodo/>);
        await act(() => {
            screen.getByTestId('todo.addTodo.inputLabels.name').props.onChange('Call Ada');
        });
        const header = await renderSaveButton();

        await fireEvent.press(header.getByRole('button'));

        expect(run).toHaveBeenCalledTimes(1);
        expect(back).not.toHaveBeenCalled();
    });
});
