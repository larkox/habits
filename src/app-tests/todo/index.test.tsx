import { render } from '@testing-library/react-native';

import Screen from '@/app/(tabs)/todo/index';

jest.mock('@/components/base/View', () => (props: object) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('View', {...props, testID: 'screen-view'});
});
jest.mock('@/components/TodoList', () => () => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('TodoList', {testID: 'list'});
});

describe('todo index screen', () => {
    test('shows the TodoList on the background surface', async () => {
        const screen = await render(<Screen/>);
        expect(screen.getByTestId('list')).toBeTruthy();
        expect(screen.getByTestId('screen-view').props.color).toBe('background');
    });
});
