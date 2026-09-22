import { render } from '@testing-library/react-native';

import Screen from '@/app/(tabs)/birthdays/index';

jest.mock('@/components/base/View', () => (props: object) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('View', {...props, testID: 'screen-view'});
});
jest.mock('@/components/BirthdayList', () => () => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('BirthdayList', {testID: 'list'});
});

describe('birthdays index screen', () => {
    test('shows the BirthdayList on the background surface', async () => {
        const screen = await render(<Screen/>);
        expect(screen.getByTestId('list')).toBeTruthy();
        expect(screen.getByTestId('screen-view').props.color).toBe('background');
    });
});
