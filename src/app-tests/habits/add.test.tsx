import { act, fireEvent, render } from '@testing-library/react-native';
import { useNavigation, useRouter } from 'expo-router';

import AddHabit from '@/app/(tabs)/habits/add';
import useStorageMutation from '@/hooks/useStorageMutation';
import { addHabit } from '@/store/storage';


jest.mock('expo-router', () => ({useNavigation: jest.fn(), useRouter: jest.fn()}));
jest.mock('react-i18next', () => ({useTranslation: () => [(key: string) => key]}));
jest.mock('@/hooks/useStorageMutation', () => jest.fn());
jest.mock('@/store/storage', () => ({addHabit: jest.fn()}));
jest.mock('@/components/base/Input', () => (props: object & {label: string}) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('Input', {...props, testID: props.label});
});

const setOptions = jest.fn();
const back = jest.fn();
const run = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useNavigation).mockReturnValue({setOptions} as never);
    jest.mocked(useRouter).mockReturnValue({back} as never);
    jest.mocked(useStorageMutation).mockReturnValue({run, isPending: false});
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

describe('habit add screen', () => {
    test('shows the initial form state', async () => {
        const screen = await render(<AddHabit/>);

        expect(screen.getByTestId('habits.addHabit.inputLabels.title').props.value).toBe('');
    });

    test('shows validation and does not save an empty form', async () => {
        const screen = await render(<AddHabit/>);

        await pressSaveButton();

        expect(screen.getByTestId('habits.addHabit.inputLabels.title').props.error).toBe('validation.required');
        expect(screen.getByTestId('habits.addHabit.inputLabels.periodicity').props.error).toBe('validation.positiveInteger');
        expect(run).not.toHaveBeenCalled();
        expect(back).not.toHaveBeenCalled();
    });

    test('saves valid input and returns to the previous screen', async () => {
        const screen = await render(<AddHabit/>);
        await act(() => {
            screen.getByTestId('habits.addHabit.inputLabels.title').props.onChange('  Read  ');
            screen.getByTestId('habits.addHabit.inputLabels.periodicity').props.onChange('3');
        });

        await pressSaveButton();

        expect(addHabit).toHaveBeenCalledWith('Read', 3);
        expect(back).toHaveBeenCalledTimes(1);
    });
});
