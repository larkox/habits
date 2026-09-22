import { render } from '@testing-library/react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

import Loader from './Loader';

jest.mock('@/hooks/useThemeColor', () => ({useThemeColor: jest.fn()}));
const mockedThemeColor = jest.mocked(useThemeColor);
beforeEach(() => {
    jest.clearAllMocks();
    mockedThemeColor.mockImplementation(color => `color-${color}`);
});

describe('Loader', () => {
    test('Loader uses the themed button color', async () => {
        const screen = await render(<Loader/>);
        expect(screen.getByLabelText('loading').props.color).toBe('color-button');
    });
});
