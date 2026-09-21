import { DeviceEventEmitter } from 'react-native';

import {
    EVENT_STORAGE_ADD_BIRTHDAY,
    EVENT_STORAGE_ADD_CHART,
    EVENT_STORAGE_ADD_CHART_VALUE,
    EVENT_STORAGE_ADD_FRIDGE_FOOD,
    EVENT_STORAGE_ADD_HABIT,
    EVENT_STORAGE_ADD_TODO,
    EVENT_STORAGE_DELETE_HABIT,
    EVENT_STORAGE_IMPORT,
    EVENT_STORAGE_REMOVE_BIRTHDAY,
    EVENT_STORAGE_REMOVE_CHART,
    EVENT_STORAGE_REMOVE_FRIDGE_FOOD,
    EVENT_STORAGE_REMOVE_TODO,
    EVENT_STORAGE_UPDATE_BIRTHDAY,
    EVENT_STORAGE_UPDATE_FRIDGE_FOOD,
    EVENT_STORAGE_UPDATE_HABIT,
    EVENT_STORAGE_UPDATE_TODO,
} from './constants';
import {
    sendAddBirthdayEvents,
    sendAddChartEvents,
    sendAddChartValueEvents,
    sendAddEvents,
    sendAddFridgeFoodEvents,
    sendAddTodoEvents,
    sendImportEvents,
    sendRemoveBirthdayEvents,
    sendRemoveChartEvents,
    sendRemoveEvents,
    sendRemoveFridgeFoodEvents,
    sendRemoveTodoEvents,
    sendUpdateBirthdayEvents,
    sendUpdateEvents,
    sendUpdateFridgeFoodEvents,
    sendUpdateTodoEvents,
} from './events';

describe('storage events', () => {
    const emit = jest.spyOn(DeviceEventEmitter, 'emit').mockImplementation(() => true);

    beforeEach(() => {
        emit.mockClear();
    });

    test.each([
        [sendAddEvents, EVENT_STORAGE_ADD_HABIT],
        [sendAddChartEvents, EVENT_STORAGE_ADD_CHART],
        [sendRemoveChartEvents, EVENT_STORAGE_REMOVE_CHART],
        [sendAddFridgeFoodEvents, EVENT_STORAGE_ADD_FRIDGE_FOOD],
        [sendRemoveFridgeFoodEvents, EVENT_STORAGE_REMOVE_FRIDGE_FOOD],
        [sendAddTodoEvents, EVENT_STORAGE_ADD_TODO],
        [sendRemoveTodoEvents, EVENT_STORAGE_REMOVE_TODO],
        [sendAddBirthdayEvents, EVENT_STORAGE_ADD_BIRTHDAY],
        [sendRemoveBirthdayEvents, EVENT_STORAGE_REMOVE_BIRTHDAY],
        [sendImportEvents, EVENT_STORAGE_IMPORT],
    ])('emits %s', (send, event) => {
        send();
        expect(emit).toHaveBeenCalledWith(event);
    });

    test.each([
        [sendUpdateEvents, EVENT_STORAGE_UPDATE_HABIT],
        [sendRemoveEvents, EVENT_STORAGE_DELETE_HABIT],
        [sendAddChartValueEvents, EVENT_STORAGE_ADD_CHART_VALUE],
        [sendUpdateFridgeFoodEvents, EVENT_STORAGE_UPDATE_FRIDGE_FOOD],
        [sendUpdateTodoEvents, EVENT_STORAGE_UPDATE_TODO],
        [sendUpdateBirthdayEvents, EVENT_STORAGE_UPDATE_BIRTHDAY],
    ])('emits %s with its entity id', (send, event) => {
        send('entity-id');
        expect(emit).toHaveBeenCalledWith(event, 'entity-id');
    });
});
