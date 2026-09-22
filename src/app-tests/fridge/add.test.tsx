import { act, fireEvent, render } from '@testing-library/react-native';
import { useNavigation, useRouter } from 'expo-router';

import AddFridge from '@/app/(tabs)/fridge/add';
import useStorageMutation from '@/hooks/useStorageMutation';
import { addFridgeFood } from '@/store/storage';
import { getStartOfDay } from '@/utils/time';


jest.mock('expo-router', () => ({useNavigation: jest.fn(), useRouter: jest.fn()}));
jest.mock('react-i18next', () => ({useTranslation: () => [(key: string) => key]}));
jest.mock('@/hooks/useStorageMutation', () => jest.fn());
jest.mock('@/store/storage', () => ({addFridgeFood: jest.fn()}));
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

async function pressSaveButton() {
    const HeaderButton = setOptions.mock.lastCall?.[0].headerRight;
    const header = await render(<HeaderButton/>);
    await fireEvent.press(header.getByRole('button'));
}

describe('fridge add screen', () => {
    test('shows the initial form state', async () => {
        const screen = await render(<AddFridge/>);

        expect(screen.getByTestId('fridge.addFood.inputLabels.name').props.value).toBe('');
        expect(screen.getByTestId('fridge.addFood.inputLabels.expiryDate').props.value).toBe(1000);
    });

    test('shows validation and does not save an empty form', async () => {
        const screen = await render(<AddFridge/>);

        await pressSaveButton();

        expect(screen.getByTestId('fridge.addFood.inputLabels.name').props.error).toBe('validation.required');
        expect(run).not.toHaveBeenCalled();
        expect(back).not.toHaveBeenCalled();
    });

    test('saves valid input and returns to the previous screen', async () => {
        const screen = await render(<AddFridge/>);
        await act(() => {
            screen.getByTestId('fridge.addFood.inputLabels.name').props.onChange('  Milk  ');
            screen.getByTestId('fridge.addFood.inputLabels.expiryDate').props.setValue(3000);
        });

        await pressSaveButton();

        expect(addFridgeFood).toHaveBeenCalledWith('Milk', 3000);
        expect(back).toHaveBeenCalledTimes(1);
    });
});
