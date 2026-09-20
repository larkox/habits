import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import View from '@/components/base/View';
import useStorageMutation from "@/hooks/useStorageMutation";
import { addChart } from '@/store/storage';

type SaveButtonProps = {
    mutation: ReturnType<typeof useStorageMutation>;
    title: string;
}
function AddButton({
    mutation,
    title,
}: SaveButtonProps) {
    const [t] = useTranslation();
    const router = useRouter();

    const onPress = useCallback(async () => {
        const saved = await mutation.run(() => addChart(title));
        if (saved) {
            router.back();
        }
    }, [mutation, title, router]);
            
    return <Button
        text={t('charts.addChart.addButton')}
        onPress={onPress}
        loading={mutation.isPending}
    />
}
export default function AddChartScreen() {
    const mutation = useStorageMutation();
    const [title, setTitle] = useState('')
    const [t] = useTranslation();
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => <AddButton
                mutation={mutation}
                title={title}
            />,
        })
    }, [mutation, navigation, title])

    return (
        <View
            style={styles.container}
        >
            <Input
                label={t('charts.addChart.inputLabels.title')}
                placeholder={t('charts.addChart.inputLabels.titlePlaceholder')}
                onChange={setTitle}
                type='text'
                value={title}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 8,
    },
});
