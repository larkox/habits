import * as SQLite from 'expo-sqlite';

import { runMigrations } from './migrations/runner';

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

async function initDatabase() {
    const database = await SQLite.openDatabaseAsync('habitDatabase');

    await database.execAsync('PRAGMA foreign_keys = ON');
    await runMigrations(database);

    return database;
}

export function getDatabase() {
    databasePromise ??= initDatabase();
    return databasePromise;
}
