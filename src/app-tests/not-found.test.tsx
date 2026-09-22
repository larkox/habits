import { render } from '@testing-library/react-native';

import NotFoundScreen from '@/app/+not-found';

jest.mock('expo-router', () => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return {
        Stack: {Screen: (props: object) => createElement('StackScreen', {...props, testID: 'screen'})},
        Link: (props: object) => createElement('Link', {...props, testID: 'home-link'}),
    };
});

test('offers a link back to home for unknown routes', async () => {
    const screen = await render(<NotFoundScreen/>);
    expect(screen.getByText('This screen does not exist.')).toBeTruthy();
    expect(screen.getByTestId('home-link').props.href).toBe('/');
});
