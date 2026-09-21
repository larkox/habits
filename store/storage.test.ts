import { getDatabase } from './db';
import * as events from './events';
import {
    addBirthday,
    addChart,
    addFridgeFood,
    addHabit,
    addTodo,
    doHabit,
    getAllBirthdays,
    getAllChartIDs,
    getAllFridgeFood,
    getAllHabits,
    getAllTodos,
    getBirthday,
    getChart,
    getChartValues,
    getFridgeFood,
    getHabit,
    getHabitCalendar,
    getTodo,
    removeBirthday,
    removeChart,
    removeFoodFromFridge,
    removeHabit,
    removeTodo,
    setChartValue,
    updateBirthday,
    updateFoodFromFridge,
    updateHabit,
    updateTodo,
} from './storage';
import { withWriteTransaction } from './transactions';

jest.mock('./db', () => ({getDatabase: jest.fn()}));
jest.mock('./events', () => ({
    sendAddBirthdayEvents: jest.fn(),
    sendAddChartEvents: jest.fn(),
    sendAddChartValueEvents: jest.fn(),
    sendAddEvents: jest.fn(),
    sendAddFridgeFoodEvents: jest.fn(),
    sendAddTodoEvents: jest.fn(),
    sendRemoveBirthdayEvents: jest.fn(),
    sendRemoveChartEvents: jest.fn(),
    sendRemoveEvents: jest.fn(),
    sendRemoveFridgeFoodEvents: jest.fn(),
    sendRemoveTodoEvents: jest.fn(),
    sendUpdateBirthdayEvents: jest.fn(),
    sendUpdateEvents: jest.fn(),
    sendUpdateFridgeFoodEvents: jest.fn(),
    sendUpdateTodoEvents: jest.fn(),
}));
jest.mock('./transactions', () => ({withWriteTransaction: jest.fn()}));
jest.mock('@/utils/crypto', () => ({newId: jest.fn(() => 'new-id')}));
jest.mock('@/utils/log', () => ({logError: jest.fn()}));
jest.mock('@/utils/time', () => ({
    getMonthEnd: jest.fn(() => 2000),
    getStartOfDay: jest.fn(() => 1000),
    getYesterday: jest.fn(() => 500),
}));

const database = {
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(),
};
const mockedGetDatabase = jest.mocked(getDatabase);
const mockedTransaction = jest.mocked(withWriteTransaction);

beforeEach(() => {
    jest.clearAllMocks();
    mockedGetDatabase.mockResolvedValue(database as never);
    database.getAllAsync.mockResolvedValue([]);
    database.getFirstAsync.mockResolvedValue(null);
    database.runAsync.mockResolvedValue({} as never);
    mockedTransaction.mockImplementation(async (db, task) => task(db));
});

describe('habit storage', () => {
    test('reads all habits', async () => {
        const habits = [{id: 'habit', title: 'Read', periodicity: 1, lastDone: 500}];
        database.getAllAsync.mockResolvedValue(habits);
        await expect(getAllHabits()).resolves.toBe(habits);
        expect(database.getAllAsync).toHaveBeenCalledWith('SELECT id, title, periodicity, lastDone FROM habits');
    });

    test('returns undefined when reading habits fails', async () => {
        database.getAllAsync.mockRejectedValue(new Error('failure'));
        await expect(getAllHabits()).resolves.toBeUndefined();
    });

    test('reads one habit and handles missing or failed records', async () => {
        const habit = {id: 'habit', title: 'Read', periodicity: 1, lastDone: 500};
        database.getFirstAsync.mockResolvedValueOnce(habit).mockResolvedValueOnce(null).mockRejectedValueOnce(new Error('failure'));
        await expect(getHabit('habit')).resolves.toBe(habit);
        await expect(getHabit('missing')).resolves.toBeUndefined();
        await expect(getHabit('failed')).resolves.toBeUndefined();
    });

    test('reads a habit calendar for the requested month', async () => {
        const dates = [{date: 1000}];
        database.getAllAsync.mockResolvedValue(dates);
        await expect(getHabitCalendar('habit', 100)).resolves.toBe(dates);
        expect(database.getAllAsync).toHaveBeenCalledWith(expect.stringContaining('FROM habitHistory'), 'habit', 100, 2000);
    });

    test('returns undefined when reading a habit calendar fails', async () => {
        database.getAllAsync.mockRejectedValue(new Error('failure'));
        await expect(getHabitCalendar('habit', 100)).resolves.toBeUndefined();
    });

    test('completes a habit atomically', async () => {
        await expect(doHabit('habit')).resolves.toEqual({ok: true, value: undefined});
        expect(mockedTransaction).toHaveBeenCalledTimes(1);
        expect(database.runAsync).toHaveBeenNthCalledWith(1, expect.stringContaining('INSERT INTO habitHistory'), 'new-id', 'habit', 1000);
        expect(database.runAsync).toHaveBeenNthCalledWith(2, 'UPDATE habits SET lastDone = ? WHERE id = ?', 1000, 'habit');
        expect(events.sendUpdateEvents).toHaveBeenCalledWith('habit');
    });

    test('reports a failed habit completion', async () => {
        mockedTransaction.mockRejectedValue(new Error('failure'));
        await expect(doHabit('habit')).resolves.toEqual({ok: false, error: {code: 'storage_error'}});
        expect(events.sendUpdateEvents).not.toHaveBeenCalled();
    });
});

