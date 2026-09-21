import { useCallback, useMemo } from "react";

import { Calendar as NativeCalendar } from "react-native-calendars";
import type { DateData } from "react-native-calendars";

import { useThemeColor } from "@/hooks/useThemeColor";
import type { CalendarDate } from "@/types/calendar";

export type CalendarProps = {
    /** Local calendar date in YYYY-MM-DD format. */
    initialDate?: string;
    /** Local calendar dates in YYYY-MM-DD format. */
    selectedDates?: readonly string[];
    /** Disable day selection while keeping month navigation available. */
    readOnly?: boolean;
    onDayPress?: (date: CalendarDate) => void;
    onMonthChange?: (date: CalendarDate) => void;
};

export default function Calendar({
    initialDate,
    selectedDates,
    readOnly = false,
    onDayPress,
    onMonthChange,
}: CalendarProps) {
    const calendarBackground = useThemeColor('foreground');
    const arrowColor = useThemeColor('button');
    const monthTextColor = useThemeColor('foregroundText');
    const dayTextColor = useThemeColor('foregroundText');
    const textDisabledColor = useThemeColor('placeholderText');
    const todayTextColor = useThemeColor('link');
    const selectedDayBackgroundColor = useThemeColor('foregroundDone');
    const selectedDayTextColor = useThemeColor('foregroundDoneText');
    const theme = useMemo(() => ({
        calendarBackground,
        arrowColor,
        monthTextColor,
        dayTextColor,
        textDisabledColor,
        todayTextColor,
        selectedDayBackgroundColor,
        selectedDayTextColor,
    }), [arrowColor, calendarBackground, dayTextColor, monthTextColor, selectedDayBackgroundColor, selectedDayTextColor, textDisabledColor, todayTextColor]);

    const markedDates = useMemo(() => {
        return selectedDates?.reduce<Record<string, {selected: true}>>((dates, date) => {
            dates[date] = {selected: true};
            return dates;
        }, {});
    }, [selectedDates]);

    const handleDayPress = useCallback(({year, month, day}: DateData) => {
        if (!readOnly) {
            onDayPress?.({year, month, day});
        }
    }, [onDayPress, readOnly]);

    const handleMonthChange = useCallback(({year, month, day}: DateData) => {
        onMonthChange?.({year, month, day});
    }, [onMonthChange]);

    return (
        <NativeCalendar
            initialDate={initialDate}
            markedDates={markedDates}
            disableAllTouchEvents={readOnly}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            theme={theme}
        />
    );
}
