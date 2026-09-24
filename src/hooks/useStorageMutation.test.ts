import { Alert } from 'react-native';

import { act, renderHook } from '@testing-library/react-native';

import type { Result } from '@/types/result';

import useStorageMutation from './useStorageMutation';

jest.mock('@/platform/translations', () => ({
    useTranslate: () => (key: string) => key,
}));

function deferredResult() {
    let resolve!: (result: Result) => void;
    const promise = new Promise<Result>(promiseResolve => {
        resolve = promiseResolve;
    });
    return {promise, resolve};
}

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation();
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('useStorageMutation', () => {
    test('reports pending state and succeeds when the operation succeeds', async () => {
        const operation = deferredResult();
        const {result} = await renderHook(useStorageMutation);
        let runResult: boolean | undefined;
        let running!: Promise<void>;

        await act(() => {
            running = result.current.run(() => operation.promise).then(value => {
                runResult = value;
            });
        });
        expect(result.current.isPending).toBe(true);

        await act(async () => {
            operation.resolve({ok: true, value: undefined});
            await running;
        });

        expect(runResult).toBe(true);
        expect(result.current.isPending).toBe(false);
        expect(Alert.alert).not.toHaveBeenCalled();
    });

    test.each([
        ['validation_error', 'errors.validationTitle', 'errors.validationMessage'],
        ['storage_error', 'errors.storageTitle', 'errors.storageMessage'],
    ] as const)('shows the translated alert for a %s', async (code, title, message) => {
        const {result} = await renderHook(useStorageMutation);
        let runResult: boolean | undefined;

        await act(async () => {
            runResult = await result.current.run(async () => ({ok: false, error: {code}}));
        });

        expect(runResult).toBe(false);
        expect(result.current.isPending).toBe(false);
        expect(Alert.alert).toHaveBeenCalledWith(title, message);
    });

    test('blocks another operation while one is already running', async () => {
        const operation = deferredResult();
        const firstOperation = jest.fn(() => operation.promise);
        const secondOperation = jest.fn(async (): Promise<Result> => ({ok: true, value: undefined}));
        const {result} = await renderHook(useStorageMutation);
        let firstResult: boolean | undefined;
        let secondResult: boolean | undefined;

        let firstRun!: Promise<void>;
        await act(() => {
            firstRun = result.current.run(firstOperation).then(value => {
                firstResult = value;
            });
        });
        await act(async () => {
            secondResult = await result.current.run(secondOperation);
        });
        await act(async () => {
            operation.resolve({ok: true, value: undefined});
            await firstRun;
        });

        expect(firstResult).toBe(true);
        expect(secondResult).toBe(false);
        expect(firstOperation).toHaveBeenCalledTimes(1);
        expect(secondOperation).not.toHaveBeenCalled();
    });

    test('does not update state or report success after unmounting', async () => {
        const operation = deferredResult();
        const {result, unmount} = await renderHook(useStorageMutation);
        let running!: Promise<boolean>;

        await act(() => {
            running = result.current.run(() => operation.promise);
        });
        await act(() => {
            unmount();
        });
        await act(async () => {
            operation.resolve({ok: true, value: undefined});
        });

        await expect(running).resolves.toBe(false);
    });

    test('clears pending state when the operation throws', async () => {
        const error = new Error('failure');
        const {result} = await renderHook(useStorageMutation);
        let rejection!: Promise<void>;

        await act(() => {
            const running = result.current.run(async () => {
                throw error;
            });
            rejection = expect(running).rejects.toBe(error);
        });
        await act(async () => {
            await rejection;
        });

        expect(result.current.isPending).toBe(false);
    });
});
