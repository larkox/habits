import { InMemorySQLite } from '@/test/inMemorySQLite';
import { newId } from '@/utils/crypto';
import { getMonthStart, getStartOfDay } from '@/utils/time';

import { getDatabase } from './db';
import { runMigrations } from './migrations/runner';
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
    getChartValues,
    getHabitCalendar,
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

jest.mock('./db', () => ({getDatabase: jest.fn()}));
jest.mock('@/utils/crypto', () => ({newId: jest.fn()}));

const mockedGetDatabase = jest.mocked(getDatabase);
const mockedNewId = jest.mocked(newId);
let memory: InMemorySQLite;

beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 8, 21, 12));
    memory = new InMemorySQLite();
    mockedGetDatabase.mockResolvedValue(memory.asExpoDatabase());
    let id = 0;
    mockedNewId.mockImplementation(() => `id-${++id}`);
    await runMigrations(memory.asExpoDatabase());
});

afterEach(() => {
    memory.close();
    jest.useRealTimers();
});

describe('habit storage integration', () => {
    test('creates, completes, updates, reads history, and removes a habit', async () => {
        await expect(addHabit('Read', 2)).resolves.toEqual({ok: true, value: undefined});
        const [habit] = (await getAllHabits())!;
        expect(habit).toMatchObject({title: 'Read', periodicity: 2});

        await expect(doHabit(habit.id)).resolves.toEqual({ok: true, value: undefined});
        await expect(doHabit(habit.id)).resolves.toEqual({ok: true, value: undefined});
        expect(await getHabitCalendar(habit.id, getMonthStart())).toEqual([{date: getStartOfDay()}]);

        await expect(updateHabit(habit.id, 'Exercise', 3)).resolves.toEqual({ok: true, value: undefined});
        expect(await getAllHabits()).toEqual([expect.objectContaining({title: 'Exercise', periodicity: 3})]);

        await expect(removeHabit(habit.id)).resolves.toEqual({ok: true, value: undefined});
        expect(await getAllHabits()).toEqual([]);
        expect(await getHabitCalendar(habit.id, getMonthStart())).toEqual([]);
    });
});

describe('chart storage integration', () => {
    test('upserts today value and cascades history when removing its chart', async () => {
        await addChart('Weight');
        const [chartId] = (await getAllChartIDs())!;

        await setChartValue(chartId, 72);
        await setChartValue(chartId, 71.5);
        expect(await getChartValues(chartId)).toEqual([
            expect.objectContaining({chartId, value: 71.5, date: getStartOfDay()}),
        ]);

        await removeChart(chartId);
        expect(await getAllChartIDs()).toEqual([]);
        expect(await getChartValues(chartId)).toEqual([]);
    });
});

describe('fridge storage integration', () => {
    test('creates, updates, and removes food', async () => {
        await addFridgeFood('Milk', getStartOfDay());
        const [food] = await getAllFridgeFood();
        await updateFoodFromFridge(food.id, 'Yogurt', getStartOfDay() + 1000);
        expect(await getAllFridgeFood()).toEqual([
            expect.objectContaining({name: 'Yogurt', date: getStartOfDay() + 1000}),
        ]);
        await removeFoodFromFridge(food.id);
        expect(await getAllFridgeFood()).toEqual([]);
    });
});

describe('todo storage integration', () => {
    test('creates, updates, and removes a todo', async () => {
        await addTodo('Call', getStartOfDay());
        const [todo] = await getAllTodos();
        await updateTodo(todo.id, 'Write', getStartOfDay() + 1000);
        expect(await getAllTodos()).toEqual([
            expect.objectContaining({name: 'Write', date: getStartOfDay() + 1000}),
        ]);
        await removeTodo(todo.id);
        expect(await getAllTodos()).toEqual([]);
    });
});

describe('birthday storage integration', () => {
    test('validates, creates, updates, and removes a birthday', async () => {
        await expect(addBirthday('Ada', '02-30', 1990)).resolves.toEqual({ok: false, error: {code: 'validation_error'}});
        await addBirthday('Ada', '12-10', 1990);
        const [birthday] = await getAllBirthdays();
        await updateBirthday(birthday.id, 'Grace', '12-09', 1906);
        expect(await getAllBirthdays()).toEqual([
            expect.objectContaining({name: 'Grace', date: '12-09', year: 1906}),
        ]);
        await removeBirthday(birthday.id);
        expect(await getAllBirthdays()).toEqual([]);
    });
});
