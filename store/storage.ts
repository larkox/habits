import { Chart, ChartValue, Habit } from "@/types/model";
import { newId } from "@/utils/crypto";
import { logError } from "@/utils/log";
import { getMonthEnd, getStartOfDay, getYesterday } from "@/utils/time";
import { getDatabase } from "./db";
import { sendAddChartEvents, sendAddChartValueEvents, sendAddEvents, sendRemoveChartEvents, sendRemoveEvents, sendUpdateEvents } from "./events";

export async function getAllHabits() {
    try {
        const db = await getDatabase();
        const habits = await db.getAllAsync<Habit>('SELECT id, title, periodicity, lastDone FROM habits')
        return habits;
    } catch (error) {
        logError('error getting a habit', error);
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

export async function doHabit(id: string) {
    try {
        const db = await getDatabase();
        const date = getStartOfDay();
        await db.runAsync('UPDATE habits SET lastDone = ? WHERE id = ?', date, id);
        await db.runAsync('INSERT INTO habitHistory (id, habitId, date) VALUES (?, ?, ?)', newId(), id, date)
        sendUpdateEvents(id);
    } catch (error) {
        logError('error doing a habit', error);
    }
}

export async function addHabit(title: string, periodicity: number) {
    try {
        const db = await getDatabase();
        await db.runAsync('INSERT INTO habits (id, title, periodicity, lastDone) VALUES (?, ?, ?, ?)', newId(), title, periodicity, getYesterday())
        sendAddEvents();
    } catch (error) {
        logError('error adding a habit', error)
    }
}

export async function updateHabit(id: string, title: string, periodicity: number) {
    try {
        const db = await getDatabase();
        await db.runAsync('UPDATE habits SET title = ?, periodicity = ? WHERE id = ?', title, periodicity, id);
        sendUpdateEvents(id);
    } catch (error) {
        logError('error updating a habit', error);
    }
}

export async function removeHabit(id: string) {
    try {
        const db = await getDatabase();
        await db?.runAsync('DELETE FROM habits WHERE id = ?', id);
        await db?.runAsync('DELETE FROM habitHistory WHERE habitId = ?', id)
        sendRemoveEvents(id);
    } catch (error) {
        logError('error removing a habit', error);
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

export async function addChart(title: string) {
    try {
        const db = await getDatabase();
        await db.runAsync('INSERT INTO charts (id, title) VALUES (?, ?)', newId(), title)
        sendAddChartEvents();
    } catch (error) {
        logError('error adding chart', error);
    }
}

export async function removeChart(id: string) {
    try {
        const db = await getDatabase();
        await db.runAsync('DELETE FROM charts WHERE id = ?', id);
        await db.runAsync('DELETE FROM chart_values WHERE chartId = ?', id);
        sendRemoveChartEvents();
    } catch (error) {
        logError('error removing chart', error);
    }
}

export async function addChartValue(chartId: string, value: number) {
    try {
        const db = await getDatabase();
        await db.runAsync('INSERT INTO chart_values (id, chartId, value, date) VALUES (?, ?, ?, ?)', newId(), chartId, value, getStartOfDay());
        sendAddChartValueEvents(chartId);
    } catch (error) {
        logError('error adding chart value', error);
    }
}

export async function updateChartValue(chartId: string, valueId: string, value: number) {
    try {
        const db = await getDatabase();
        await db.runAsync('UPDATE chart_values SET value = ? WHERE id = ?', value, valueId);
        sendAddChartValueEvents(chartId);
    } catch (error) {
        logError('error updating chart value', error);
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