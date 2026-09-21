import type { Birthday, FridgeFood, Todo } from '@/types/model';
import { getNextMonthAndDay } from '@/utils/time';

export type ReminderBadge = {
    count: number;
    urgency: 'neutral' | 'warning' | 'imminent';
};

function dayAfter(today: number, days: number) {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date.getTime();
}

export function getTodoBadge(todos: readonly Todo[] | undefined, today: number): ReminderBadge | undefined {
    if (!todos?.length) {
        return undefined;
    }
    const imminent = todos.filter(todo => todo.date < dayAfter(today, 1)).length;
    if (imminent) {
        return { count: imminent, urgency: 'imminent' };
    }
    const upcoming = todos.filter(todo => todo.date < dayAfter(today, 8)).length;
    if (upcoming) {
        return { count: upcoming, urgency: 'warning' };
    }
    return { count: todos.length, urgency: 'neutral' };
}

export function getBirthdayBadge(birthdays: readonly Birthday[] | undefined, today: number): ReminderBadge | undefined {
    const dates = birthdays?.map(birthday => getNextMonthAndDay(birthday.date, today)) ?? [];
    const imminent = dates.filter(date => date === today).length;
    if (imminent) {
        return { count: imminent, urgency: 'warning' };
    }
    const upcoming = dates.filter(date => date < dayAfter(today, 8)).length;
    return upcoming ? { count: upcoming, urgency: 'neutral' } : undefined;
}

export function getFridgeBadge(foods: readonly FridgeFood[] | undefined, today: number): ReminderBadge | undefined {
    const imminent = foods?.filter(food => food.date < dayAfter(today, 1)).length ?? 0;
    if (imminent) {
        return { count: imminent, urgency: 'imminent' };
    }
    const upcoming = foods?.filter(food => food.date < dayAfter(today, 4)).length ?? 0;
    return upcoming ? { count: upcoming, urgency: 'warning' } : undefined;
}
