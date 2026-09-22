import { act, fireEvent, render } from '@testing-library/react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import EditTodo from '@/app/(details)/todo/edit';
import useSmartLoading from '@/hooks/useSmartLoading';
import useStorageMutation from '@/hooks/useStorageMutation';
import { useTodo } from '@/store/hooks';
import { updateTodo } from '@/store/storage';

jest.mock('expo-router', () => ({useLocalSearchParams: jest.fn(), useNavigation: jest.fn(), useRouter: jest.fn()}));
jest.mock('react-i18next', () => ({useTranslation: () => [(key: string) => key]}));
jest.mock('@/hooks/useSmartLoading', () => jest.fn());
jest.mock('@/hooks/useStorageMutation', () => jest.fn());
jest.mock('@/store/hooks', () => ({useTodo: jest.fn()}));
jest.mock('@/store/storage', () => ({updateTodo: jest.fn()}));
jest.mock('@/components/base/Input', () => (props: object & {label: string}) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('Input', {...props, testID: props.label});
});
jest.mock('@/components/base/InputCalendar', () => (props: object & {label: string}) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('InputCalendar', {...props, testID: props.label});
});
jest.mock('@/components/base/FormScreen', () => (props: object & {children: React.ReactNode}) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('FormScreen', props);
});
jest.mock('@/components/base/Loader', () => () => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('Loader', {testID: 'loader'});
});

const setOptions = jest.fn();
const back = jest.fn();
const run = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useLocalSearchParams).mockReturnValue({id: 'todo'});
    jest.mocked(useNavigation).mockReturnValue({setOptions} as never);
    jest.mocked(useRouter).mockReturnValue({back} as never);
    jest.mocked(useSmartLoading).mockImplementation(loading => ({isLoading: loading, showLoader: false}));
    jest.mocked(useStorageMutation).mockReturnValue({run, isPending: false});
    jest.mocked(useTodo).mockReturnValue({id: 'todo', name: 'Call', date: 1000});
    run.mockImplementation(async operation => {
        await operation();
        return true;
    });
});

async function pressSaveButton() {
    const HeaderButton = setOptions.mock.lastCall?.[0].headerRight;
    const header = await render(<HeaderButton/>);
    await fireEvent.press(header.getByRole('button'));
}

describe('todo edit screen', () => {
    test('shows the initial record and its saved fields', async () => {
        const screen = await render(<EditTodo/>);

        expect(useTodo).toHaveBeenCalledWith('todo');
        expect(screen.getByTestId('todo.addTodo.inputLabels.name').props.value).toBe('Call');
        expect(screen.getByTestId('todo.addTodo.inputLabels.date').props.value).toBe(1000);
    });

    test('shows a loader only when loading becomes visible', async () => {
        jest.mocked(useTodo).mockReturnValue(undefined);
        const waiting = await render(<EditTodo/>);
        expect(waiting.toJSON()).toBeNull();
        await waiting.unmount();

        jest.mocked(useSmartLoading).mockReturnValue({isLoading: true, showLoader: true});
        const visible = await render(<EditTodo/>);
        expect(visible.getByTestId('loader')).toBeTruthy();
    });

    test('keeps a changed draft when storage refreshes the same record', async () => {
        const screen = await render(<EditTodo/>);
        await act(() => {
            screen.getByTestId('todo.addTodo.inputLabels.name').props.onChange('Draft');
        });
        jest.mocked(useTodo).mockReturnValue({...{id: 'todo', name: 'Call', date: 1000}, name: 'Updated elsewhere'});

        await screen.rerender(<EditTodo/>);

        expect(screen.getByTestId('todo.addTodo.inputLabels.name').props.value).toBe('Draft');
    });

    test('validates before saving', async () => {
        const screen = await render(<EditTodo/>);
        await act(() => {
            screen.getByTestId('todo.addTodo.inputLabels.name').props.onChange('');

        });

        await pressSaveButton();

        expect(screen.getByTestId('todo.addTodo.inputLabels.name').props.error).toBe('validation.required');
        expect(run).not.toHaveBeenCalled();
        expect(back).not.toHaveBeenCalled();
    });

    test('saves edited fields and returns on success', async () => {
        const screen = await render(<EditTodo/>);
        await act(() => {
            screen.getByTestId('todo.addTodo.inputLabels.name').props.onChange('  Write  ');
            screen.getByTestId('todo.addTodo.inputLabels.date').props.setValue(2000);
        });

        await pressSaveButton();

        expect(updateTodo).toHaveBeenCalledWith('todo', 'Write', 2000);
        expect(back).toHaveBeenCalledTimes(1);
    });
});
