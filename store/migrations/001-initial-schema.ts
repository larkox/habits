import type { Migration } from './migration';

export const initialSchema: Migration = {
    version: 1,
    name: 'initial-schema',

    async up(database) {
        await database.execAsync(`
            CREATE TABLE habits (
                id TEXT PRIMARY KEY NOT NULL,
                title TEXT NOT NULL,
                lastDone INTEGER NOT NULL,
                periodicity INTEGER NOT NULL CHECK (periodicity > 0)
            );

            CREATE TABLE habitHistory (
                id TEXT PRIMARY KEY NOT NULL,
                habitId TEXT NOT NULL,
                date INTEGER NOT NULL,
                FOREIGN KEY (habitId) REFERENCES habits(id) ON DELETE CASCADE,
                UNIQUE (habitId, date)
            );

            CREATE TABLE charts (
                id TEXT PRIMARY KEY NOT NULL,
                title TEXT NOT NULL
            );

            CREATE TABLE chart_values (
                id TEXT PRIMARY KEY NOT NULL,
                chartId TEXT NOT NULL,
                value REAL NOT NULL,
                date INTEGER NOT NULL,
                FOREIGN KEY (chartId) REFERENCES charts(id) ON DELETE CASCADE,
                UNIQUE (chartId, date)
            );

            CREATE TABLE fridge (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                date INTEGER NOT NULL
            );

            CREATE TABLE todos (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                date INTEGER NOT NULL
            );

            CREATE TABLE birthdays (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                date TEXT NOT NULL,
                year INTEGER NOT NULL
            );
        `);
    },
};
