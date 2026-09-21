import type { SQLiteDatabase } from 'expo-sqlite';

import { withWriteTransaction } from '../transactions';
import { runMigrations } from './runner';

jest.mock('../transactions', () => ({
    withWriteTransaction: jest.fn(),
}));

const mockedWithWriteTransaction = jest.mocked(withWriteTransaction);

function databaseMock(version?: number) {
    return {
        getFirstAsync: jest.fn().mockResolvedValue(version === undefined ? undefined : {user_version: version}),
        execAsync: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SQLiteDatabase>;
}

describe('runMigrations', () => {
    beforeEach(() => {
        mockedWithWriteTransaction.mockClear();
        mockedWithWriteTransaction.mockImplementation(async (database, task) => task(database));
    });

    test('runs pending migrations and updates the user version', async () => {
        const database = databaseMock(0);

        await runMigrations(database);

        expect(mockedWithWriteTransaction).toHaveBeenCalledTimes(1);
        expect(database.execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE habits'));
        expect(database.execAsync).toHaveBeenCalledWith('PRAGMA user_version = 1');
    });

    test('treats a missing user version as an unmigrated database', async () => {
        const database = databaseMock();

        await runMigrations(database);

        expect(mockedWithWriteTransaction).toHaveBeenCalledTimes(1);
    });

    test('does nothing when the database is current', async () => {
        const database = databaseMock(1);

        await runMigrations(database);

        expect(mockedWithWriteTransaction).not.toHaveBeenCalled();
    });

    test('rejects a database newer than the app supports', async () => {
        const database = databaseMock(2);

        await expect(runMigrations(database)).rejects.toThrow('Database version 2 is newer than supported version 1');
        expect(mockedWithWriteTransaction).not.toHaveBeenCalled();
    });

    test('rejects migrations with non-sequential versions', async () => {
        jest.doMock('./index', () => ({
            migrations: [{version: 2, name: 'invalid', up: jest.fn()}],
        }));
        let isolatedRunMigrations: typeof runMigrations | undefined;
        jest.isolateModules(() => {
            isolatedRunMigrations = jest.requireActual('./runner').runMigrations;
        });

        await expect(isolatedRunMigrations!(databaseMock(0))).rejects.toThrow('Expected migration 1, received 2');
        jest.dontMock('./index');
    });

    test('supports an empty migration list', async () => {
        jest.doMock('./index', () => ({migrations: []}));
        let isolatedRunMigrations: typeof runMigrations | undefined;
        jest.isolateModules(() => {
            isolatedRunMigrations = jest.requireActual('./runner').runMigrations;
        });

        await expect(isolatedRunMigrations!(databaseMock(0))).resolves.toBeUndefined();
        jest.dontMock('./index');
    });
});
