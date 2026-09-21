
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { Result } from '@/types/result';
import { logError } from '@/utils/log';

type ShareJsonFileOptions = {
    contents: string;
    fileName: string;
    dialogTitle: string;
};

function removeTemporaryFile(file: File | undefined) {
    try {
        if (file?.exists) {
            file.delete();
        }
    } catch (error) {
        logError('error removing temporary file', error);
    }
}

export async function shareJsonFile({
    contents,
    fileName,
    dialogTitle,
}: ShareJsonFileOptions): Promise<Result> {
    let temporaryFile: File | undefined;
    try {
        temporaryFile = new File(Paths.cache, fileName);
        removeTemporaryFile(temporaryFile);
        temporaryFile.create();
        temporaryFile.write(contents);
        await Sharing.shareAsync(temporaryFile.uri, {
            dialogTitle,
            mimeType: 'application/json',
            UTI: 'public.json',
        });
        removeTemporaryFile(temporaryFile);
        return {ok: true, value: undefined};
    } catch (error) {
        logError('error sharing JSON file', error);
        removeTemporaryFile(temporaryFile);
        return {ok: false, error: {code: 'storage_error'}};
    }
}

export async function pickJsonFile(maxBytes: number): Promise<Result<string | undefined>> {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true,
            multiple: false,
        });
        if (result.canceled) {
            return {ok: true, value: undefined};
        }

        const asset = result.assets[0];
        if (!asset || (asset.size !== undefined && asset.size > maxBytes)) {
            return {ok: false, error: {code: 'validation_error'}};
        }
        const contents = asset.file ? await asset.file.text() : await new File(asset.uri).text();
        if (new TextEncoder().encode(contents).length > maxBytes) {
            return {ok: false, error: {code: 'validation_error'}};
        }
        return {ok: true, value: contents};
    } catch (error) {
        logError('error selecting JSON file', error);
        return {ok: false, error: {code: 'storage_error'}};
    }
}
