import { DeviceEventEmitter } from "react-native";
import { EVENT_STORAGE_ADD_CHART, EVENT_STORAGE_ADD_CHART_VALUE, EVENT_STORAGE_ADD_HABIT, EVENT_STORAGE_DELETE_HABIT, EVENT_STORAGE_REMOVE_CHART, EVENT_STORAGE_UPDATE_HABIT } from "./constants";

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