import type { SQLiteDatabase } from 'expo-sqlite';

import type { BackupData, BackupFile, ExportScope, HabitHistoryEntry, ImportMode } from '@/types/backup';
import type { Birthday, Chart, ChartValue, FridgeFood, Habit, Todo } from '@/types/model';
import type { Result } from '@/types/result';
import { newId } from '@/utils/crypto';
import { logError } from '@/utils/log';
import { isValidMonthAndDay } from '@/utils/validation';

import { getDatabase } from './db';
import { sendImportEvents } from './events';
import { withWriteTransaction } from './transactions';

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
    return Number.isSafeInteger(value) && (value as number) > 0;
}

function isArrayOf<T>(value: unknown, validate: (entry: unknown) => entry is T): value is T[] {
    return Array.isArray(value) && value.every(validate);
}

function isHabit(value: unknown): value is Habit {
    return isObject(value) && isString(value.id) && isString(value.title)
        && isPositiveInteger(value.lastDone) && isPositiveInteger(value.periodicity);
}

function isHabitHistory(value: unknown): value is HabitHistoryEntry {
    return isObject(value) && isString(value.id) && isString(value.habitId)
        && isPositiveInteger(value.date);
}

function isChart(value: unknown): value is Chart {
    return isObject(value) && isString(value.id) && isString(value.title);
}

function isChartValue(value: unknown): value is ChartValue {
    return isObject(value) && isString(value.id) && isString(value.chartId)
        && typeof value.value === 'number' && Number.isFinite(value.value)
        && isPositiveInteger(value.date);
}

function isNamedDate(value: unknown): value is FridgeFood | Todo {
    return isObject(value) && isString(value.id) && isString(value.name)
        && isPositiveInteger(value.date);
}

function isBirthday(value: unknown): value is Birthday {
    return isObject(value) && isString(value.id) && isString(value.name)
        && isPositiveInteger(value.year) && typeof value.date === 'string'
        && isValidMonthAndDay(value.date);
}

function hasUniqueIds(entries: readonly {id: string}[]) {
    return new Set(entries.map(entry => entry.id)).size === entries.length;
}

function invalidBackup(): Result<BackupFile> {
    return {ok: false, error: {code: 'validation_error'}};
}

export function parseBackupFile(contents: string): Result<BackupFile> {
    let value: unknown;
    try {
        value = JSON.parse(contents);
    } catch {
        return invalidBackup();
    }

    if (!isObject(value) || value.format !== 'habits-backup' || value.version !== 1
        || typeof value.exportedAt !== 'string' || Number.isNaN(Date.parse(value.exportedAt))
        || typeof value.includesHistory !== 'boolean' || !isObject(value.data)) {
        return invalidBackup();
    }

    const data = value.data;
    if (!isArrayOf(data.habits, isHabit) || !isArrayOf(data.habitHistory, isHabitHistory)
        || !isArrayOf(data.charts, isChart) || !isArrayOf(data.chartValues, isChartValue)
        || !isArrayOf(data.fridge, isNamedDate) || !isArrayOf(data.todos, isNamedDate)
        || !isArrayOf(data.birthdays, isBirthday)) {
        return invalidBackup();
    }

    const parsedData: BackupData = {
        habits: data.habits,
        habitHistory: data.habitHistory,
        charts: data.charts,
        chartValues: data.chartValues,
        fridge: data.fridge,
        todos: data.todos,
        birthdays: data.birthdays,
    };
    const habitIds = new Set(parsedData.habits.map(entry => entry.id));
    const chartIds = new Set(parsedData.charts.map(entry => entry.id));
    const collections = Object.values(parsedData);
    const relationshipsAreValid = parsedData.habitHistory.every(entry => habitIds.has(entry.habitId))
        && parsedData.chartValues.every(entry => chartIds.has(entry.chartId));
    if (!collections.every(hasUniqueIds) || !relationshipsAreValid
        || (!value.includesHistory && (parsedData.habitHistory.length > 0 || parsedData.chartValues.length > 0))) {
        return invalidBackup();
    }

    return {ok: true, value: {
        format: 'habits-backup',
        version: 1,
        exportedAt: value.exportedAt,
        includesHistory: value.includesHistory,
        data: parsedData,
    }};
}

