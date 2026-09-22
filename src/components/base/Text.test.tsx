import { render } from '@testing-library/react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

import Text from './Text';

jest.mock('@/hooks/useThemeColor', () => ({useThemeColor: jest.fn()}));
const mockedThemeColor = jest.mocked(useThemeColor);
beforeEach(() => {
    jest.clearAllMocks();
    mockedThemeColor.mockImplementation(color => `color-${color}`);
});

describe('Text', () => {
    test.each([
        ['foreground', 'foregroundText'],
        ['foregroundDone', 'foregroundDoneText'],
        ['foregroundOverdue', 'foregroundOverdueText'],
        ['button', 'buttonText'],
        ['disabledButton', 'disabledButtonText'],
    ] as const)('renders %s text with its context color and default style', async (context, color) => {
        const screen = await render(<Text context={context}>Label</Text>);

        expect(screen.getByText('Label')).toHaveStyle({
            color: `color-${color}`,
            fontSize: 16,
            lineHeight: 24,
        });
    });

    test.each([
        ['defaultSemiBold', 16, 24, '600'],
        ['title', 32, 32, 'bold'],
        ['subtitle', 20, undefined, 'bold'],
    ] as const)('renders the %s text style', async (type, fontSize, lineHeight, fontWeight) => {
        const screen = await render(<Text
            context="foreground"
            type={type}
        >
            Label
        </Text>);

        expect(screen.getByText('Label')).toHaveStyle({
            color: 'color-foregroundText',
            fontSize,
            fontWeight,
        });
        if (lineHeight !== undefined) {
            expect(screen.getByText('Label')).toHaveStyle({lineHeight});
        }
    });

    test('link styling overrides the context color', async () => {
        const screen = await render(<Text
            context="foregroundOverdue"
            type="link"
        >
            Help
        </Text>);

        expect(screen.getByText('Help')).toHaveStyle({
            color: 'color-link',
            fontSize: 16,
            lineHeight: 30,
        });
    });
});
