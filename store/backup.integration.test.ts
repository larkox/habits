import { InMemorySQLite } from '@/test/inMemorySQLite';
import type { BackupFile } from '@/types/backup';
import { newId } from '@/utils/crypto';
import { getStartOfDay } from '@/utils/time';

import { createBackup, importBackup } from './backup';
import { getDatabase } from './db';
import { runMigrations } from './migrations/runner';
import {
    addChart,
    addHabit,
    addTodo,
    doHabit,
    getAllChartIDs,
    getAllHabits,
    getAllTodos,
    getChartValues,
    setChartValue,
} from './storage';

jest.mock('./db', () => ({getDatabase: jest.fn()}));
jest.mock('@/utils/crypto', () => ({newId: jest.fn()}));

const mockedGetDatabase = jest.mocked(getDatabase);
const mockedNewId = jest.mocked(newId);
let memory: InMemorySQLite;

beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 8, 21, 12));
    memory = new InMemorySQLite();
    mockedGetDatabase.mockResolvedValue(memory.asExpoDatabase());
    let id = 0;
    mockedNewId.mockImplementation(() => `id-${++id}`);
    await runMigrations(memory.asExpoDatabase());
});

afterEach(() => {
    memory.close();
    jest.useRealTimers();
});

async function populatedBackup() {
    await addHabit('Read', 2);
    const [habit] = (await getAllHabits())!;
    await doHabit(habit.id);
    await addChart('Weight');
    const [chartId] = (await getAllChartIDs())!;
    await setChartValue(chartId, 72.5);
    await addTodo('Call', getStartOfDay());
    const result = await createBackup('history');
    expect(result.ok).toBe(true);
    return result.ok ? result.value : undefined as never;
}

describe('backup integration', () => {
    test('exports and appends a full backup with independent relationships', async () => {
        const backup = await populatedBackup();

        await expect(importBackup(backup, 'append')).resolves.toEqual({ok: true, value: undefined});

        const habits = (await getAllHabits())!;
        const charts = (await getAllChartIDs())!;
        expect(habits).toHaveLength(2);
        expect(new Set(habits.map(habit => habit.id)).size).toBe(2);
        expect(charts).toHaveLength(2);
        await expect(Promise.all(charts.map(getChartValues))).resolves.toEqual([
            [expect.objectContaining({value: 72.5})],
            [expect.objectContaining({value: 72.5})],
        ]);
        expect(await getAllTodos()).toHaveLength(2);
    });

    test('replaces all current data with the exported snapshot', async () => {
        const backup = await populatedBackup();
        await addTodo('Extra', getStartOfDay());

        await expect(importBackup(backup, 'replace')).resolves.toEqual({ok: true, value: undefined});

        expect(await getAllHabits()).toHaveLength(1);
        expect(await getAllChartIDs()).toHaveLength(1);
        expect(await getAllTodos()).toEqual([expect.objectContaining({name: 'Call'})]);
    });

    test('rolls back a replacement when imported data violates a constraint', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation();
        await addTodo('Keep me', getStartOfDay());
        const invalidBackup: BackupFile = {
            format: 'habits-backup',
            version: 1,
            exportedAt: new Date().toISOString(),
            includesHistory: true,
            data: {
                habits: [{id: 'habit', title: 'Read', periodicity: 1, lastDone: getStartOfDay()}],
                habitHistory: [
                    {id: 'history-1', habitId: 'habit', date: getStartOfDay()},
                    {id: 'history-2', habitId: 'habit', date: getStartOfDay()},
                ],
                charts: [],
                chartValues: [],
                fridge: [],
                todos: [],
                birthdays: [],
            },
        };

        await expect(importBackup(invalidBackup, 'replace')).resolves.toEqual({ok: false, error: {code: 'storage_error'}});

        expect(await getAllTodos()).toEqual([expect.objectContaining({name: 'Keep me'})]);
        expect(await getAllHabits()).toEqual([]);
        expect(consoleError).toHaveBeenCalled();
        consoleError.mockRestore();
    });
});
