import { render } from '@testing-library/react-native';

import { useFridgeFood } from '@/store/hooks';

import FoodList from './FoodList';

jest.mock('@/store/hooks', () => ({useFridgeFood: jest.fn()}));
jest.mock('./Food', () => ({id}: {id: string}) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('ListItem', {id, testID: 'list-item'});
});

async function dataOf(component: React.ReactElement) {
    const screen = await render(component);
    return screen.queryAllByTestId('list-item').map(item => item.props.id);
}

describe('FoodList', () => {
    test('shows an empty list while food is loading', async () => {
        jest.mocked(useFridgeFood).mockReturnValue(undefined);

        await expect(dataOf(<FoodList/>)).resolves.toEqual([]);
    });

    test('FoodList orders food by expiry date', async () => {
        jest.mocked(useFridgeFood).mockReturnValue([{id: 'late', name: 'Late', date: 2}, {id: 'early', name: 'Early', date: 1}]);
        await expect(dataOf(<FoodList/>)).resolves.toEqual(['early', 'late']);
    });
});
