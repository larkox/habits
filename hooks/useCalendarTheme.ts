import { ComponentProps, useMemo } from "react";
import { Calendar } from "react-native-calendars";
import { useThemeColor } from "./useThemeColor";

function useCalendarTheme() {
    const calendarBackground = useThemeColor('foreground');
    const arrowColor = useThemeColor('button')
    const monthTextColor = useThemeColor('foregroundText');
    const selectedDayBackgroundColor = useThemeColor('foregroundDone');
    const selectedDayTextColor = useThemeColor('foregroundDoneText');
    return useMemo((): ComponentProps<typeof Calendar>['theme']  => ({
        calendarBackground,
        arrowColor,
        monthTextColor,
        selectedDayBackgroundColor,
        selectedDayTextColor,
    }), [arrowColor, calendarBackground, monthTextColor, selectedDayBackgroundColor, selectedDayTextColor]);
}

export default useCalendarTheme;