describe('chart storage', () => {
    test('reads chart ids', async () => {
        database.getAllAsync.mockResolvedValue([{id: 'one'}, {id: 'two'}]);
        await expect(getAllChartIDs()).resolves.toEqual(['one', 'two']);
    });

    test('returns undefined when chart-id reading fails', async () => {
        database.getAllAsync.mockRejectedValue(new Error('failure'));
        await expect(getAllChartIDs()).resolves.toBeUndefined();
    });

    test('reads one chart and handles missing or failed records', async () => {
        const chart = {id: 'chart', title: 'Weight'};
        database.getFirstAsync.mockResolvedValueOnce(chart).mockResolvedValueOnce(null).mockRejectedValueOnce(new Error('failure'));
        await expect(getChart('chart')).resolves.toBe(chart);
        await expect(getChart('missing')).resolves.toBeUndefined();
        await expect(getChart('failed')).resolves.toBeUndefined();
    });

    test('returns the five chart values in chronological order', async () => {
        const values = [{id: 'new', date: 2}, {id: 'old', date: 1}];
        database.getAllAsync.mockResolvedValue(values);
        await expect(getChartValues('chart')).resolves.toEqual([{id: 'old', date: 1}, {id: 'new', date: 2}]);
        expect(database.getAllAsync).toHaveBeenCalledWith(expect.stringContaining('ORDER BY date DESC LIMIT 5'), 'chart');
    });

    test('returns an empty chart series when reading fails', async () => {
        database.getAllAsync.mockRejectedValue(new Error('failure'));
        await expect(getChartValues('chart')).resolves.toEqual([]);
    });

    test('validates and stores today chart value', async () => {
        await expect(setChartValue('chart', Number.NaN)).resolves.toEqual({ok: false, error: {code: 'validation_error'}});
        expect(database.runAsync).not.toHaveBeenCalled();

        await expect(setChartValue('chart', 72.5)).resolves.toEqual({ok: true, value: undefined});
        expect(database.runAsync).toHaveBeenCalledWith(expect.stringContaining('ON CONFLICT(chartId, date)'), 'new-id', 'chart', 72.5, 1000);
        expect(events.sendAddChartValueEvents).toHaveBeenCalledWith('chart');
    });
});

describe('fridge storage', () => {
    test('reads all food and falls back to an empty list', async () => {
        const food = [{id: 'food', name: 'Milk', date: 1000}];
        database.getAllAsync.mockResolvedValueOnce(food).mockRejectedValueOnce(new Error('failure'));
        await expect(getAllFridgeFood()).resolves.toBe(food);
        await expect(getAllFridgeFood()).resolves.toEqual([]);
    });

    test('reads one food and handles missing or failed records', async () => {
        const food = {id: 'food', name: 'Milk', date: 1000};
        database.getFirstAsync.mockResolvedValueOnce(food).mockResolvedValueOnce(null).mockRejectedValueOnce(new Error('failure'));
        await expect(getFridgeFood('food')).resolves.toBe(food);
        await expect(getFridgeFood('missing')).resolves.toBeUndefined();
        await expect(getFridgeFood('failed')).resolves.toBeUndefined();
    });
});

describe('todo storage', () => {
    test('reads all todos and falls back to an empty list', async () => {
        const todos = [{id: 'todo', name: 'Call', date: 1000}];
        database.getAllAsync.mockResolvedValueOnce(todos).mockRejectedValueOnce(new Error('failure'));
        await expect(getAllTodos()).resolves.toBe(todos);
        await expect(getAllTodos()).resolves.toEqual([]);
    });

    test('reads one todo and handles missing or failed records', async () => {
        const todo = {id: 'todo', name: 'Call', date: 1000};
        database.getFirstAsync.mockResolvedValueOnce(todo).mockResolvedValueOnce(null).mockRejectedValueOnce(new Error('failure'));
        await expect(getTodo('todo')).resolves.toBe(todo);
        await expect(getTodo('missing')).resolves.toBeUndefined();
        await expect(getTodo('failed')).resolves.toBeUndefined();
    });
});

