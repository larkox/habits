import { useCallback, useEffect, useState } from "react";
import { DeviceEventEmitter, EmitterSubscription } from "react-native";
import { EVENT_STORAGE_ADD_CHART, EVENT_STORAGE_ADD_CHART_VALUE, EVENT_STORAGE_ADD_HABIT, EVENT_STORAGE_DELETE_HABIT, EVENT_STORAGE_REMOVE_CHART, EVENT_STORAGE_UPDATE_HABIT } from "./constants";
import { getAllChartIDs, getAllHabits, getChart, getChartValues, getHabit, getHabitCalendar } from "./storage";

function useGenericHook<T>(events: string[], getValue: () => Promise<T|undefined>) {
    const [value, setValue] = useState<T|undefined>(undefined);
    useEffect(() => {
        async function callback() {
            const updatedValue = await getValue();
            setValue(updatedValue);
        }
        const listeners: EmitterSubscription[] = [];
        for (const event of events) {
            listeners.push(DeviceEventEmitter.addListener(event, callback));
        }
        return () => {
            for (const listener of listeners) {
                listener.remove();
            }
        }
    }, [events, getValue]);

    useEffect(() => {
        async function asyncEffect() {
            const initialValue = await getValue();
            setValue(initialValue);
        }
        asyncEffect();
    }, [getValue]);

    return value;
}

function useGenericHookWithId<T>(id: string, events: string[], getValue: (id: string) => Promise<T|undefined>) {
    const [value, setValue] = useState<T|undefined>(undefined);
    useEffect(() => {
        async function callback(updatedId: string) {
            if (updatedId !== id) {
                return;
            }
            const updatedValue = await getValue(id);
            setValue(updatedValue);
        }
        const listeners: EmitterSubscription[] = [];
        for (const event of events) {
            listeners.push(DeviceEventEmitter.addListener(event, callback));
        }
        return () => {
            for (const listener of listeners) {
                listener.remove();
            }
        }
    }, [events, getValue, id]);

    useEffect(() => {
        async function asyncEffect() {
            const initialValue = await getValue(id);
            setValue(initialValue);
        }
        asyncEffect();
    }, [getValue, id]);

    return value;
}

const USE_HABIT_EVENTS = [EVENT_STORAGE_UPDATE_HABIT];
export function useHabit(id: string) {
    return useGenericHookWithId(id, USE_HABIT_EVENTS, getHabit);
}

const USE_HABIT_LIST_EVENTS = [
    EVENT_STORAGE_ADD_HABIT,
    EVENT_STORAGE_DELETE_HABIT,
    EVENT_STORAGE_UPDATE_HABIT,
];
export function useHabitList() {
    return useGenericHook(USE_HABIT_LIST_EVENTS, getAllHabits);
}

const USE_CHART_IDS_EVENTS = [
    EVENT_STORAGE_ADD_CHART,
    EVENT_STORAGE_REMOVE_CHART,
];
export function useChartIds() {
    return useGenericHook(USE_CHART_IDS_EVENTS, getAllChartIDs);
}

const USE_CHART_EVENTS: string[] = []
export function useChart(id: string) {
    return useGenericHookWithId(id, USE_CHART_EVENTS, getChart);
}

const USE_CHART_VALUES_EVENTS = [
    EVENT_STORAGE_ADD_CHART_VALUE,
];
export function useChartValues(id: string) {
    return useGenericHookWithId(id, USE_CHART_VALUES_EVENTS, getChartValues)
}

const USE_HABIT_CALENDAR_EVENTS = [
    EVENT_STORAGE_UPDATE_HABIT,
];

export function useHabitCalendar(id: string, monthStart: number) {
    const getCalendarById = useCallback(() => {
        return getHabitCalendar(id, monthStart);
    }, [id, monthStart]);
    return useGenericHookWithId(id, USE_HABIT_CALENDAR_EVENTS, getCalendarById)
}