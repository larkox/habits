import { Birthday, Chart, ChartValue, FridgeFood, Habit, Todo } from "@/types/model";
import type { Result } from "@/types/result";
import { newId } from "@/utils/crypto";
import { logError } from "@/utils/log";
import { getMonthEnd, getStartOfDay, getYesterday } from "@/utils/time";

import { getDatabase } from "./db";
import { sendAddBirthdayEvents, sendAddChartEvents, sendAddChartValueEvents, sendAddEvents, sendAddFridgeFoodEvents, sendAddTodoEvents, sendRemoveBirthdayEvents, sendRemoveChartEvents, sendRemoveEvents, sendRemoveFridgeFoodEvents, sendRemoveTodoEvents, sendUpdateBirthdayEvents, sendUpdateEvents, sendUpdateFridgeFoodEvents, sendUpdateTodoEvents } from "./events";
import { withWriteTransaction } from './transactions';

export async function getAllHabits() {
    try {
        const db = await getDatabase();
        const habits = await db.getAllAsync<Habit>('SELECT id, title, periodicity, lastDone FROM habits')
        return habits;
    } catch (error) {
        logError('error getting all habits', error);
    }
}

export async function getHabit(id: string) {
    try {
        const db = await getDatabase();
        const habit = await db.getFirstAsync<Habit>('SELECT id, title, periodicity, lastDone FROM habits WHERE id = ?', id)
        if (!habit) {
            return undefined;
        }
        return habit;
    } catch (error) {
        logError('error getting a habit', error);
    }
}

export async function getHabitCalendar(id: string, monthStart: number) {
    try {
        const db = await getDatabase();
        const monthEnd = getMonthEnd(monthStart);
        const dates = await db.getAllAsync<{date: number}>('SELECT date FROM habitHistory WHERE habitId = ? AND date >= ? AND date < ?', id, monthStart, monthEnd);
        return dates;
    } catch (error) {
        logError('error getting habit calendar', error);
    }
}

export async function doHabit(id: string): Promise<Result> {
    try {
        const db = await getDatabase();
        const date = getStartOfDay();
        await withWriteTransaction(db, async (transaction) => {
            await transaction.runAsync(
                `INSERT INTO habitHistory (id, habitId, date)
                 VALUES (?, ?, ?)
                 ON CONFLICT(habitId, date) DO NOTHING`,
                newId(),
                id,
                date,
            );
            await transaction.runAsync(
                'UPDATE habits SET lastDone = ? WHERE id = ?',
                date,
                id,
            );
        });
        sendUpdateEvents(id);
        return { ok: true, value: undefined };
    } catch (error) {
        logError('error doing a habit', error);
        return { ok: false, error: { code: 'storage_error' } };
    }
}

export async function addHabit(title: string, periodicity: number): Promise<Result> {
    try {
        const db = await getDatabase();
        await db.runAsync('INSERT INTO habits (id, title, periodicity, lastDone) VALUES (?, ?, ?, ?)', newId(), title, periodicity, getYesterday())
        sendAddEvents();
        return { ok: true, value: undefined };
    } catch (error) {
        logError('error adding a habit', error)
        return { ok: false, error: { code: 'storage_error' } };
    }
}

export async function updateHabit(id: string, title: string, periodicity: number): Promise<Result> {
    try {
        const db = await getDatabase();
        await db.runAsync('UPDATE habits SET title = ?, periodicity = ? WHERE id = ?', title, periodicity, id);
        sendUpdateEvents(id);
        return { ok: true, value: undefined };
    } catch (error) {
        logError('error updating a habit', error);
        return { ok: false, error: { code: 'storage_error' } };
    }
}

export async function removeHabit(id: string): Promise<Result> {
    try {
        const db = await getDatabase();
        await db.runAsync('DELETE FROM habits WHERE id = ?', id);
        sendRemoveEvents(id);
        return { ok: true, value: undefined };
    } catch (error) {
        logError('error removing a habit', error);
        return { ok: false, error: { code: 'storage_error' } };
    }
}

