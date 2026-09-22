import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { logError } from '@/utils/log';

import { pickJsonFile, shareJsonFile } from './jsonFiles';

jest.mock('expo-document-picker', () => ({getDocumentAsync: jest.fn()}));
jest.mock('expo-file-system', () => ({
    File: jest.fn(),
    Paths: {cache: 'cache-directory'},
}));
jest.mock('expo-sharing', () => ({shareAsync: jest.fn()}));
jest.mock('@/utils/log', () => ({logError: jest.fn()}));

const mockedDocumentPicker = jest.mocked(DocumentPicker.getDocumentAsync);
const MockedFile = jest.mocked(File);
const mockedShare = jest.mocked(Sharing.shareAsync);
const mockedLogError = jest.mocked(logError);

function fileMock(overrides: Partial<{
    exists: boolean;
    uri: string;
    create: jest.Mock;
    write: jest.Mock;
    delete: jest.Mock;
    text: jest.Mock;
}> = {}) {
    return {
        exists: true,
        uri: 'file://temporary/backup.json',
        create: jest.fn(),
        write: jest.fn(),
        delete: jest.fn(),
        text: jest.fn(),
        ...overrides,
    };
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe('shareJsonFile', () => {
    test('does not delete a temporary file that does not exist', async () => {
        const temporaryFile = fileMock({exists: false});
        MockedFile.mockImplementation(() => temporaryFile as never);
        mockedShare.mockResolvedValue(undefined);

        await expect(shareJsonFile({
            contents: '{}',
            fileName: 'backup.json',
            dialogTitle: 'Export backup',
        })).resolves.toEqual({ok: true, value: undefined});

        expect(temporaryFile.delete).not.toHaveBeenCalled();
        expect(mockedShare).toHaveBeenCalledTimes(1);
    });

    test('writes, shares, and removes a temporary JSON file', async () => {
        const temporaryFile = fileMock();
        MockedFile.mockImplementation(() => temporaryFile as never);
        mockedShare.mockResolvedValue(undefined);

        await expect(shareJsonFile({
            contents: '{"value":1}',
            fileName: 'backup.json',
            dialogTitle: 'Export backup',
        })).resolves.toEqual({ok: true, value: undefined});

        expect(MockedFile).toHaveBeenCalledWith(Paths.cache, 'backup.json');
        expect(temporaryFile.create).toHaveBeenCalledTimes(1);
        expect(temporaryFile.write).toHaveBeenCalledWith('{"value":1}');
        expect(mockedShare).toHaveBeenCalledWith(temporaryFile.uri, {
            dialogTitle: 'Export backup',
            mimeType: 'application/json',
            UTI: 'public.json',
        });
        expect(temporaryFile.delete).toHaveBeenCalledTimes(2);
    });

    test('returns a storage error and removes the temporary file when sharing fails', async () => {
        const temporaryFile = fileMock();
        const error = new Error('sharing failed');
        MockedFile.mockImplementation(() => temporaryFile as never);
        mockedShare.mockRejectedValue(error);

        await expect(shareJsonFile({
            contents: '{}',
            fileName: 'backup.json',
            dialogTitle: 'Export backup',
        })).resolves.toEqual({ok: false, error: {code: 'storage_error'}});

        expect(temporaryFile.delete).toHaveBeenCalledTimes(2);
        expect(mockedLogError).toHaveBeenCalledWith('error sharing JSON file', error);
    });

    test('continues when an existing temporary file cannot be removed', async () => {
        const deleteError = new Error('delete failed');
        const temporaryFile = fileMock({delete: jest.fn(() => {
            throw deleteError;
        })});
        MockedFile.mockImplementation(() => temporaryFile as never);
        mockedShare.mockResolvedValue(undefined);

        await expect(shareJsonFile({
            contents: '{}',
            fileName: 'backup.json',
            dialogTitle: 'Export backup',
        })).resolves.toEqual({ok: true, value: undefined});

        expect(mockedShare).toHaveBeenCalledTimes(1);
        expect(mockedLogError).toHaveBeenCalledTimes(2);
        expect(mockedLogError).toHaveBeenCalledWith('error removing temporary file', deleteError);
    });
});

describe('pickJsonFile', () => {
    test('returns no contents when document selection is canceled', async () => {
        mockedDocumentPicker.mockResolvedValue({canceled: true, assets: null});

        await expect(pickJsonFile(100)).resolves.toEqual({ok: true, value: undefined});
        expect(mockedDocumentPicker).toHaveBeenCalledWith({
            type: 'application/json',
            copyToCacheDirectory: true,
            multiple: false,
        });
    });

    test('reads the file supplied by the document picker', async () => {
        const pickedFile = {text: jest.fn().mockResolvedValue('{"value":1}')};
        mockedDocumentPicker.mockResolvedValue({
            canceled: false,
            assets: [{name: 'backup.json', uri: 'file://backup.json', size: 11, lastModified: 0, file: pickedFile as never}],
        });

        await expect(pickJsonFile(100)).resolves.toEqual({ok: true, value: '{"value":1}'});
        expect(pickedFile.text).toHaveBeenCalledTimes(1);
        expect(MockedFile).not.toHaveBeenCalled();
    });

    test('reads a selected URI when the picker does not supply a file', async () => {
        const selectedFile = fileMock({text: jest.fn().mockResolvedValue('{}')});
        MockedFile.mockImplementation(() => selectedFile as never);
        mockedDocumentPicker.mockResolvedValue({
            canceled: false,
            assets: [{name: 'backup.json', uri: 'file://backup.json', lastModified: 0}],
        });

        await expect(pickJsonFile(100)).resolves.toEqual({ok: true, value: '{}'});
        expect(MockedFile).toHaveBeenCalledWith('file://backup.json');
        expect(selectedFile.text).toHaveBeenCalledTimes(1);
    });

    test('rejects a result without an asset', async () => {
        mockedDocumentPicker.mockResolvedValue({canceled: false, assets: []});

        await expect(pickJsonFile(100)).resolves.toEqual({ok: false, error: {code: 'validation_error'}});
    });

    test('rejects a file whose reported size exceeds the limit without reading it', async () => {
        const pickedFile = {text: jest.fn()};
        mockedDocumentPicker.mockResolvedValue({
            canceled: false,
            assets: [{name: 'backup.json', uri: 'file://backup.json', size: 101, lastModified: 0, file: pickedFile as never}],
        });

        await expect(pickJsonFile(100)).resolves.toEqual({ok: false, error: {code: 'validation_error'}});
        expect(pickedFile.text).not.toHaveBeenCalled();
    });

    test('uses the UTF-8 byte size to validate the file contents', async () => {
        const pickedFile = {text: jest.fn().mockResolvedValue('é')};
        mockedDocumentPicker.mockResolvedValue({
            canceled: false,
            assets: [{name: 'backup.json', uri: 'file://backup.json', size: 1, lastModified: 0, file: pickedFile as never}],
        });

        await expect(pickJsonFile(1)).resolves.toEqual({ok: false, error: {code: 'validation_error'}});
    });

    test('returns a storage error when selecting the document fails', async () => {
        const error = new Error('picker failed');
        mockedDocumentPicker.mockRejectedValue(error);

        await expect(pickJsonFile(100)).resolves.toEqual({ok: false, error: {code: 'storage_error'}});
        expect(mockedLogError).toHaveBeenCalledWith('error selecting JSON file', error);
    });

    test('returns a storage error when reading the document fails', async () => {
        const error = new Error('read failed');
        mockedDocumentPicker.mockResolvedValue({
            canceled: false,
            assets: [{
                name: 'backup.json',
                uri: 'file://backup.json',
                lastModified: 0,
                file: {text: jest.fn().mockRejectedValue(error)} as never,
            }],
        });

        await expect(pickJsonFile(100)).resolves.toEqual({ok: false, error: {code: 'storage_error'}});
        expect(mockedLogError).toHaveBeenCalledWith('error selecting JSON file', error);
    });
});
