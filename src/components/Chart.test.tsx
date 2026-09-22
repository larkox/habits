import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import useStorageMutation from '@/hooks/useStorageMutation';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useChart, useChartValues } from '@/store/hooks';
import { removeChart } from '@/store/storage';
import { getChartValueForToday } from '@/utils/charts';

import Chart from './Chart';

jest.mock('expo-router', () => ({useRouter: jest.fn()}));
jest.mock('react-i18next', () => ({
    useTranslation: () => [(key: string, options?: {val?: number}) => options?.val === undefined ? key : `${key}:${options.val}`],
}));
jest.mock('react-native-gifted-charts', () => ({
    LineChart: (props: object) => {
        const {createElement} = jest.requireActual<typeof import('react')>('react');
        return createElement('LineChart', {...props, testID: 'line-chart'});
    },
}));
jest.mock('@/hooks/useStorageMutation', () => jest.fn());
jest.mock('@/hooks/useThemeColor', () => ({useThemeColor: jest.fn()}));
jest.mock('@/store/hooks', () => ({useChart: jest.fn(), useChartValues: jest.fn()}));
jest.mock('@/store/storage', () => ({removeChart: jest.fn()}));
jest.mock('@/utils/charts', () => ({getChartValueForToday: jest.fn()}));

const run = jest.fn();
const navigate = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useRouter).mockReturnValue({navigate} as never);
    jest.mocked(useStorageMutation).mockReturnValue({run, isPending: false});
    jest.mocked(useThemeColor).mockImplementation(color => `color-${color}`);
    jest.mocked(useChart).mockReturnValue({id: 'chart', title: 'Weight'});
    jest.mocked(useChartValues).mockReturnValue([]);
    jest.mocked(getChartValueForToday).mockReturnValue(undefined);
    run.mockImplementation(async operation => {
        await operation();
        return true;
    });
});

describe('Chart', () => {
    test('renders nothing while the chart is unavailable', async () => {
        jest.mocked(useChart).mockReturnValue(undefined);

        const screen = await render(<Chart id="chart"/>);

        expect(screen.toJSON()).toBeNull();
    });

    test('renders chart values and opens the add-value screen', async () => {
        const values = [{id: 'value', chartId: 'chart', value: 72, date: 100}];
        jest.mocked(useChartValues).mockReturnValue(values);
        const screen = await render(<Chart id="chart"/>);

        await fireEvent.press(screen.getByRole('button', {name: 'charts.addValueButton'}));

        expect(screen.getByText('Weight')).toBeTruthy();
        expect(screen.getByTestId('line-chart').props.data).toEqual([{value: 72, label: 'date:100'}]);
        expect(getChartValueForToday).toHaveBeenCalledWith(values);
        expect(navigate).toHaveBeenCalledWith('/(details)/charts/addValue?id=chart');
        expect(removeChart).not.toHaveBeenCalled();
    });

    test('offers to update an existing value for today', async () => {
        jest.mocked(getChartValueForToday).mockReturnValue({id: 'value', chartId: 'chart', value: 72, date: 100});

        const screen = await render(<Chart id="chart"/>);

        expect(screen.getByRole('button', {name: 'charts.updateValueButton'})).toBeTruthy();
    });

    test('deletes a chart without navigating', async () => {
        const screen = await render(<Chart id="chart"/>);

        await fireEvent.press(screen.getByRole('button', {name: 'charts.deleteButton'}));

        expect(run).toHaveBeenCalledTimes(1);
        expect(removeChart).toHaveBeenCalledWith('chart');
        expect(navigate).not.toHaveBeenCalled();
    });

    test('disables actions while a mutation is pending', async () => {
        jest.mocked(useStorageMutation).mockReturnValue({run, isPending: true});

        const screen = await render(<Chart id="chart"/>);

        expect(screen.getByRole('button', {name: 'charts.addValueButton'}).props.accessibilityState.disabled).toBe(true);
        expect(screen.getByRole('button', {name: 'charts.deleteButton'}).props.accessibilityState.disabled).toBe(true);
    });

    test('passes no chart data while values are loading', async () => {
        jest.mocked(useChartValues).mockReturnValue(undefined);

        const screen = await render(<Chart id="chart"/>);

        expect(screen.getByTestId('line-chart').props.data).toBeUndefined();
    });
});
