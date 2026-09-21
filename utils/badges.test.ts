import type { Birthday, FridgeFood, Todo } from '@/types/model';
import { getBirthdayBadge, getFridgeBadge, getTodoBadge } from '@/utils/badges';

function localDate(year: number, month: number, day: number) {
    return new Date(year, month - 1, day).getTime();
}

function todo(id: string, date: number): Todo {
    return {id, name: id, date};
}

function food(id: string, date: number): FridgeFood {
    return {id, name: id, date};
}

function birthday(id: string, date: string): Birthday {
    return {id, name: id, date, year: 2000};
}

describe('todo badges', () => {
    const today = localDate(2026, 9, 21);

    test('hides the badge when there are no todos', () => {
        expect(getTodoBadge(undefined, today)).toBeUndefined();
        expect(getTodoBadge([], today)).toBeUndefined();
    });

    test('shows all pending todos as neutral when none are due within a week', () => {
        const todos = [todo('a', localDate(2026, 9, 29)), todo('b', localDate(2026, 10, 1))];
        expect(getTodoBadge(todos, today)).toEqual({count: 2, urgency: 'neutral'});
    });

    test('shows only todos due within seven days as warning', () => {
        const todos = [todo('a', localDate(2026, 9, 22)), todo('b', localDate(2026, 9, 28)), todo('c', localDate(2026, 9, 29))];
        expect(getTodoBadge(todos, today)).toEqual({count: 2, urgency: 'warning'});
    });

    test('prioritizes todos due today or overdue', () => {
        const todos = [todo('overdue', localDate(2026, 9, 20)), todo('today', today), todo('soon', localDate(2026, 9, 22))];
        expect(getTodoBadge(todos, today)).toEqual({count: 2, urgency: 'imminent'});
    });
});

describe('birthday badges', () => {
    const today = localDate(2026, 12, 28);

    test('hides the badge when no birthday is within seven days', () => {
        expect(getBirthdayBadge(undefined, today)).toBeUndefined();
        expect(getBirthdayBadge([birthday('later', '01-05')], today)).toBeUndefined();
    });

    test('counts birthdays within seven days across the year boundary', () => {
        const birthdays = [birthday('one', '12-30'), birthday('two', '01-04'), birthday('later', '01-05')];
        expect(getBirthdayBadge(birthdays, today)).toEqual({count: 2, urgency: 'neutral'});
    });

    test('prioritizes birthdays today', () => {
        const birthdays = [birthday('today-one', '12-28'), birthday('today-two', '12-28'), birthday('soon', '12-30')];
        expect(getBirthdayBadge(birthdays, today)).toEqual({count: 2, urgency: 'warning'});
    });
});

describe('fridge badges', () => {
    const today = localDate(2026, 9, 21);

    test('hides the badge when nothing expires within three days', () => {
        expect(getFridgeBadge(undefined, today)).toBeUndefined();
        expect(getFridgeBadge([food('later', localDate(2026, 9, 25))], today)).toBeUndefined();
    });

    test('counts food expiring within three days as warning', () => {
        const foods = [food('tomorrow', localDate(2026, 9, 22)), food('third-day', localDate(2026, 9, 24)), food('later', localDate(2026, 9, 25))];
        expect(getFridgeBadge(foods, today)).toEqual({count: 2, urgency: 'warning'});
    });

    test('prioritizes food expiring today or already expired', () => {
        const foods = [food('expired', localDate(2026, 9, 20)), food('today', today), food('soon', localDate(2026, 9, 22))];
        expect(getFridgeBadge(foods, today)).toEqual({count: 2, urgency: 'imminent'});
    });
});