export async function createBackup(scope: ExportScope): Promise<Result<BackupFile>> {
    try {
        const database = await getDatabase();
        const includesHistory = scope === 'history';
        const [habits, charts, fridge, todos, birthdays, habitHistory, chartValues] = await Promise.all([
            database.getAllAsync<Habit>('SELECT id, title, periodicity, lastDone FROM habits'),
            database.getAllAsync<Chart>('SELECT id, title FROM charts'),
            database.getAllAsync<FridgeFood>('SELECT id, name, date FROM fridge'),
            database.getAllAsync<Todo>('SELECT id, name, date FROM todos'),
            database.getAllAsync<Birthday>('SELECT id, name, date, year FROM birthdays'),
            includesHistory ? database.getAllAsync<HabitHistoryEntry>('SELECT id, habitId, date FROM habitHistory') : Promise.resolve([]),
            includesHistory ? database.getAllAsync<ChartValue>('SELECT id, chartId, value, date FROM chart_values') : Promise.resolve([]),
        ]);
        return {ok: true, value: {
            format: 'habits-backup',
            version: 1,
            exportedAt: new Date().toISOString(),
            includesHistory,
            data: {habits, habitHistory, charts, chartValues, fridge, todos, birthdays},
        }};
    } catch (error) {
        logError('error creating backup', error);
        return {ok: false, error: {code: 'storage_error'}};
    }
}

async function clearDatabase(database: SQLiteDatabase) {
    await database.execAsync(`
        DELETE FROM habitHistory;
        DELETE FROM chart_values;
        DELETE FROM habits;
        DELETE FROM charts;
        DELETE FROM fridge;
        DELETE FROM todos;
        DELETE FROM birthdays;
    `);
}

async function insertBackup(database: SQLiteDatabase, data: BackupData, mode: ImportMode) {
    const habitIds = new Map(data.habits.map(item => [item.id, mode === 'append' ? newId() : item.id]));
    const chartIds = new Map(data.charts.map(item => [item.id, mode === 'append' ? newId() : item.id]));
    for (const item of data.habits) {
        await database.runAsync('INSERT INTO habits (id, title, periodicity, lastDone) VALUES (?, ?, ?, ?)', habitIds.get(item.id)!, item.title.trim(), item.periodicity, item.lastDone);
    }
    for (const item of data.habitHistory) {
        await database.runAsync('INSERT INTO habitHistory (id, habitId, date) VALUES (?, ?, ?)', mode === 'append' ? newId() : item.id, habitIds.get(item.habitId)!, item.date);
    }
    for (const item of data.charts) {
        await database.runAsync('INSERT INTO charts (id, title) VALUES (?, ?)', chartIds.get(item.id)!, item.title.trim());
    }
    for (const item of data.chartValues) {
        await database.runAsync('INSERT INTO chart_values (id, chartId, value, date) VALUES (?, ?, ?, ?)', mode === 'append' ? newId() : item.id, chartIds.get(item.chartId)!, item.value, item.date);
    }
    for (const item of data.fridge) {
        await database.runAsync('INSERT INTO fridge (id, name, date) VALUES (?, ?, ?)', mode === 'append' ? newId() : item.id, item.name.trim(), item.date);
    }
    for (const item of data.todos) {
        await database.runAsync('INSERT INTO todos (id, name, date) VALUES (?, ?, ?)', mode === 'append' ? newId() : item.id, item.name.trim(), item.date);
    }
    for (const item of data.birthdays) {
        await database.runAsync('INSERT INTO birthdays (id, name, date, year) VALUES (?, ?, ?, ?)', mode === 'append' ? newId() : item.id, item.name.trim(), item.date, item.year);
    }
}

export async function importBackup(backup: BackupFile, mode: ImportMode): Promise<Result> {
    try {
        const database = await getDatabase();
        await withWriteTransaction(database, async transaction => {
            if (mode === 'replace') {
                await clearDatabase(transaction);
            }
            await insertBackup(transaction, backup.data, mode);
        });
        sendImportEvents();
        return {ok: true, value: undefined};
    } catch (error) {
        logError('error importing backup', error);
        return {ok: false, error: {code: 'storage_error'}};
    }
}
