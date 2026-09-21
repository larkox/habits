import { logDebug, logError } from '@/utils/log';

describe('logging utilities', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('forwards errors to the console', () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation();
        const error = new Error('failure');
        logError('message', error);
        expect(consoleError).toHaveBeenCalledWith('message', error);
    });

    test('forwards debug information to the console', () => {
        const consoleDebug = jest.spyOn(console, 'debug').mockImplementation();
        logDebug('message', {value: 1});
        expect(consoleDebug).toHaveBeenCalledWith('message', {value: 1});
    });
});
