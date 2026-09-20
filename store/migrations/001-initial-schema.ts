import type { Migration } from './migration';

export const initialSchema: Migration = {
    version: 1,
    name: 'initial-schema',

    async up(database) {
        await database.execAsync(`
            CREATE TABLE habits (
                id TEXT PRIMARY KEY NOT NULL,
                title TEXT NOT NULL CHECK (length(trim(title)) > 0),
                lastDone INTEGER NOT NULL CHECK (typeof(lastDone) = 'integer' AND lastDone > 0),
                periodicity INTEGER NOT NULL CHECK (typeof(periodicity) = 'integer' AND periodicity > 0)
            );

            CREATE TABLE habitHistory (
                id TEXT PRIMARY KEY NOT NULL,
                habitId TEXT NOT NULL,
                date INTEGER NOT NULL CHECK (typeof(date) = 'integer' AND date > 0),
                FOREIGN KEY (habitId) REFERENCES habits(id) ON DELETE CASCADE,
                UNIQUE (habitId, date)
            );

            CREATE TABLE charts (
                id TEXT PRIMARY KEY NOT NULL,
                title TEXT NOT NULL CHECK (length(trim(title)) > 0)
            );

            CREATE TABLE chart_values (
                id TEXT PRIMARY KEY NOT NULL,
                chartId TEXT NOT NULL,
                value REAL NOT NULL,
                date INTEGER NOT NULL CHECK (typeof(date) = 'integer' AND date > 0),
                FOREIGN KEY (chartId) REFERENCES charts(id) ON DELETE CASCADE,
                UNIQUE (chartId, date)
            );

            CREATE TABLE fridge (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL CHECK (length(trim(name)) > 0),
                date INTEGER NOT NULL CHECK (typeof(date) = 'integer' AND date > 0)
            );

            CREATE TABLE todos (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL CHECK (length(trim(name)) > 0),
                date INTEGER NOT NULL CHECK (typeof(date) = 'integer' AND date > 0)
            );

            CREATE TABLE birthdays (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL CHECK (length(trim(name)) > 0),
                date TEXT NOT NULL,
                year INTEGER NOT NULL CHECK (typeof(year) = 'integer' AND year > 0)
            );
        `);
    },
};
