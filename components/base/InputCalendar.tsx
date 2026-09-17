import type { CalendarDate } from "@/types/calendar";
import { getLocalDateTimestamp, toDateString } from "@/utils/time";
import { useCallback, useMemo } from "react";
import Calendar from "./Calendar";
import Text from "./Text";
import View from "./View";

type Props = {
    label: string;
    value?: number;
    setValue: (v: number) => void;
};

function InputCalendar({
    label,
    value,
    setValue,
}: Props) {
    let dateString = '';
    if (value) {
        dateString = toDateString(value);
    }
    
    const selectedDates = useMemo(() => {
        return dateString ? [dateString] : [];
    }, [dateString]);

    const onDayPress = useCallback((date: CalendarDate) => {
        setValue(getLocalDateTimestamp(date))
    }, [setValue]);

    return (
        <View>
            <Text context='foreground'>{label}</Text>
            <Calendar
                onDayPress={onDayPress}
                selectedDates={selectedDates}
                initialDate={dateString}
            />
        </View>
    );
}

export default InputCalendar;
