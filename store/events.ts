import { DeviceEventEmitter } from "react-native";
import { EVENT_STORAGE_ADD_BIRTHDAY, EVENT_STORAGE_ADD_CHART, EVENT_STORAGE_ADD_CHART_VALUE, EVENT_STORAGE_ADD_FRIDGE_FOOD, EVENT_STORAGE_ADD_HABIT, EVENT_STORAGE_ADD_TODO, EVENT_STORAGE_DELETE_HABIT, EVENT_STORAGE_REMOVE_BIRTHDAY, EVENT_STORAGE_REMOVE_CHART, EVENT_STORAGE_REMOVE_FRIDGE_FOOD, EVENT_STORAGE_REMOVE_TODO, EVENT_STORAGE_UPDATE_BIRTHDAY, EVENT_STORAGE_UPDATE_FRIDGE_FOOD, EVENT_STORAGE_UPDATE_HABIT, EVENT_STORAGE_UPDATE_TODO } from "./constants";

export function sendAddEvents() {
    DeviceEventEmitter.emit(EVENT_STORAGE_ADD_HABIT);
}

export function sendUpdateEvents(id: string) {
    DeviceEventEmitter.emit(EVENT_STORAGE_UPDATE_HABIT, id)
}

export function sendRemoveEvents(id: string) {
    DeviceEventEmitter.emit(EVENT_STORAGE_DELETE_HABIT, id);
}

export function sendAddChartEvents() {
    DeviceEventEmitter.emit(EVENT_STORAGE_ADD_CHART);
}

export function sendAddChartValueEvents(chartId: string) {
    DeviceEventEmitter.emit(EVENT_STORAGE_ADD_CHART_VALUE, chartId);
}

export function sendRemoveChartEvents() {
    DeviceEventEmitter.emit(EVENT_STORAGE_REMOVE_CHART);
}

export function sendAddFridgeFoodEvents() {
    DeviceEventEmitter.emit(EVENT_STORAGE_ADD_FRIDGE_FOOD);
}

export function sendRemoveFridgeFoodEvents() {
    DeviceEventEmitter.emit(EVENT_STORAGE_REMOVE_FRIDGE_FOOD);
}

export function sendUpdateFridgeFoodEvents(id: string) {
    DeviceEventEmitter.emit(EVENT_STORAGE_UPDATE_FRIDGE_FOOD, id);
}

export function sendAddTodoEvents() {
    DeviceEventEmitter.emit(EVENT_STORAGE_ADD_TODO);
}

export function sendRemoveTodoEvents() {
    DeviceEventEmitter.emit(EVENT_STORAGE_REMOVE_TODO);
}

export function sendUpdateTodoEvents(id: string) {
    DeviceEventEmitter.emit(EVENT_STORAGE_UPDATE_TODO, id);
}

export function sendAddBirthdayEvents() {
    DeviceEventEmitter.emit(EVENT_STORAGE_ADD_BIRTHDAY);
}

export function sendRemoveBirthdayEvents() {
    DeviceEventEmitter.emit(EVENT_STORAGE_REMOVE_BIRTHDAY);
}

export function sendUpdateBirthdayEvents(id: string) {
    DeviceEventEmitter.emit(EVENT_STORAGE_UPDATE_BIRTHDAY, id);
}