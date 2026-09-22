import { render } from '@testing-library/react-native';

import TabLayout from '@/app/(tabs)/_layout';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import useCurrentDay from '@/hooks/useCurrentDay';
import { useBirthdays, useFridgeFood, useTodos } from '@/store/hooks';
import { getBirthdayBadge, getFridgeBadge, getTodoBadge } from '@/utils/badges';

jest.mock('expo-router', () => {
    const {createElement} = jest.requireActual<typeof import('react')>('react');
    return {Tabs: Object.assign(
        (props: object) => createElement('Tabs', {...props, testID: 'tabs'}),
        {Screen: (props: object & {name: string}) => createElement('TabsScreen', {...props, testID: props.name})},
    )};
});
jest.mock('react-i18next', () => ({useTranslation: () => [(key: string) => key]}));
jest.mock('@/hooks/useColorScheme', () => ({useColorScheme: jest.fn()}));
jest.mock('@/hooks/useCurrentDay', () => jest.fn());
jest.mock('@/store/hooks', () => ({useBirthdays: jest.fn(), useFridgeFood: jest.fn(), useTodos: jest.fn()}));
jest.mock('@/utils/badges', () => ({getBirthdayBadge: jest.fn(), getFridgeBadge: jest.fn(), getTodoBadge: jest.fn()}));

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useColorScheme).mockReturnValue('light');
    jest.mocked(useCurrentDay).mockReturnValue(1000);
    jest.mocked(useTodos).mockReturnValue([]);
    jest.mocked(useBirthdays).mockReturnValue([]);
    jest.mocked(useFridgeFood).mockReturnValue([]);
});

describe('tab layout', () => {
    test('shows all six routes without badges when none are due', async () => {
        const screen = await render(<TabLayout/>);
        for (const name of ['habits', 'todo', 'fridge', 'birthdays', 'charts', 'data']) {
            expect(screen.getByTestId(name).props.options.title).toBe(`tabs.${name}`);
        }
        for (const name of ['todo', 'fridge', 'birthdays']) {
            expect(screen.getByTestId(name).props.options.tabBarBadge).toBeUndefined();
        }
        expect(getTodoBadge).toHaveBeenCalledWith([], 1000);
        expect(getFridgeBadge).toHaveBeenCalledWith([], 1000);
        expect(getBirthdayBadge).toHaveBeenCalledWith([], 1000);
        expect(screen.getByTestId('tabs').props.screenOptions.tabBarActiveTintColor).toBe(Colors.light.selectedTabTint);
    });

    test('uses themed colors for each urgency', async () => {
        jest.mocked(useColorScheme).mockReturnValue('dark');
        jest.mocked(getTodoBadge).mockReturnValue({count: 2, urgency: 'neutral'});
        jest.mocked(getBirthdayBadge).mockReturnValue({count: 1, urgency: 'warning'});
        jest.mocked(getFridgeBadge).mockReturnValue({count: 3, urgency: 'imminent'});
        const screen = await render(<TabLayout/>);
        const cases = [
            ['todo', 2, 'badgeNeutral', 'badgeNeutralText'],
            ['birthdays', 1, 'badgeWarning', 'badgeWarningText'],
            ['fridge', 3, 'badgeImminent', 'badgeImminentText'],
        ] as const;
        for (const [name, count, background, foreground] of cases) {
            const options = screen.getByTestId(name).props.options;
            expect(options.tabBarBadge).toBe(count);
            expect(options.tabBarBadgeStyle).toEqual({backgroundColor: Colors.dark[background], color: Colors.dark[foreground]});
        }
        expect(screen.getByTestId('tabs').props.screenOptions.tabBarActiveTintColor).toBe(Colors.dark.selectedTabTint);
    });
});
