import { Alert } from 'react-native';

import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import DataScreen from '@/app/(tabs)/data/index';
import { pickJsonFile, shareJsonFile } from '@/platform/jsonFiles';
import { createBackup, importBackup, parseBackupFile } from '@/store/backup';

jest.mock("@/platform/translations", () => ({useTranslate: () => (key: string) => key}));
jest.mock('@/platform/jsonFiles', () => ({pickJsonFile: jest.fn(), shareJsonFile: jest.fn()}));
jest.mock('@/store/backup', () => ({createBackup: jest.fn(), importBackup: jest.fn(), parseBackupFile: jest.fn()}));

const backup = {version: 1};
const file = '{"version":1}';

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.mocked(createBackup).mockResolvedValue({ok: true, value: backup} as never);
    jest.mocked(shareJsonFile).mockResolvedValue({ok: true} as never);
    jest.mocked(pickJsonFile).mockResolvedValue({ok: true, value: file} as never);
    jest.mocked(parseBackupFile).mockReturnValue({ok: true, value: backup} as never);
    jest.mocked(importBackup).mockResolvedValue({ok: true} as never);
});
afterEach(() => jest.restoreAllMocks());

async function press(label: string) {
    const screen = await render(<DataScreen/>);
    await fireEvent.press(screen.getByRole('button', {name: label}));
    return screen;
}

describe('data screen', () => {
    test.each(['elements', 'history'] as const)('exports %s with selected scope', async scope => {
        await press(`data.export.${scope === 'elements' ? 'elements' : 'history'}Button`);
        await waitFor(() => expect(shareJsonFile).toHaveBeenCalledTimes(1));
        expect(createBackup).toHaveBeenCalledWith(scope);
        expect(shareJsonFile).toHaveBeenCalledWith(expect.objectContaining({
            contents: JSON.stringify(backup, null, 2),
            fileName: expect.stringContaining(`habits-${scope}-`),
        }));
    });

    test('reports backup creation failure without sharing', async () => {
        jest.mocked(createBackup).mockResolvedValue({ok: false, error: {code: 'unknown'}} as never);
        await press('data.export.elementsButton');
        await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('data.errors.exportTitle', 'data.errors.exportMessage'));
        expect(shareJsonFile).not.toHaveBeenCalled();
    });

    test('reports sharing failure', async () => {
        jest.mocked(shareJsonFile).mockResolvedValue({ok: false, error: {code: 'unknown'}} as never);
        await press('data.export.historyButton');
        await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('data.errors.exportTitle', 'data.errors.exportMessage'));
    });

    test('appends a valid selected backup', async () => {
        await press('data.import.appendButton');
        await waitFor(() => expect(importBackup).toHaveBeenCalledWith(backup, 'append'));
        expect(pickJsonFile).toHaveBeenCalledWith(10 * 1024 * 1024);
        expect(parseBackupFile).toHaveBeenCalledWith(file);
        expect(Alert.alert).toHaveBeenCalledWith('data.import.successTitle', 'data.import.successMessage');
    });

    test('does nothing when picking is cancelled', async () => {
        jest.mocked(pickJsonFile).mockResolvedValue({ok: true, value: undefined} as never);
        await press('data.import.appendButton');
        await waitFor(() => expect(pickJsonFile).toHaveBeenCalledTimes(1));
        expect(parseBackupFile).not.toHaveBeenCalled();
        expect(importBackup).not.toHaveBeenCalled();
    });

    test.each([
        ['validation_error', 'data.errors.invalidTitle', 'data.errors.invalidMessage'],
        ['file_error', 'data.errors.importTitle', 'data.errors.importMessage'],
    ])('reports picker %s', async (code, title, message) => {
        jest.mocked(pickJsonFile).mockResolvedValue({ok: false, error: {code}} as never);
        await press('data.import.appendButton');
        await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith(title, message));
        expect(importBackup).not.toHaveBeenCalled();
    });

    test('rejects invalid backup contents', async () => {
        jest.mocked(parseBackupFile).mockReturnValue({ok: false, error: {code: 'validation_error'}} as never);
        await press('data.import.appendButton');
        await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('data.errors.invalidTitle', 'data.errors.invalidMessage'));
        expect(importBackup).not.toHaveBeenCalled();
    });

    test('reports import failure', async () => {
        jest.mocked(importBackup).mockResolvedValue({ok: false, error: {code: 'unknown'}} as never);
        await press('data.import.appendButton');
        await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('data.errors.importTitle', 'data.errors.importMessage'));
    });

    test('confirms before replacing and imports only after approval', async () => {
        await press('data.import.replaceButton');
        expect(pickJsonFile).not.toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalledWith('data.import.replaceConfirmTitle', 'data.import.replaceConfirmMessage', expect.any(Array));
        await act(async () => { jest.mocked(Alert.alert).mock.lastCall?.[2]?.[1].onPress?.(); });
        await waitFor(() => expect(importBackup).toHaveBeenCalledWith(backup, 'replace'));
    });
});
