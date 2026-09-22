import { render } from '@testing-library/react-native';

import { useTodos } from '@/store/hooks';

import TodoList from './TodoList';

jest.mock('@/store/hooks', () => ({useTodos: jest.fn()}));
jest.mock('./TodoElement', () => ({id}: {id: string}) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('ListItem', {id, testID: 'list-item'});
});

async function dataOf(component: React.ReactElement) {
    const screen = await render(component);
    return screen.queryAllByTestId('list-item').map(item => item.props.id);
}

describe('TodoList', () => {
    test('TodoList orders todos by date', async () => {
        jest.mocked(useTodos).mockReturnValue([{id: 'late', name: 'Late', date: 2}, {id: 'early', name: 'Early', date: 1}]);
        await expect(dataOf(<TodoList/>)).resolves.toEqual(['early', 'late']);
    });

    test('lists use empty data while storage is loading', async () => {
        jest.mocked(useTodos).mockReturnValue(undefined);
        await expect(dataOf(<TodoList/>)).resolves.toEqual([]);
    });
});
