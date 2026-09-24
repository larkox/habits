import { render } from '@testing-library/react-native';
import { LocaleConfig } from 'react-native-calendars';

import { useThemeColor } from '@/hooks/useThemeColor';
import { useSystemCalendarSettings } from '@/platform/localization';
import { useTranslationLanguage } from '@/platform/translations';

import Calendar from './Calendar';

jest.mock('react-native-calendars', () => ({
    Calendar: (props: object) => {
        const {createElement} = jest.requireActual<typeof import('react')>('react');
        return createElement('NativeCalendar', {...props, testID: 'native-calendar'});
    },
    LocaleConfig: {
        defaultLocale: 'en',
        locales: {},
    },
}));
jest.mock('@/hooks/useThemeColor', () => ({useThemeColor: jest.fn()}));
jest.mock('@/platform/localization', () => ({useSystemCalendarSettings: jest.fn()}));
jest.mock('@/platform/translations', () => ({useTranslationLanguage: jest.fn()}));
const mockedThemeColor = jest.mocked(useThemeColor);
beforeEach(() => {
    jest.clearAllMocks();
    mockedThemeColor.mockImplementation(color => `color-${color}`);
    jest.mocked(useSystemCalendarSettings).mockReturnValue({firstDayOfWeek: 1});
    jest.mocked(useTranslationLanguage).mockReturnValue('en');
});

describe('Calendar', () => {
    test('maps selected dates, theme colors, and calendar callbacks', async () => {
        const onDayPress = jest.fn();
        const onMonthChange = jest.fn();
        const screen = await render(<Calendar
            initialDate="2026-09-21"
            selectedDates={['2026-09-20', '2026-09-21']}
            onDayPress={onDayPress}
            onMonthChange={onMonthChange}
        />);
        const calendar = screen.getByTestId('native-calendar');

        calendar.props.onDayPress({year: 2026, month: 9, day: 21, timestamp: 0, dateString: ''});
        calendar.props.onMonthChange({year: 2026, month: 10, day: 1, timestamp: 0, dateString: ''});

        expect(calendar.props.markedDates).toEqual({
            '2026-09-20': {selected: true},
            '2026-09-21': {selected: true},
        });
        expect(calendar.props.theme.calendarBackground).toBe('color-foreground');
        expect(calendar.props.firstDay).toBe(1);
        expect(LocaleConfig.defaultLocale).toBe('en');
        expect(onDayPress).toHaveBeenCalledWith({year: 2026, month: 9, day: 21});
        expect(onMonthChange).toHaveBeenCalledWith({year: 2026, month: 10, day: 1});
    });

    test('uses Spanish calendar labels with the Spanish app language', async () => {
        jest.mocked(useTranslationLanguage).mockReturnValue('es');

        await render(<Calendar/>);

        expect(LocaleConfig.defaultLocale).toBe('es');
        expect(LocaleConfig.locales.es.monthNames[0]).toBe('enero');
    });

    test('does not select days in read-only mode', async () => {
        const onDayPress = jest.fn();
        const screen = await render(<Calendar
            readOnly
            onDayPress={onDayPress}
        />);
        const calendar = screen.getByTestId('native-calendar');

        calendar.props.onDayPress({year: 2026, month: 9, day: 21});

        expect(calendar.props.disableAllTouchEvents).toBe(true);
        expect(onDayPress).not.toHaveBeenCalled();
    });
});