export async function getAllChartIDs() {
    try {
        const db = await getDatabase();
        const allRows = await db.getAllAsync<{id: string}>('SELECT id FROM charts');
        return allRows.map((v) => v.id);
    } catch (error) {
        logError('error getting chart ids', error);
    }    
}

export async function addChart(title: string): Promise<Result> {
    try {
        const db = await getDatabase();
        await db.runAsync('INSERT INTO charts (id, title) VALUES (?, ?)', newId(), title)
        sendAddChartEvents();
        return { ok: true, value: undefined };
    } catch (error) {
        logError('error adding chart', error);
        return { ok: false, error: { code: 'storage_error' } };
    }
}

export async function removeChart(id: string): Promise<Result> {
    try {
        const db = await getDatabase();
        await db.runAsync('DELETE FROM charts WHERE id = ?', id);
        sendRemoveChartEvents();
        return { ok: true, value: undefined };
    } catch (error) {
        logError('error removing chart', error);
        return { ok: false, error: { code: 'storage_error' } };
    }
}

export async function setChartValue(chartId: string, value: number): Promise<Result> {
    try {
        const db = await getDatabase();
        await db.runAsync(
            `INSERT INTO chart_values (id, chartId, value, date)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(chartId, date)
             DO UPDATE SET value = excluded.value`,
            newId(),
            chartId,
            value,
            getStartOfDay(),
        );
        sendAddChartValueEvents(chartId);
        return { ok: true, value: undefined };
    } catch (error) {
        logError('error setting chart value', error);
        return { ok: false, error: { code: 'storage_error' } };
    }
}

export async function getChart(id: string) {
    try {
        const db = await getDatabase();
        const chart = await db.getFirstAsync<Chart>('SELECT id, title FROM charts WHERE id = ?', id);
        if (!chart) {
            return undefined;
        }
        return chart;
    } catch (error) {
        logError('error getting one chart', error);
        return undefined;
    }
}

export async function getChartValues(chartId: string) {
    try {
        const db = await getDatabase();
        const values = await db.getAllAsync<ChartValue>('SELECT id, chartId, value, date FROM chart_values WHERE chartId = ? ORDER BY date DESC LIMIT 5', chartId)
        return values.reverse();
    } catch (error) {
        logError('error getting chart values', error);
        return [];
    }
}

export async function addFridgeFood(name: string, date: number): Promise<Result> {
    try {
        const db = await getDatabase();
        await db.runAsync('INSERT INTO fridge (id, name, date) VALUES (?, ?, ?)', newId(), name, date);
        sendAddFridgeFoodEvents();
        return { ok: true, value: undefined };
    } catch (error) {
        logError('errror adding fridge food', error);
        return { ok: false, error: { code: 'storage_error' } };
    }
}

export async function getAllFridgeFood() {
    try {
        const db = await getDatabase();
        const values = await db.getAllAsync<FridgeFood>('SELECT id, name, date FROM fridge');
        return values;
    } catch (error) {
        logError('error getting all fridge food', error);
        return [];
    }
}

export async function getFridgeFood(id: string) {
    try {
        const db = await getDatabase();
        const food = await db.getFirstAsync<FridgeFood>('SELECT id, name, date FROM fridge WHERE id = ?', id);
        if (!food) {
            return undefined;
        }
        return food;
    } catch (error) {
        logError('error getting one fridge food', error);
        return undefined;
    }
}

export async function removeFoodFromFridge(id: string): Promise<Result> {
    try {
        const db = await getDatabase();
        await db.runAsync('DELETE FROM fridge WHERE id = ?', id);
        sendRemoveFridgeFoodEvents();
        return { ok: true, value: undefined };
    } catch (error) {
        logError('error removing food from fridge', error);
        return { ok: false, error: { code: 'storage_error' } };
    }
}

export async function updateFoodFromFridge(id: string, name: string, expiryDate: number): Promise<Result> {
    try {
        const db = await getDatabase();
        await db.runAsync('UPDATE fridge SET name = ?, date = ? WHERE id = ?', name, expiryDate, id);
        sendUpdateFridgeFoodEvents(id);
        return { ok: true, value: undefined };
    } catch (error) {
        logError('error updating a food from fridge', error);
        return { ok: false, error: { code: 'storage_error' } };
    }
}

