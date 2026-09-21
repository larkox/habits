import Database from 'better-sqlite3';
import type { SQLiteBindValue, SQLiteDatabase, SQLiteRunResult } from 'expo-sqlite';

type BindParameters = SQLiteBindValue[] | [Record<string, SQLiteBindValue>];

export class InMemorySQLite {
    private readonly database = new Database(':memory:');

    constructor() {
        this.database.pragma('foreign_keys = ON');
    }

    async execAsync(source: string) {
        this.database.exec(source);
    }

    async runAsync(source: string, ...params: SQLiteBindValue[]): Promise<SQLiteRunResult> {
        const result = this.runStatement(source, params).run();
        return {
            lastInsertRowId: Number(result.lastInsertRowid),
            changes: result.changes,
        };
    }

    async getFirstAsync<T>(source: string, ...params: SQLiteBindValue[]): Promise<T | null> {
        return (this.runStatement(source, params).get() as T | undefined) ?? null;
    }

    async getAllAsync<T>(source: string, ...params: SQLiteBindValue[]): Promise<T[]> {
        return this.runStatement(source, params).all() as T[];
    }

    async withTransactionAsync(task: () => Promise<void>) {
        await this.transaction(task);
    }

    async withExclusiveTransactionAsync(task: (transaction: SQLiteDatabase) => Promise<void>) {
        await this.transaction(() => task(this.asExpoDatabase()));
    }

    asExpoDatabase() {
        return this as unknown as SQLiteDatabase;
    }

    close() {
        this.database.close();
    }

    private runStatement(source: string, params: SQLiteBindValue[]) {
        const statement = this.database.prepare(source);
        if (params.length === 1 && Array.isArray(params[0])) {
            return statement.bind(...params[0]);
        }
        if (params.length === 1 && typeof params[0] === 'object' && params[0] !== null) {
            return statement.bind((params as BindParameters)[0]);
        }
        return statement.bind(...params);
    }

    private async transaction(task: () => Promise<void>) {
        this.database.exec('BEGIN');
        try {
            await task();
            this.database.exec('COMMIT');
        } catch (error) {
            this.database.exec('ROLLBACK');
            throw error;
        }
    }
}
