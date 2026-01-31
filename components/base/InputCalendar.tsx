import useCalendarTheme from "@/hooks/useCalendarTheme";
import { toDateString } from "@/utils/time";
import { useCallback, useMemo } from "react";
import { Calendar, DateData } from "react-native-calendars";
import { MarkedDates } from "react-native-calendars/src/types";
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
    const calendarTheme = useCalendarTheme()
    let dateString = '';
    if (value) {
        dateString = toDateString(value);
    }
    
    const markedDates = useMemo<MarkedDates|undefined>(() => {
        if (!dateString) {
            return undefined;
        }

        return {[dateString]: {selected: true}}
    }, [dateString]);

    const onDayPress = useCallback((date: DateData) => {
        setValue(date.timestamp)
    }, [setValue]);

    return (
        <View>
            <Text context='foreground'>{label}</Text>
            <Calendar
                onDayPress={onDayPress}
                markedDates={markedDates}
                theme={calendarTheme}
                initialDate={dateString}
            />
        </View>
    );
}

export default InputCalendar;