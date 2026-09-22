import { render } from '@testing-library/react-native';

import { useChartIds } from '@/store/hooks';

import ChartList from './ChartList';

jest.mock('@/store/hooks', () => ({useChartIds: jest.fn()}));
jest.mock('./Chart', () => ({id}: {id: string}) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('ListItem', {id, testID: 'list-item'});
});

async function dataOf(component: React.ReactElement) {
    const screen = await render(component);
    return screen.queryAllByTestId('list-item').map(item => item.props.id);
}

describe('ChartList', () => {
    test('ChartList forwards chart ids unchanged', async () => {
        jest.mocked(useChartIds).mockReturnValue(['one', 'two']);
        await expect(dataOf(<ChartList/>)).resolves.toEqual(['one', 'two']);
    });
});
