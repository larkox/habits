import type { SQLiteDatabase } from 'expo-sqlite';

import { withWriteTransaction } from '../transactions';
import { migrations } from './index';

function validateMigrations() {
    migrations.forEach((migration, index) => {
        const expectedVersion = index + 1;
        if (migration.version !== expectedVersion) {
            throw new Error(
                `Expected migration ${expectedVersion}, received ${migration.version}`
            );
        }
    });
}

export async function runMigrations(database: SQLiteDatabase) {
    validateMigrations();

    const result = await database.getFirstAsync<{user_version: number}>(
        'PRAGMA user_version'
    );
    let currentVersion = result?.user_version ?? 0;
    const latestVersion = migrations[migrations.length - 1]?.version ?? 0;

    if (currentVersion > latestVersion) {
        throw new Error(
            `Database version ${currentVersion} is newer than supported version ${latestVersion}`
        );
    }

    for (const migration of migrations) {
        if (migration.version <= currentVersion) {
            continue;
        }

        await withWriteTransaction(database, async (transaction) => {
            await migration.up(transaction);
            await transaction.execAsync(`PRAGMA user_version = ${migration.version}`);
        });

        currentVersion = migration.version;
    }
}
