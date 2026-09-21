import { DeviceEventEmitter } from 'react-native';

import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
    EVENT_STORAGE_ADD_BIRTHDAY,
    EVENT_STORAGE_ADD_CHART,
    EVENT_STORAGE_ADD_CHART_VALUE,
    EVENT_STORAGE_ADD_FRIDGE_FOOD,
    EVENT_STORAGE_ADD_HABIT,
    EVENT_STORAGE_IMPORT,
    EVENT_STORAGE_UPDATE_BIRTHDAY,
    EVENT_STORAGE_UPDATE_FRIDGE_FOOD,
    EVENT_STORAGE_UPDATE_HABIT,
    EVENT_STORAGE_UPDATE_TODO,
} from './constants';
import {
    useBirthday,
    useBirthdays,
    useChart,
    useChartIds,
    useChartValues,
    useFood,
    useFridgeFood,
    useHabit,
    useHabitCalendar,
    useHabitList,
    useTodo,
    useTodos,
} from './hooks';
import * as storage from './storage';

jest.mock('./storage', () => ({
    getAllBirthdays: jest.fn(),
    getAllChartIDs: jest.fn(),
    getAllFridgeFood: jest.fn(),
    getAllHabits: jest.fn(),
    getAllTodos: jest.fn(),
    getBirthday: jest.fn(),
    getChart: jest.fn(),
    getChartValues: jest.fn(),
    getFridgeFood: jest.fn(),
    getHabit: jest.fn(),
    getHabitCalendar: jest.fn(),
    getTodo: jest.fn(),
}));

async function expectInitialValue<T>(
    useValue: () => T | undefined,
    getter: jest.Mock,
    value: T,
) {
    getter.mockResolvedValue(value);
    const hook = await renderHook(useValue);
    await waitFor(() => expect(hook.result.current).toEqual(value));
    return hook;
}