describe('birthday storage', () => {
    test('reads all birthdays and falls back to an empty list', async () => {
        const birthdays = [{id: 'birthday', name: 'Ada', date: '12-10', year: 1990}];
        database.getAllAsync.mockResolvedValueOnce(birthdays).mockRejectedValueOnce(new Error('failure'));
        await expect(getAllBirthdays()).resolves.toBe(birthdays);
        await expect(getAllBirthdays()).resolves.toEqual([]);
    });

    test('reads one birthday and handles missing or failed records', async () => {
        const birthday = {id: 'birthday', name: 'Ada', date: '12-10', year: 1990};
        database.getFirstAsync.mockResolvedValueOnce(birthday).mockResolvedValueOnce(null).mockRejectedValueOnce(new Error('failure'));
        await expect(getBirthday('birthday')).resolves.toBe(birthday);
        await expect(getBirthday('missing')).resolves.toBeUndefined();
        await expect(getBirthday('failed')).resolves.toBeUndefined();
    });

    test('rejects invalid birthday dates before writing', async () => {
        await expect(addBirthday('Ada', '02-30', 1990)).resolves.toEqual({ok: false, error: {code: 'validation_error'}});
        await expect(updateBirthday('birthday', 'Ada', 'invalid', 1990)).resolves.toEqual({ok: false, error: {code: 'validation_error'}});
        expect(database.runAsync).not.toHaveBeenCalled();
    });
});

describe('simple mutations', () => {
    test.each([
        ['addHabit', () => addHabit('Read', 2), events.sendAddEvents],
        ['updateHabit', () => updateHabit('habit', 'Read', 3), events.sendUpdateEvents],
        ['removeHabit', () => removeHabit('habit'), events.sendRemoveEvents],
        ['addChart', () => addChart('Weight'), events.sendAddChartEvents],
        ['removeChart', () => removeChart('chart'), events.sendRemoveChartEvents],
        ['addFridgeFood', () => addFridgeFood('Milk', 1000), events.sendAddFridgeFoodEvents],
        ['updateFoodFromFridge', () => updateFoodFromFridge('food', 'Milk', 2000), events.sendUpdateFridgeFoodEvents],
        ['removeFoodFromFridge', () => removeFoodFromFridge('food'), events.sendRemoveFridgeFoodEvents],
        ['addTodo', () => addTodo('Call', 1000), events.sendAddTodoEvents],
        ['updateTodo', () => updateTodo('todo', 'Call', 2000), events.sendUpdateTodoEvents],
        ['removeTodo', () => removeTodo('todo'), events.sendRemoveTodoEvents],
        ['addBirthday', () => addBirthday('Ada', '12-10', 1990), events.sendAddBirthdayEvents],
        ['updateBirthday', () => updateBirthday('birthday', 'Ada', '12-10', 1991), events.sendUpdateBirthdayEvents],
        ['removeBirthday', () => removeBirthday('birthday'), events.sendRemoveBirthdayEvents],
    ])('%s writes successfully and emits its event', async (_name, mutate, sendEvent) => {
        await expect(mutate()).resolves.toEqual({ok: true, value: undefined});
        expect(database.runAsync).toHaveBeenCalledTimes(1);
        expect(sendEvent).toHaveBeenCalledTimes(1);
    });

    test.each([
        ['addHabit', () => addHabit('Read', 2)],
        ['updateHabit', () => updateHabit('habit', 'Read', 3)],
        ['removeHabit', () => removeHabit('habit')],
        ['addChart', () => addChart('Weight')],
        ['removeChart', () => removeChart('chart')],
        ['setChartValue', () => setChartValue('chart', 2)],
        ['addFridgeFood', () => addFridgeFood('Milk', 1000)],
        ['updateFoodFromFridge', () => updateFoodFromFridge('food', 'Milk', 2000)],
        ['removeFoodFromFridge', () => removeFoodFromFridge('food')],
        ['addTodo', () => addTodo('Call', 1000)],
        ['updateTodo', () => updateTodo('todo', 'Call', 2000)],
        ['removeTodo', () => removeTodo('todo')],
        ['addBirthday', () => addBirthday('Ada', '12-10', 1990)],
        ['updateBirthday', () => updateBirthday('birthday', 'Ada', '12-10', 1991)],
        ['removeBirthday', () => removeBirthday('birthday')],
    ])('%s returns a storage error when writing fails', async (_name, mutate) => {
        database.runAsync.mockRejectedValue(new Error('failure'));
        await expect(mutate()).resolves.toEqual({ok: false, error: {code: 'storage_error'}});
    });
});
