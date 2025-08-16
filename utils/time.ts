export function getStartOfDay() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
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

export function getMonthStart(timestamp?: number) {
    const now = timestamp ? new Date(timestamp) : new Date();
    now.setDate(1)
    now.setHours(0, 0, 0, 0);
    return now.getTime();
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
