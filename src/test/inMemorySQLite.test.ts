import { InMemorySQLite } from './inMemorySQLite';

describe('InMemorySQLite', () => {
    let database: InMemorySQLite;

    beforeEach(() => {
        database = new InMemorySQLite();
    });

    afterEach(() => {
        database.close();
    });

    test('supports positional parameters supplied as an array', async () => {
        const result = await database.getFirstAsync<{total: number}>('SELECT ? + ? AS total', [2, 3] as never);

        expect(result).toEqual({total: 5});
    });

    test('supports named parameters supplied as an object', async () => {
        const result = await database.getFirstAsync<{value: number}>('SELECT :value AS value', {value: 7} as never);

        expect(result).toEqual({value: 7});
    });

    test('binds null as a positional parameter', async () => {
        const result = await database.getFirstAsync<{nullValue: number}>('SELECT ? IS NULL AS nullValue', null);

        expect(result).toEqual({nullValue: 1});
    });

    test('runs a regular transaction', async () => {
        await database.execAsync('CREATE TABLE entries (value INTEGER NOT NULL)');

        await database.withTransactionAsync(async () => {
            await database.runAsync('INSERT INTO entries (value) VALUES (?)', 4);
        });

        expect(await database.getAllAsync('SELECT value FROM entries')).toEqual([{value: 4}]);
    });
});
