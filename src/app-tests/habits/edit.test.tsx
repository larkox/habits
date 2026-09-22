import { act, fireEvent, render } from '@testing-library/react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import EditHabit from '@/app/(details)/habits/edit';
import useSmartLoading from '@/hooks/useSmartLoading';
import useStorageMutation from '@/hooks/useStorageMutation';
import { useHabit } from '@/store/hooks';
import { updateHabit, removeHabit } from '@/store/storage';

jest.mock('expo-router', () => ({useLocalSearchParams: jest.fn(), useNavigation: jest.fn(), useRouter: jest.fn()}));
jest.mock('react-i18next', () => ({useTranslation: () => [(key: string) => key]}));
jest.mock('@/hooks/useSmartLoading', () => jest.fn());
jest.mock('@/hooks/useStorageMutation', () => jest.fn());
jest.mock('@/store/hooks', () => ({useHabit: jest.fn()}));
jest.mock('@/store/storage', () => ({updateHabit: jest.fn(), removeHabit: jest.fn()}));
jest.mock('@/components/base/Input', () => (props: object & {label: string}) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('Input', {...props, testID: props.label});
});
jest.mock('@/components/HabitCalendar', () => () => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('HabitCalendar', {testID: 'habit-calendar'});
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
    jest.mocked(useLocalSearchParams).mockReturnValue({id: 'habit'});
    jest.mocked(useNavigation).mockReturnValue({setOptions} as never);
    jest.mocked(useRouter).mockReturnValue({back} as never);
    jest.mocked(useSmartLoading).mockImplementation(loading => ({isLoading: loading, showLoader: false}));
    jest.mocked(useStorageMutation).mockReturnValue({run, isPending: false});
    jest.mocked(useHabit).mockReturnValue({id: 'habit', title: 'Read', lastDone: 1000, periodicity: 2});
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

describe('habits edit screen', () => {
    test('shows the initial record and its saved fields', async () => {
        const screen = await render(<EditHabit/>);

        expect(useHabit).toHaveBeenCalledWith('habit');
        expect(screen.getByTestId('habits.editHabit.inputLabels.title').props.value).toBe('Read');
        expect(screen.getByTestId('habits.editHabit.inputLabels.periodicity').props.value).toBe('2');
    });

    test('shows a loader only when loading becomes visible', async () => {
        jest.mocked(useHabit).mockReturnValue(undefined);
        const waiting = await render(<EditHabit/>);
        expect(waiting.toJSON()).toBeNull();
        await waiting.unmount();

        jest.mocked(useSmartLoading).mockReturnValue({isLoading: true, showLoader: true});
        const visible = await render(<EditHabit/>);
        expect(visible.getByTestId('loader')).toBeTruthy();
    });

    test('keeps a changed draft when storage refreshes the same record', async () => {
        const screen = await render(<EditHabit/>);
        await act(() => {
            screen.getByTestId('habits.editHabit.inputLabels.title').props.onChange('Draft');
        });
        jest.mocked(useHabit).mockReturnValue({...{id: 'habit', title: 'Read', lastDone: 1000, periodicity: 2}, title: 'Updated elsewhere'});

        await screen.rerender(<EditHabit/>);

        expect(screen.getByTestId('habits.editHabit.inputLabels.title').props.value).toBe('Draft');
    });

    test('validates before saving', async () => {
        const screen = await render(<EditHabit/>);
        await act(() => {
            screen.getByTestId('habits.editHabit.inputLabels.title').props.onChange('');
            screen.getByTestId('habits.editHabit.inputLabels.periodicity').props.onChange('');
        });

        await pressSaveButton();

        expect(screen.getByTestId('habits.editHabit.inputLabels.title').props.error).toBe('validation.required');
        expect(screen.getByTestId('habits.editHabit.inputLabels.periodicity').props.error).toBe('validation.positiveInteger');
        expect(run).not.toHaveBeenCalled();
        expect(back).not.toHaveBeenCalled();
    });

    test('saves edited fields and returns on success', async () => {
        const screen = await render(<EditHabit/>);
        await act(() => {
            screen.getByTestId('habits.editHabit.inputLabels.title').props.onChange('  Exercise  ');
            screen.getByTestId('habits.editHabit.inputLabels.periodicity').props.onChange('3');
        });

        await pressSaveButton();

        expect(updateHabit).toHaveBeenCalledWith('habit', 'Exercise', 3);
        expect(back).toHaveBeenCalledTimes(1);
    });

    test('deletes the current record and returns on success', async () => {
        const screen = await render(<EditHabit/>);

        await fireEvent.press(screen.getByRole('button', {name: 'habits.deleteButton'}));

        expect(removeHabit).toHaveBeenCalledWith('habit');
        expect(updateHabit).not.toHaveBeenCalled();
        expect(back).toHaveBeenCalledTimes(1);
    });
});
