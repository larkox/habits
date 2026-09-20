import { Platform } from 'react-native';

import type { SQLiteDatabase } from 'expo-sqlite';

type TransactionTask = (transaction: SQLiteDatabase) => Promise<void>;

type ForeignKeyViolation = {
    table: string;
    rowid: number;
    parent: string;
    fkid: number;
};

export async function withWriteTransaction(
    database: SQLiteDatabase,
    task: TransactionTask,
) {
    if (Platform.OS === 'web') {
        await database.withTransactionAsync(() => task(database));
        return;
    }

    await database.withExclusiveTransactionAsync(async (transaction) => {
        await task(transaction);

        // Expo runs exclusive transactions on a separate connection, which does
        // not inherit the connection-level foreign_keys pragma.
        const violation = await transaction.getFirstAsync<ForeignKeyViolation>(
            'PRAGMA foreign_key_check'
        );
        if (violation) {
            throw new Error(
                `Foreign key violation in ${violation.table} referencing ${violation.parent}`
            );
        }
    });
}