async function expectRefresh<T>(
    useValue: () => T | undefined,
    getter: jest.Mock,
    initial: T,
    updated: T,
    event: string,
    eventId?: string,
) {
    getter.mockResolvedValueOnce(initial).mockResolvedValue(updated);
    const {result} = await renderHook(useValue);
    await waitFor(() => expect(result.current).toEqual(initial));

    await act(async () => {
        DeviceEventEmitter.emit(event, eventId);
        await Promise.resolve();
    });

    await waitFor(() => expect(result.current).toEqual(updated));
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe('useHabit', () => {
    test('loads a habit with its id', async () => {
        const habit = {id: 'habit', title: 'Read', periodicity: 1, lastDone: 1000};
        await expectInitialValue(() => useHabit('habit'), jest.mocked(storage.getHabit), habit);
        expect(storage.getHabit).toHaveBeenCalledWith('habit');
    });

    test('refreshes only for matching entity events', async () => {
        const initial = {id: 'habit', title: 'Read', periodicity: 1, lastDone: 1000};
        const updated = {...initial, title: 'Exercise'};
        jest.mocked(storage.getHabit).mockResolvedValueOnce(initial).mockResolvedValue(updated);
        const {result} = await renderHook(() => useHabit('habit'));
        await waitFor(() => expect(result.current).toEqual(initial));

        await act(async () => {
            DeviceEventEmitter.emit(EVENT_STORAGE_UPDATE_HABIT, 'other');
            await Promise.resolve();
        });
        expect(storage.getHabit).toHaveBeenCalledTimes(1);

        await act(async () => {
            DeviceEventEmitter.emit(EVENT_STORAGE_UPDATE_HABIT, 'habit');
            await Promise.resolve();
        });
        await waitFor(() => expect(result.current).toEqual(updated));
    });
});

describe('useHabitList', () => {
    test('loads all habits', async () => {
        const habits = [{id: 'habit', title: 'Read', periodicity: 1, lastDone: 1000}];
        await expectInitialValue(useHabitList, jest.mocked(storage.getAllHabits), habits);
    });

    test('refreshes when a habit is added', async () => {
        const initial = [{id: 'habit', title: 'Read', periodicity: 1, lastDone: 1000}];
        const updated = [...initial, {id: 'second', title: 'Exercise', periodicity: 2, lastDone: 2000}];
        await expectRefresh(useHabitList, jest.mocked(storage.getAllHabits), initial, updated, EVENT_STORAGE_ADD_HABIT);
    });
});

describe('useChartIds', () => {
    test('loads all chart ids', async () => {
        await expectInitialValue(useChartIds, jest.mocked(storage.getAllChartIDs), ['one', 'two']);
    });

    test('refreshes when a chart is added', async () => {
        await expectRefresh(useChartIds, jest.mocked(storage.getAllChartIDs), ['one'], ['one', 'two'], EVENT_STORAGE_ADD_CHART);
    });
});

describe('useChart', () => {
    test('loads a chart with its id', async () => {
        const chart = {id: 'chart', title: 'Weight'};
        await expectInitialValue(() => useChart('chart'), jest.mocked(storage.getChart), chart);
        expect(storage.getChart).toHaveBeenCalledWith('chart');
    });

    test('refreshes after an import', async () => {
        const initial = {id: 'chart', title: 'Weight'};
        const updated = {...initial, title: 'Body weight'};
        await expectRefresh(() => useChart('chart'), jest.mocked(storage.getChart), initial, updated, EVENT_STORAGE_IMPORT);
    });
});

describe('useChartValues', () => {
    test('loads values with their chart id', async () => {
        const values = [{id: 'value', chartId: 'chart', value: 72, date: 1000}];
        await expectInitialValue(() => useChartValues('chart'), jest.mocked(storage.getChartValues), values);
        expect(storage.getChartValues).toHaveBeenCalledWith('chart');
    });

    test('refreshes when a value is added to the chart', async () => {
        const initial = [{id: 'value', chartId: 'chart', value: 72, date: 1000}];
        const updated = [...initial, {id: 'second', chartId: 'chart', value: 71, date: 2000}];
        await expectRefresh(() => useChartValues('chart'), jest.mocked(storage.getChartValues), initial, updated, EVENT_STORAGE_ADD_CHART_VALUE, 'chart');
    });
});

describe('useHabitCalendar', () => {
    test('loads the requested habit and month', async () => {
        const dates = [{date: 1000}];
        await expectInitialValue(() => useHabitCalendar('habit', 500), jest.mocked(storage.getHabitCalendar), dates);
        expect(storage.getHabitCalendar).toHaveBeenCalledWith('habit', 500);
    });

    test('refreshes when the habit is updated', async () => {
        const initial = [{date: 1000}];
        const updated = [...initial, {date: 2000}];
        await expectRefresh(() => useHabitCalendar('habit', 500), jest.mocked(storage.getHabitCalendar), initial, updated, EVENT_STORAGE_UPDATE_HABIT, 'habit');
    });
});

describe('useFridgeFood', () => {
    test('loads all fridge food', async () => {
        const foods = [{id: 'food', name: 'Milk', date: 1000}];
        await expectInitialValue(useFridgeFood, jest.mocked(storage.getAllFridgeFood), foods);
    });

    test('refreshes when food is added', async () => {
        const initial = [{id: 'food', name: 'Milk', date: 1000}];
        const updated = [...initial, {id: 'second', name: 'Cheese', date: 2000}];
        await expectRefresh(useFridgeFood, jest.mocked(storage.getAllFridgeFood), initial, updated, EVENT_STORAGE_ADD_FRIDGE_FOOD);
    });
});

describe('useFood', () => {
    test('loads food with its id', async () => {
        const food = {id: 'food', name: 'Milk', date: 1000};
        await expectInitialValue(() => useFood('food'), jest.mocked(storage.getFridgeFood), food);
        expect(storage.getFridgeFood).toHaveBeenCalledWith('food');
    });

    test('refreshes only when the matching food is updated', async () => {
        const initial = {id: 'food', name: 'Milk', date: 1000};
        const updated = {...initial, name: 'Oat milk'};
        jest.mocked(storage.getFridgeFood).mockResolvedValueOnce(initial).mockResolvedValue(updated);
        const {result} = await renderHook(() => useFood('food'));
        await waitFor(() => expect(result.current).toEqual(initial));

        await act(async () => {
            DeviceEventEmitter.emit(EVENT_STORAGE_UPDATE_FRIDGE_FOOD, 'other');
            await Promise.resolve();
        });
        expect(storage.getFridgeFood).toHaveBeenCalledTimes(1);

        await act(async () => {
            DeviceEventEmitter.emit(EVENT_STORAGE_UPDATE_FRIDGE_FOOD, 'food');
            await Promise.resolve();
        });
        await waitFor(() => expect(result.current).toEqual(updated));
    });
});

describe('useTodos', () => {
    test('loads todos and refreshes after an import', async () => {
        const initial = [{id: 'todo', name: 'Call', date: 1000}];
        const imported = [{id: 'imported', name: 'Write', date: 2000}];
        jest.mocked(storage.getAllTodos).mockResolvedValueOnce(initial).mockResolvedValue(imported);
        const {result} = await renderHook(useTodos);
        await waitFor(() => expect(result.current).toEqual(initial));

        await act(async () => {
            DeviceEventEmitter.emit(EVENT_STORAGE_IMPORT);
            await Promise.resolve();
        });
        await waitFor(() => expect(result.current).toEqual(imported));
    });
});

describe('useTodo', () => {
    test('loads a todo with its id', async () => {
        const todo = {id: 'todo', name: 'Call', date: 1000};
        await expectInitialValue(() => useTodo('todo'), jest.mocked(storage.getTodo), todo);
        expect(storage.getTodo).toHaveBeenCalledWith('todo');
    });

    test('refreshes when the matching todo is updated', async () => {
        const initial = {id: 'todo', name: 'Call', date: 1000};
        const updated = {...initial, name: 'Call Ada'};
        await expectRefresh(() => useTodo('todo'), jest.mocked(storage.getTodo), initial, updated, EVENT_STORAGE_UPDATE_TODO, 'todo');
    });
});

describe('useBirthdays', () => {
    test('loads all birthdays', async () => {
        const birthdays = [{id: 'birthday', name: 'Ada', date: '12-10', year: 1990}];
        await expectInitialValue(useBirthdays, jest.mocked(storage.getAllBirthdays), birthdays);
    });

    test('refreshes when a birthday is added', async () => {
        const initial = [{id: 'birthday', name: 'Ada', date: '12-10', year: 1990}];
        const updated = [...initial, {id: 'second', name: 'Grace', date: '09-12', year: 1906}];
        await expectRefresh(useBirthdays, jest.mocked(storage.getAllBirthdays), initial, updated, EVENT_STORAGE_ADD_BIRTHDAY);
    });
});

describe('useBirthday', () => {
    test('loads a birthday with its id', async () => {
        const birthday = {id: 'birthday', name: 'Ada', date: '12-10', year: 1990};
        await expectInitialValue(() => useBirthday('birthday'), jest.mocked(storage.getBirthday), birthday);
        expect(storage.getBirthday).toHaveBeenCalledWith('birthday');
    });

    test('refreshes when the matching birthday is updated', async () => {
        const initial = {id: 'birthday', name: 'Ada', date: '12-10', year: 1990};
        const updated = {...initial, name: 'Ada Lovelace'};
        await expectRefresh(() => useBirthday('birthday'), jest.mocked(storage.getBirthday), initial, updated, EVENT_STORAGE_UPDATE_BIRTHDAY, 'birthday');
    });
});