export async function addTodo(name: string, date: number): Promise<Result> {
    try {
        const db = await getDatabase();
        await db.runAsync('INSERT INTO todos (id, name, date) VALUES (?, ?, ?)', newId(), name, date);
        sendAddTodoEvents();
        return { ok: true, value: undefined };
    } catch (error) {
        logError('error adding todo', error);
        return { ok: false, error: { code: 'storage_error' } };
    }
}

export async function getAllTodos() {
    try {
        const db = await getDatabase();
        const values = await db.getAllAsync<Todo>('SELECT id, name, date FROM todos');
        return values;
    } catch (error) {
        logError('error getting all todos', error);
        return [];
    }
}

export async function getTodo(id: string) {
    try {
        const db = await getDatabase();
        const todo = await db.getFirstAsync<Todo>('SELECT id, name, date FROM todos WHERE id = ?', id);
        if (!todo) {
            return undefined;
        }
        return todo;
    } catch (error) {
        logError('error getting one todo', error);
        return undefined;
    }
}

export async function updateTodo(id: string, name: string, date: number): Promise<Result> {
    try {
        const db = await getDatabase();
        await db.runAsync('UPDATE todos SET name = ?, date = ? WHERE id = ?', name, date, id);
        sendUpdateTodoEvents(id);
        return { ok: true, value: undefined };
    } catch (error) {
        logError('error updating a todo', error);
        return { ok: false, error: { code: 'storage_error' } };
    }
}

export async function removeTodo(id: string): Promise<Result> {
    try {
        const db = await getDatabase();
        await db.runAsync('DELETE FROM todos WHERE id = ?', id);
        sendRemoveTodoEvents();
        return { ok: true, value: undefined };
    } catch (error) {
        logError('error removing todo', error);
        return { ok: false, error: { code: 'storage_error' } };
    }
}


export async function addBirthday(name: string, date: string, year: number): Promise<Result> {
    try {
        const db = await getDatabase();
        await db.runAsync('INSERT INTO birthdays (id, name, date, year) VALUES (?, ?, ?, ?)', newId(), name, date, year);
        sendAddBirthdayEvents();
        return { ok: true, value: undefined };
    } catch (error) {
        logError('error adding birthday', error);
        return { ok: false, error: { code: 'storage_error' } };
    }
}

export async function getAllBirthdays() {
    try {
        const db = await getDatabase();
        const values = await db.getAllAsync<Birthday>('SELECT id, name, date, year FROM birthdays');
        return values;
    } catch (error) {
        logError('error getting all birthdays', error);
        return [];
    }
}

export async function getBirthday(id: string) {
    try {
        const db = await getDatabase();
        const todo = await db.getFirstAsync<Birthday>('SELECT id, name, date, year FROM birthdays WHERE id = ?', id);
        if (!todo) {
            return undefined;
        }
        return todo;
    } catch (error) {
        logError('error getting one birthday', error);
        return undefined;
    }
}

export async function updateBirthday(id: string, name: string, date: string, year: number): Promise<Result> {
    try {
        const db = await getDatabase();
        await db.runAsync('UPDATE birthdays SET name = ?, date = ?, year = ? WHERE id = ?', name, date, year, id);
        sendUpdateBirthdayEvents(id);
        return { ok: true, value: undefined };
    } catch (error) {
        logError('error updating a birthday', error);
        return { ok: false, error: { code: 'storage_error' } };
    }
}

export async function removeBirthday(id: string): Promise<Result> {
    try {
        const db = await getDatabase();
        await db.runAsync('DELETE FROM birthdays WHERE id = ?', id);
        sendRemoveBirthdayEvents();
        return { ok: true, value: undefined };
    } catch (error) {
        logError('error removing a birthday', error);
        return { ok: false, error: { code: 'storage_error' } };
    }
}
