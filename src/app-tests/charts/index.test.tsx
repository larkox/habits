import { render } from '@testing-library/react-native';

import Screen from '@/app/(tabs)/charts/index';

jest.mock('@/components/base/View', () => (props: object) => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('View', {...props, testID: 'screen-view'});
});
jest.mock('@/components/ChartList', () => () => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return createElement('ChartList', {testID: 'list'});
});

describe('charts index screen', () => {
    test('shows the ChartList on the background surface', async () => {
        const screen = await render(<Screen/>);
        expect(screen.getByTestId('list')).toBeTruthy();
        expect(screen.getByTestId('screen-view').props.color).toBe('background');
    });
});
