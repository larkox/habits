import { render } from '@testing-library/react-native';

import { useBirthdays } from '@/store/hooks';
import { getNextMonthAndDay } from '@/utils/time';

import BirthdayList from './BirthdayList';

jest.mock('@/store/hooks', () => ({useBirthdays: jest.fn()}));
jest.mock('@/utils/time', () => ({getNextMonthAndDay: jest.fn()}));
jest.mock('./BirthdayElement', () => ({id}: {id: string}) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('ListItem', {id, testID: 'list-item'});
});

async function dataOf(component: React.ReactElement) {
    const screen = await render(component);
    return screen.queryAllByTestId('list-item').map(item => item.props.id);
}

describe('BirthdayList', () => {
    test('shows an empty list while birthdays are loading', async () => {
        jest.mocked(useBirthdays).mockReturnValue(undefined);

        await expect(dataOf(<BirthdayList/>)).resolves.toEqual([]);
    });

    test('orders by the next birthday, regardless of birth year', async () => {
        jest.mocked(useBirthdays).mockReturnValue([
            {id: 'older-but-later', name: 'Older', date: '12-10', year: 1900},
            {id: 'younger-but-sooner', name: 'Younger', date: '09-22', year: 2020},
        ]);
        jest.mocked(getNextMonthAndDay).mockImplementation(date => date === '09-22' ? 1 : 2);

        await expect(dataOf(<BirthdayList/>)).resolves.toEqual(['younger-but-sooner', 'older-but-later']);
        expect(getNextMonthAndDay).toHaveBeenCalledWith('12-10');
        expect(getNextMonthAndDay).toHaveBeenCalledWith('09-22');
    });
});
