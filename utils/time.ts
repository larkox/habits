import type { CalendarDate } from "@/types/calendar";

export function getStartOfDay() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
}

// Calendar timestamps are UTC midnight; preserve the selected local calendar day.
export function getLocalDateTimestamp({year, month, day}: CalendarDate) {
    const date = new Date(0);
    date.setFullYear(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}

export function getYesterday() {
    const now = Date.now();
    const yesterday = new Date(now - DAY_IN_MILLIS);
    yesterday.setHours(0, 0, 0, 0);
    return yesterday.getTime();
}

const DAY_IN_MILLIS = 1000 * 60 * 60 * 24;
export function getDue(lastDone: number, periodicity: number) {
    const now = getStartOfDay();
    const diff = Math.round((lastDone - now)/DAY_IN_MILLIS);
    return diff + periodicity;
}

export function isDone(lastDone: number) {
    return lastDone === getStartOfDay();
}

export function getMonthStart(date?: CalendarDate) {
    const now = new Date();
    return getLocalDateTimestamp({
        year: date?.year ?? now.getFullYear(),
        month: date?.month ?? now.getMonth() + 1,
        day: 1,
    });
}

// If we are at the month start, we are sure that 32 days later it is the next month
const MONTH_IN_MILLIS = DAY_IN_MILLIS * 32

export function getMonthEnd(timestamp: number) {
    const nextMonth = new Date(timestamp + MONTH_IN_MILLIS)
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);
    return nextMonth.getTime();
}

export function toDateString(timestamp: number) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth()+1).toString(10).padStart(2, '0');
    const day = date.getDate().toString(10).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getMonthAndDay(timestamp: number) {
    const date = new Date(timestamp);
    const month = (date.getMonth()+1).toString(10).padStart(2, '0');
    const day = date.getDate().toString(10).padStart(2, '0');
    return `${month}-${day}`;
}

export function getNextMonthAndDay(monthAndDay: string) {
    const splitted = monthAndDay.split('-');
    const month = parseInt(splitted[0], 10)-1;
    const day = parseInt(splitted[1], 10);
    const today = getStartOfDay();
    const date = new Date(getStartOfDay());
    const thisYear = date.getFullYear();
    date.setFullYear(thisYear, month, day);
    if (date.valueOf() < today) {
        date.setFullYear(date.getFullYear()+1);
    }

    return date.valueOf();
}
