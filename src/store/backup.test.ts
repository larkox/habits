import type { BackupFile } from '@/types/backup';
import { newId } from '@/utils/crypto';

import { createBackup, importBackup, parseBackupFile } from './backup';
import { getDatabase } from './db';
import { sendImportEvents } from './events';
import { withWriteTransaction } from './transactions';

jest.mock('./db', () => ({getDatabase: jest.fn()}));
jest.mock('./events', () => ({sendImportEvents: jest.fn()}));
jest.mock('./transactions', () => ({withWriteTransaction: jest.fn()}));
jest.mock('@/utils/crypto', () => ({newId: jest.fn()}));
jest.mock('@/utils/log', () => ({logError: jest.fn()}));

const database = {
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
    execAsync: jest.fn(),
};
const mockedGetDatabase = jest.mocked(getDatabase);
const mockedImportEvents = jest.mocked(sendImportEvents);
const mockedTransaction = jest.mocked(withWriteTransaction);
const mockedNewId = jest.mocked(newId);

function validBackup(): BackupFile {
    return {
        format: 'habits-backup',
        version: 1,
        exportedAt: '2026-09-21T10:00:00.000Z',
        includesHistory: true,
        data: {
            habits: [{id: 'habit', title: 'Read', periodicity: 2, lastDone: 1000}],
            habitHistory: [{id: 'habit-history', habitId: 'habit', date: 1000}],
            charts: [{id: 'chart', title: 'Weight'}],
            chartValues: [{id: 'chart-value', chartId: 'chart', value: 72.5, date: 1000}],
            fridge: [{id: 'food', name: 'Milk', date: 2000}],
            todos: [{id: 'todo', name: 'Call', date: 2000}],
            birthdays: [{id: 'birthday', name: 'Ada', date: '12-10', year: 1990}],
        },
    };
}

beforeEach(() => {
    jest.clearAllMocks();
    mockedGetDatabase.mockResolvedValue(database as never);
    database.getAllAsync.mockResolvedValue([]);
    database.runAsync.mockResolvedValue({} as never);
    database.execAsync.mockResolvedValue(undefined);
    mockedTransaction.mockImplementation(async (db, task) => task(db));
    let id = 0;
    mockedNewId.mockImplementation(() => `generated-${++id}`);
});

describe('parseBackupFile', () => {
    test('parses a valid backup', () => {
        expect(parseBackupFile(JSON.stringify(validBackup()))).toEqual({ok: true, value: validBackup()});
    });

    test.each([
        ['invalid JSON', '{'],
        ['wrong format', JSON.stringify({...validBackup(), format: 'other'})],
        ['unsupported version', JSON.stringify({...validBackup(), version: 2})],
        ['invalid export date', JSON.stringify({...validBackup(), exportedAt: 'invalid'})],
        ['missing data', JSON.stringify({...validBackup(), data: undefined})],
    ])('rejects %s', (_name, contents) => {
        expect(parseBackupFile(contents)).toEqual({ok: false, error: {code: 'validation_error'}});
    });

    test('rejects invalid entity fields', () => {
        const backup = validBackup();
        backup.data.todos[0].date = -1;
        expect(parseBackupFile(JSON.stringify(backup))).toEqual({ok: false, error: {code: 'validation_error'}});
    });

    test('rejects duplicate ids in a collection', () => {
        const backup = validBackup();
        backup.data.todos.push({...backup.data.todos[0]});
        expect(parseBackupFile(JSON.stringify(backup))).toEqual({ok: false, error: {code: 'validation_error'}});
    });

    test('rejects history whose parent is missing', () => {
        const backup = validBackup();
        backup.data.habitHistory[0].habitId = 'missing';
        expect(parseBackupFile(JSON.stringify(backup))).toEqual({ok: false, error: {code: 'validation_error'}});
    });

    test('rejects chart values whose parent is missing', () => {
        const backup = validBackup();
        backup.data.chartValues[0].chartId = 'missing';
        expect(parseBackupFile(JSON.stringify(backup))).toEqual({ok: false, error: {code: 'validation_error'}});
    });

    test('rejects history in an items-only backup', () => {
        const backup = validBackup();
        backup.includesHistory = false;
        expect(parseBackupFile(JSON.stringify(backup))).toEqual({ok: false, error: {code: 'validation_error'}});
    });

    test('rejects chart values in an items-only backup without habit history', () => {
        const backup = validBackup();
        backup.includesHistory = false;
        backup.data.habitHistory = [];
        expect(parseBackupFile(JSON.stringify(backup))).toEqual({ok: false, error: {code: 'validation_error'}});
    });
});

describe('createBackup', () => {
    test('exports top-level items without history', async () => {
        database.getAllAsync.mockImplementation(async (sql: string) => {
            if (sql.includes('FROM habits')) {
                return validBackup().data.habits;
            }
            return [];
        });

        const result = await createBackup('elements');

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value.includesHistory).toBe(false);
            expect(result.value.data.habits).toEqual(validBackup().data.habits);
            expect(result.value.data.habitHistory).toEqual([]);
            expect(result.value.data.chartValues).toEqual([]);
        }
        expect(database.getAllAsync).toHaveBeenCalledTimes(5);
    });

    test('exports items with habit and chart history', async () => {
        database.getAllAsync.mockImplementation(async (sql: string) => {
            if (sql.includes('habitHistory')) {
                return validBackup().data.habitHistory;
            }
            if (sql.includes('chart_values')) {
                return validBackup().data.chartValues;
            }
            return [];
        });

        const result = await createBackup('history');

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value.includesHistory).toBe(true);
            expect(result.value.data.habitHistory).toEqual(validBackup().data.habitHistory);
            expect(result.value.data.chartValues).toEqual(validBackup().data.chartValues);
        }
        expect(database.getAllAsync).toHaveBeenCalledTimes(7);
    });

    test('returns a storage error when reading fails', async () => {
        database.getAllAsync.mockRejectedValue(new Error('failure'));
        await expect(createBackup('history')).resolves.toEqual({ok: false, error: {code: 'storage_error'}});
    });
});

describe('importBackup', () => {
    test('appends entities with new ids and remaps history relationships', async () => {
        const result = await importBackup(validBackup(), 'append');

        expect(result).toEqual({ok: true, value: undefined});
        expect(database.execAsync).not.toHaveBeenCalled();
        expect(database.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO habits'), 'generated-1', 'Read', 2, 1000);
        expect(database.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO habitHistory'), 'generated-3', 'generated-1', 1000);
        expect(database.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO chart_values'), 'generated-4', 'generated-2', 72.5, 1000);
        expect(mockedImportEvents).toHaveBeenCalledTimes(1);
    });

    test('clears current data and preserves backup ids when replacing', async () => {
        const result = await importBackup(validBackup(), 'replace');

        expect(result).toEqual({ok: true, value: undefined});
        expect(database.execAsync).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM habits'));
        expect(database.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO habits'), 'habit', 'Read', 2, 1000);
        expect(database.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO habitHistory'), 'habit-history', 'habit', 1000);
        expect(mockedNewId).not.toHaveBeenCalled();
        expect(mockedImportEvents).toHaveBeenCalledTimes(1);
    });

    test('returns a storage error and does not emit when the transaction fails', async () => {
        mockedTransaction.mockRejectedValue(new Error('failure'));
        await expect(importBackup(validBackup(), 'replace')).resolves.toEqual({ok: false, error: {code: 'storage_error'}});
        expect(mockedImportEvents).not.toHaveBeenCalled();
    });
});
