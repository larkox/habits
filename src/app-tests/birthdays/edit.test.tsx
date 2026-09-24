import { act, fireEvent, render } from '@testing-library/react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import EditBirthday from '@/app/(details)/birthdays/edit';
import useSmartLoading from '@/hooks/useSmartLoading';
import useStorageMutation from '@/hooks/useStorageMutation';
import { useBirthday } from '@/store/hooks';
import { updateBirthday, removeBirthday } from '@/store/storage';
import { getMonthAndDay, getMonthAndDayTimestamp } from '@/utils/time';

jest.mock('expo-router', () => ({useLocalSearchParams: jest.fn(), useNavigation: jest.fn(), useRouter: jest.fn()}));
jest.mock("@/platform/translations", () => ({useTranslate: () => (key: string) => key}));
jest.mock('@/hooks/useSmartLoading', () => jest.fn());
jest.mock('@/hooks/useStorageMutation', () => jest.fn());
jest.mock('@/store/hooks', () => ({useBirthday: jest.fn()}));
jest.mock('@/store/storage', () => ({updateBirthday: jest.fn(), removeBirthday: jest.fn()}));
jest.mock('@/utils/time', () => ({getMonthAndDay: jest.fn(), getMonthAndDayTimestamp: jest.fn()}));
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
    jest.mocked(useLocalSearchParams).mockReturnValue({id: 'birthday'});
    jest.mocked(useNavigation).mockReturnValue({setOptions} as never);
    jest.mocked(useRouter).mockReturnValue({back} as never);
    jest.mocked(useSmartLoading).mockImplementation(loading => ({isLoading: loading, showLoader: false}));
    jest.mocked(useStorageMutation).mockReturnValue({run, isPending: false});
    jest.mocked(useBirthday).mockReturnValue({id: 'birthday', name: 'Ada', date: '12-10', year: 1990});
    jest.mocked(getMonthAndDayTimestamp).mockReturnValue(1000);
    jest.mocked(getMonthAndDay).mockReturnValue('09-12');
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

describe('birthdays edit screen', () => {
    test('shows the initial record and its saved fields', async () => {
        const screen = await render(<EditBirthday/>);

        expect(useBirthday).toHaveBeenCalledWith('birthday');
        expect(screen.getByTestId('birthdays.add.inputLabels.name').props.value).toBe('Ada');
        expect(screen.getByTestId('birthdays.add.inputLabels.year').props.value).toBe('1990');
        expect(screen.getByTestId('birthdays.add.inputLabels.date').props.value).toBe(1000);
    });

    test('shows a loader only when loading becomes visible', async () => {
        jest.mocked(useBirthday).mockReturnValue(undefined);
        const waiting = await render(<EditBirthday/>);
        expect(waiting.toJSON()).toBeNull();
        await waiting.unmount();

        jest.mocked(useSmartLoading).mockReturnValue({isLoading: true, showLoader: true});
        const visible = await render(<EditBirthday/>);
        expect(visible.getByTestId('loader')).toBeTruthy();
    });

    test('keeps a changed draft when storage refreshes the same record', async () => {
        const screen = await render(<EditBirthday/>);
        await act(() => {
            screen.getByTestId('birthdays.add.inputLabels.name').props.onChange('Draft');
        });
        jest.mocked(useBirthday).mockReturnValue({...{id: 'birthday', name: 'Ada', date: '12-10', year: 1990}, name: 'Updated elsewhere'});

        await screen.rerender(<EditBirthday/>);

        expect(screen.getByTestId('birthdays.add.inputLabels.name').props.value).toBe('Draft');
    });

    test('validates before saving', async () => {
        const screen = await render(<EditBirthday/>);
        await act(() => {
            screen.getByTestId('birthdays.add.inputLabels.name').props.onChange('');
            screen.getByTestId('birthdays.add.inputLabels.year').props.onChange('');
        });

        await pressSaveButton();

        expect(screen.getByTestId('birthdays.add.inputLabels.name').props.error).toBe('validation.required');
        expect(screen.getByTestId('birthdays.add.inputLabels.year').props.error).toBe('validation.birthYear');
        expect(run).not.toHaveBeenCalled();
        expect(back).not.toHaveBeenCalled();
    });

    test('saves edited fields and returns on success', async () => {
        const screen = await render(<EditBirthday/>);
        await act(() => {
            screen.getByTestId('birthdays.add.inputLabels.name').props.onChange('  Grace  ');
            screen.getByTestId('birthdays.add.inputLabels.year').props.onChange('1906');
            screen.getByTestId('birthdays.add.inputLabels.date').props.setValue(2000);
        });

        await pressSaveButton();

        expect(updateBirthday).toHaveBeenCalledWith('birthday', 'Grace', '09-12', 1906);
        expect(back).toHaveBeenCalledTimes(1);
    });

    test('deletes the current record and returns on success', async () => {
        const screen = await render(<EditBirthday/>);

        await fireEvent.press(screen.getByRole('button', {name: 'birthdays.edit.deleteButton'}));

        expect(removeBirthday).toHaveBeenCalledWith('birthday');
        expect(updateBirthday).not.toHaveBeenCalled();
        expect(back).toHaveBeenCalledTimes(1);
    });
});
