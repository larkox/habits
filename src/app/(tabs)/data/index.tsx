import { useCallback, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet } from 'react-native';


import Button from '@/components/base/Button';
import Text from '@/components/base/Text';
import View from '@/components/base/View';
import { pickJsonFile, shareJsonFile } from '@/platform/jsonFiles';
import { useTranslate } from "@/platform/translations";
import { createBackup, importBackup, parseBackupFile } from '@/store/backup';
import type { ExportScope, ImportMode } from '@/types/backup';

const MAX_BACKUP_BYTES = 10 * 1024 * 1024;

export default function DataScreen() {
    const [pendingAction, setPendingAction] = useState<string>();
    const t = useTranslate();

    const exportData = useCallback(async (scope: ExportScope) => {
        setPendingAction(`export-${scope}`);
        const backupResult = await createBackup(scope);
        if (!backupResult.ok) {
            Alert.alert(t('data.errors.exportTitle'), t('data.errors.exportMessage'));
            setPendingAction(undefined);
            return;
        }
        const shareResult = await shareJsonFile({
            contents: JSON.stringify(backupResult.value, null, 2),
            fileName: `habits-${scope}-${new Date().toISOString().slice(0, 10)}.json`,
            dialogTitle: t('data.export.shareTitle'),
        });
        if (!shareResult.ok) {
            Alert.alert(t('data.errors.exportTitle'), t('data.errors.exportMessage'));
        }
        setPendingAction(undefined);
    }, [t]);

    const runImport = useCallback(async (mode: ImportMode) => {
        setPendingAction(`import-${mode}`);
        const fileResult = await pickJsonFile(MAX_BACKUP_BYTES);
        if (!fileResult.ok) {
            const invalid = fileResult.error.code === 'validation_error';
            Alert.alert(
                t(invalid ? 'data.errors.invalidTitle' : 'data.errors.importTitle'),
                t(invalid ? 'data.errors.invalidMessage' : 'data.errors.importMessage'),
            );
            setPendingAction(undefined);
            return;
        }
        if (!fileResult.value) {
            setPendingAction(undefined);
            return;
        }
        const backupResult = parseBackupFile(fileResult.value);
        if (!backupResult.ok) {
            Alert.alert(t('data.errors.invalidTitle'), t('data.errors.invalidMessage'));
            setPendingAction(undefined);
            return;
        }
        const importResult = await importBackup(backupResult.value, mode);
        if (importResult.ok) {
            Alert.alert(t('data.import.successTitle'), t('data.import.successMessage'));
        } else {
            Alert.alert(t('data.errors.importTitle'), t('data.errors.importMessage'));
        }
        setPendingAction(undefined);
    }, [t]);

    const importData = useCallback((mode: ImportMode) => {
        if (mode === 'append') {
            void runImport(mode);
            return;
        }
        if (Platform.OS === 'web') {
            if (window.confirm(t('data.import.replaceConfirmMessage'))) {
                void runImport(mode);
            }
            return;
        }
        Alert.alert(
            t('data.import.replaceConfirmTitle'),
            t('data.import.replaceConfirmMessage'),
            [
                {text: t('data.import.cancelButton'), style: 'cancel'},
                {text: t('data.import.replaceConfirmButton'), style: 'destructive', onPress: () => void runImport(mode)},
            ],
        );
    }, [runImport, t]);

    const isPending = pendingAction !== undefined;
    return (
        <ScrollView contentContainerStyle={styles.content}>
            <View
                color="background"
                style={styles.section}
            >
                <Text
                    context="foreground"
                    type="subtitle"
                >
                    {t('data.export.title')}
                </Text>
                <Text context="foreground">{t('data.export.description')}</Text>
                <Button
                    text={t('data.export.elementsButton')}
                    onPress={() => void exportData('elements')}
                    loading={pendingAction === 'export-elements'}
                    disabled={isPending}
                />
                <Button
                    text={t('data.export.historyButton')}
                    onPress={() => void exportData('history')}
                    loading={pendingAction === 'export-history'}
                    disabled={isPending}
                />
            </View>
            <View
                color="background"
                style={styles.section}
            >
                <Text
                    context="foreground"
                    type="subtitle"
                >
                    {t('data.import.title')}
                </Text>
                <Text context="foreground">{t('data.import.description')}</Text>
                <Button
                    text={t('data.import.appendButton')}
                    onPress={() => importData('append')}
                    loading={pendingAction === 'import-append'}
                    disabled={isPending}
                />
                <Button
                    text={t('data.import.replaceButton')}
                    onPress={() => importData('replace')}
                    loading={pendingAction === 'import-replace'}
                    disabled={isPending}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        flexGrow: 1,
        backgroundColor: 'transparent',
        gap: 24,
        padding: 16,
    },
    section: {
        gap: 12,
        padding: 0,
    },
});
