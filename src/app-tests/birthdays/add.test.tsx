import { act, fireEvent, render } from '@testing-library/react-native';
import { useNavigation, useRouter } from 'expo-router';

import AddBirthday from '@/app/(tabs)/birthdays/add';
import useStorageMutation from '@/hooks/useStorageMutation';
import { addBirthday } from '@/store/storage';
import { getStartOfDay, getMonthAndDay } from '@/utils/time';


jest.mock('expo-router', () => ({useNavigation: jest.fn(), useRouter: jest.fn()}));
jest.mock('react-i18next', () => ({useTranslation: () => [(key: string) => key]}));
jest.mock('@/hooks/useStorageMutation', () => jest.fn());
jest.mock('@/store/storage', () => ({addBirthday: jest.fn()}));
jest.mock('@/utils/time', () => ({getStartOfDay: jest.fn(), getMonthAndDay: jest.fn()}));
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
    jest.mocked(getMonthAndDay).mockReturnValue('12-10');
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

describe('birthday add screen', () => {
    test('shows the initial form state', async () => {
        const screen = await render(<AddBirthday/>);

        expect(screen.getByTestId('birthdays.add.inputLabels.name').props.value).toBe('');
        expect(screen.getByTestId('birthdays.add.inputLabels.date').props.value).toBe(1000);
    });

    test('shows validation and does not save an empty form', async () => {
        const screen = await render(<AddBirthday/>);

        await pressSaveButton();

        expect(screen.getByTestId('birthdays.add.inputLabels.name').props.error).toBe('validation.required');
        expect(screen.getByTestId('birthdays.add.inputLabels.year').props.error).toBe('validation.birthYear');
        expect(run).not.toHaveBeenCalled();
        expect(back).not.toHaveBeenCalled();
    });

    test('saves valid input and returns to the previous screen', async () => {
        const screen = await render(<AddBirthday/>);
        await act(() => {
            screen.getByTestId('birthdays.add.inputLabels.name').props.onChange('  Ada  ');
            screen.getByTestId('birthdays.add.inputLabels.year').props.onChange('1990');
            screen.getByTestId('birthdays.add.inputLabels.date').props.setValue(3000);
        });

        await pressSaveButton();

        expect(addBirthday).toHaveBeenCalledWith('Ada', '12-10', 1990);
        expect(back).toHaveBeenCalledTimes(1);
    });
});
