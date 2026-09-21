import * as SQLite from 'expo-sqlite';

import { getDatabase } from './db';
import { runMigrations } from './migrations/runner';

jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(),
}));
jest.mock('./migrations/runner', () => ({
    runMigrations: jest.fn(),
}));

const openDatabaseAsync = jest.mocked(SQLite.openDatabaseAsync);
const mockedRunMigrations = jest.mocked(runMigrations);

describe('getDatabase', () => {
    test('opens, configures, and migrates the database once', async () => {
        const database = {execAsync: jest.fn().mockResolvedValue(undefined)};
        openDatabaseAsync.mockResolvedValue(database as never);
        mockedRunMigrations.mockResolvedValue(undefined);
        const first = await getDatabase();
        const second = await getDatabase();

        expect(first).toBe(database);
        expect(second).toBe(database);
        expect(openDatabaseAsync).toHaveBeenCalledTimes(1);
        expect(openDatabaseAsync).toHaveBeenCalledWith('habitDatabase');
        expect(database.execAsync).toHaveBeenCalledWith('PRAGMA foreign_keys = ON');
        expect(mockedRunMigrations).toHaveBeenCalledWith(database);
    });
});
