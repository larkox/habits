import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | undefined;

async function initDatabase() {
    if (db) {
        return;
    }

    const newDb = await SQLite.openDatabaseAsync('habitDatabase');
    await newDb.runAsync(`CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT,
        lastDone INTEGER,
        periodicity INTEGER
    )`)
    await newDb.runAsync(`CREATE TABLE IF NOT EXISTS charts (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT
    )`)
    await newDb.runAsync(`CREATE TABLE IF NOT EXISTS chart_values (
        id TEXT PRIMARY KEY NOT NULL,
        chartId TEXT,
        value FLOAT,
        date INTEGER,
        FOREIGN KEY (chartId) REFERENCES charts(id)
    )`)
    await newDb.runAsync(`CREATE TABLE IF NOT EXISTS habitHistory (
        id TEXT PRIMARY KEY NOT null,
        habitId TEXT,
        date INTEGER,
        FOREIGN KEY (habitId) REFERENCES habits(id)
    )`)
    db = newDb;
}

export async function getDatabase() {
    await initDatabase();
    return db!;
}