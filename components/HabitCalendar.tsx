import useCalendarTheme from "@/hooks/useCalendarTheme"
import { useHabitCalendar } from "@/store/hooks"
import { getMonthStart, toDateString } from "@/utils/time"
import { ComponentProps, useCallback, useMemo, useState } from "react"
import { Calendar, DateData } from "react-native-calendars"

type Props = {
    id: string;
}

function HabitCalendar({
    id,
}: Props) {
    const calendarTheme = useCalendarTheme();
    const [monthStart, setMonthStart] = useState(() => getMonthStart())
    const events = useHabitCalendar(id, monthStart);
    const onMonthChange = useCallback((date: DateData) => {
        setMonthStart(getMonthStart(date.timestamp));
    }, [])

    const markedDates = useMemo(() => {
        return events?.reduce<ComponentProps<typeof Calendar>['markedDates']>((acc, v) => {
            acc![toDateString(v.date)] = {selected: true};
            return acc;
        }, {})
    }, [events])

    return (
        <Calendar
            disableAllTouchEvents={true}
            markedDates={markedDates}
            onMonthChange={onMonthChange}
            theme={calendarTheme}
        />
    )
}

export default HabitCalendar;