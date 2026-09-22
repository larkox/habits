import { render } from '@testing-library/react-native';

import { useHabitList } from '@/store/hooks';
import { getDue, isDone } from '@/utils/time';

import HabitList from './HabitList';

jest.mock('@/store/hooks', () => ({useHabitList: jest.fn()}));
jest.mock('@/utils/time', () => ({getDue: jest.fn(), isDone: jest.fn()}));
jest.mock('./Habit', () => ({id}: {id: string}) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('ListItem', {id, testID: 'list-item'});
});

async function dataOf(component: React.ReactElement) {
    const screen = await render(component);
    return screen.queryAllByTestId('list-item').map(item => item.props.id);
}

describe('HabitList', () => {
    test('shows no habits while storage is loading', async () => {
        jest.mocked(useHabitList).mockReturnValue(undefined);

        await expect(dataOf(<HabitList/>)).resolves.toEqual([]);
    });

    test('keeps a completed habit after unfinished habits even if its due value is earlier', async () => {
        jest.mocked(useHabitList).mockReturnValue([
            {id: 'pending', title: 'Pending', lastDone: 1, periodicity: 1},
            {id: 'done', title: 'Done', lastDone: 3, periodicity: 1},
            {id: 'pending-later', title: 'Pending later', lastDone: 2, periodicity: 1},
        ]);
        jest.mocked(isDone).mockImplementation(date => date === 3);
        jest.mocked(getDue).mockImplementation(date => date === 3 ? -10 : date);

        await expect(dataOf(<HabitList/>)).resolves.toEqual(['pending', 'pending-later', 'done']);
    });

    test('puts unfinished habits first and then orders by due date', async () => {
        const habits = [
            {id: 'done', title: 'Done', lastDone: 3, periodicity: 1},
            {id: 'later', title: 'Later', lastDone: 2, periodicity: 1},
            {id: 'sooner', title: 'Sooner', lastDone: 1, periodicity: 1},
        ];
        jest.mocked(useHabitList).mockReturnValue(habits);
        jest.mocked(isDone).mockImplementation(date => date === 3);
        jest.mocked(getDue).mockImplementation(date => date);
        await expect(dataOf(<HabitList/>)).resolves.toEqual(['sooner', 'later', 'done']);
    });
});
