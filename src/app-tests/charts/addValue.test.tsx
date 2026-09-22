import { act, fireEvent, render } from '@testing-library/react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import AddChartValue from '@/app/(tabs)/charts/addValue';
import useSmartLoading from '@/hooks/useSmartLoading';
import useStorageMutation from '@/hooks/useStorageMutation';
import { useChartValues } from '@/store/hooks';
import { setChartValue } from '@/store/storage';
import { getChartValueForToday } from '@/utils/charts';

jest.mock('expo-router', () => ({useLocalSearchParams: jest.fn(), useNavigation: jest.fn(), useRouter: jest.fn()}));
jest.mock('react-i18next', () => ({useTranslation: () => [(key: string) => key]}));
jest.mock('@/hooks/useSmartLoading', () => jest.fn());
jest.mock('@/hooks/useStorageMutation', () => jest.fn());
jest.mock('@/store/hooks', () => ({useChartValues: jest.fn()}));
jest.mock('@/store/storage', () => ({setChartValue: jest.fn()}));
jest.mock('@/utils/charts', () => ({getChartValueForToday: jest.fn()}));
jest.mock('@/components/base/Input', () => (props: object) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('Input', {...props, testID: 'value'});
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
    jest.mocked(useLocalSearchParams).mockReturnValue({id: 'chart'});
    jest.mocked(useNavigation).mockReturnValue({setOptions} as never);
    jest.mocked(useRouter).mockReturnValue({back} as never);
    jest.mocked(useSmartLoading).mockImplementation(loading => ({isLoading: loading, showLoader: false}));
    jest.mocked(useStorageMutation).mockReturnValue({run, isPending: false});
    jest.mocked(useChartValues).mockReturnValue([]);
    jest.mocked(getChartValueForToday).mockReturnValue(undefined);
    run.mockImplementation(async operation => {
        await operation();
        return true;
    });
});

async function pressSave() {
    const Header = setOptions.mock.lastCall?.[0].headerRight;
    const header = await render(<Header/>);
    await fireEvent.press(header.getByRole('button'));
}

describe('chart value screen', () => {
    test('starts blank for a new value and uses the add action', async () => {
        const screen = await render(<AddChartValue/>);
        expect(useChartValues).toHaveBeenCalledWith('chart');
        expect(screen.getByTestId('value').props.value).toBe('');
        const Header = setOptions.mock.lastCall?.[0].headerRight;
        const header = await render(<Header/>);
        expect(header.getByRole('button', {name: 'charts.addValue.addButton'})).toBeTruthy();
    });

    test('hydrates todays value and uses the update action', async () => {
        jest.mocked(getChartValueForToday).mockReturnValue({id: 'today', value: 3.5} as never);
        const screen = await render(<AddChartValue/>);
        expect(screen.getByTestId('value').props.value).toBe('3.5');
        const Header = setOptions.mock.lastCall?.[0].headerRight;
        const header = await render(<Header/>);
        expect(header.getByRole('button', {name: 'charts.addValue.updateValueButton'})).toBeTruthy();
    });

    test('shows delayed loader for missing values', async () => {
        jest.mocked(useChartValues).mockReturnValue(undefined);
        const waiting = await render(<AddChartValue/>);
        expect(waiting.toJSON()).toBeNull();
        await waiting.unmount();
        jest.mocked(useSmartLoading).mockReturnValue({isLoading: true, showLoader: true});
        const visible = await render(<AddChartValue/>);
        expect(visible.getByTestId('loader')).toBeTruthy();
    });

    test('keeps a changed draft when values refresh', async () => {
        const screen = await render(<AddChartValue/>);
        await act(() => { screen.getByTestId('value').props.onChange('4'); });
        await screen.rerender(<AddChartValue/>);
        expect(screen.getByTestId('value').props.value).toBe('4');
    });

    test('rejects invalid input', async () => {
        const screen = await render(<AddChartValue/>);
        await act(() => { screen.getByTestId('value').props.onChange('abc'); });
        await pressSave();
        expect(screen.getByTestId('value').props.error).toBe('validation.number');
        expect(run).not.toHaveBeenCalled();
    });

    test('saves a localized number and returns', async () => {
        const screen = await render(<AddChartValue/>);
        await act(() => { screen.getByTestId('value').props.onChange('2,5'); });
        await pressSave();
        expect(setChartValue).toHaveBeenCalledWith('chart', 2.5);
        expect(back).toHaveBeenCalledTimes(1);
    });
});
