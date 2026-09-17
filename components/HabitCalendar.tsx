import Calendar from "@/components/base/Calendar"
import type { CalendarDate } from "@/types/calendar"
import { useHabitCalendar } from "@/store/hooks"
import { getMonthStart, toDateString } from "@/utils/time"
import { useCallback, useMemo, useState } from "react"

type Props = {
    id: string;
}

function HabitCalendar({
    id,
}: Props) {
    const [monthStart, setMonthStart] = useState(() => getMonthStart())
    const events = useHabitCalendar(id, monthStart);
    const onMonthChange = useCallback((date: CalendarDate) => {
        setMonthStart(getMonthStart(date));
    }, [])

    const selectedDates = useMemo(() => {
        return events?.map((event) => toDateString(event.date));
    }, [events])

    return (
        <Calendar
            readOnly
            selectedDates={selectedDates}
            onMonthChange={onMonthChange}
        />
    )
}

export default HabitCalendar;
