import { render } from '@testing-library/react-native';

import { Colors } from '@/constants/Colors';

import Chart from './Chart';

jest.mock('react-native-gifted-charts', () => ({
    LineChart: (props: object) => {
        const {createElement} = jest.requireActual<typeof import('react')>('react');
        return createElement('LineChart', {...props, testID: 'line-chart'});
    },
}));

test('pass through the data', async () => {
    const data = [{value: 1, label: 'test1'}, {value: 2, label: 'test2'}];
    const screen = await render(<Chart data={data}/>);

    const chart = screen.getByTestId('line-chart')
    expect(chart).toBeTruthy();
    expect(chart.props.data).toBe(data);
});

test('pass correct styles', async () => {
    const data = [{value: 1, label: 'test1'}, {value: 2, label: 'test2'}];
    const screen = await render(<Chart data={data}/>);
    const baseColor = Colors.light.foregroundText;
    const rulesColor = Colors.light.placeholderText;

    const chart = screen.getByTestId('line-chart')
    expect(chart).toBeTruthy();
    expect(chart.props.xAxisLabelTextStyle.color).toBe(baseColor);
    expect(chart.props.yAxisTextStyle.color).toBe(baseColor);
    expect(chart.props.color).toBe(baseColor);
    expect(chart.props.xAxisColor).toBe(baseColor);
    expect(chart.props.yAxisColor).toBe(baseColor);
    expect(chart.props.dataPointsColor).toBe(baseColor);
    expect(chart.props.rulesColor).toBe(rulesColor);
});
