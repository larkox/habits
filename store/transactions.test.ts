import { Platform } from 'react-native';

import type { SQLiteDatabase } from 'expo-sqlite';

import { withWriteTransaction } from './transactions';

function databaseMock() {
    return {
        withTransactionAsync: jest.fn(),
        withExclusiveTransactionAsync: jest.fn(),
        getFirstAsync: jest.fn(),
    } as unknown as jest.Mocked<SQLiteDatabase>;
}

describe('withWriteTransaction', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('uses the regular transaction API on web', async () => {
        jest.replaceProperty(Platform, 'OS', 'web');
        const database = databaseMock();
        database.withTransactionAsync.mockImplementation(async task => task());
        const task = jest.fn().mockResolvedValue(undefined);

        await withWriteTransaction(database, task);

        expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
        expect(database.withExclusiveTransactionAsync).not.toHaveBeenCalled();
        expect(task).toHaveBeenCalledWith(database);
    });

    test('uses an exclusive transaction and checks foreign keys natively', async () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        const database = databaseMock();
        const transaction = databaseMock();
        transaction.getFirstAsync.mockResolvedValue(null);
        database.withExclusiveTransactionAsync.mockImplementation(async task => task(transaction));
        const task = jest.fn().mockResolvedValue(undefined);

        await withWriteTransaction(database, task);

        expect(task).toHaveBeenCalledWith(transaction);
        expect(transaction.getFirstAsync).toHaveBeenCalledWith('PRAGMA foreign_key_check');
    });

    test('rejects a native transaction with a foreign-key violation', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        const database = databaseMock();
        const transaction = databaseMock();
        transaction.getFirstAsync.mockResolvedValue({table: 'child', rowid: 1, parent: 'parent', fkid: 0});
        database.withExclusiveTransactionAsync.mockImplementation(async task => task(transaction));

        await expect(withWriteTransaction(database, jest.fn().mockResolvedValue(undefined)))
            .rejects.toThrow('Foreign key violation in child referencing parent');
    });
});
