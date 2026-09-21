import type { SQLiteDatabase } from 'expo-sqlite';

import { initialSchema } from './001-initial-schema';

describe('initialSchema', () => {
    test('creates every table with relationship and uniqueness constraints', async () => {
        const database = {execAsync: jest.fn().mockResolvedValue(undefined)} as unknown as SQLiteDatabase;

        await initialSchema.up(database);

        const sql = jest.mocked(database.execAsync).mock.calls[0][0];
        expect(sql).toContain('CREATE TABLE habits');
        expect(sql).toContain('CREATE TABLE habitHistory');
        expect(sql).toContain('CREATE TABLE charts');
        expect(sql).toContain('CREATE TABLE chart_values');
        expect(sql).toContain('CREATE TABLE fridge');
        expect(sql).toContain('CREATE TABLE todos');
        expect(sql).toContain('CREATE TABLE birthdays');
        expect(sql).toContain('ON DELETE CASCADE');
        expect(sql).toContain('UNIQUE (habitId, date)');
        expect(sql).toContain('UNIQUE (chartId, date)');
    });
});
