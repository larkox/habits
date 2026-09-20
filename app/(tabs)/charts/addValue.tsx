import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import View from '@/components/base/View';
import useStorageMutation from "@/hooks/useStorageMutation";
import { useChartValues } from '@/store/hooks';
import { addChartValue, updateChartValue } from '@/store/storage';
import { getChartValueForToday } from '@/utils/charts';

type SaveButtonProps = {
    mutation: ReturnType<typeof useStorageMutation>;
    value: string;
    valueId?: string;
    chartId: string;
}

function SaveButton({
    mutation,
    value,
    valueId,
    chartId,
}: SaveButtonProps) {
    const router = useRouter();
    const [t] = useTranslation();

    const onPress = useCallback(async () => {
        const numberValue = parseFloat(value);
        if (isNaN(numberValue)) {
            return;
        }
        const saved = await mutation.run(() => valueId
            ? updateChartValue(chartId, valueId, numberValue)
            : addChartValue(chartId, numberValue));
        if (saved) {
            router.back();
        }
    }, [mutation, value, valueId, chartId, router]);

    const text = valueId ? t('charts.addValue.updateValueButton') : t('charts.addValue.addButton');
    return <Button
        text={text}
        onPress={onPress}
        loading={mutation.isPending}
    />
}

export default function AddChartValue() {
    const mutation = useStorageMutation();
    const {id: chartId} = useLocalSearchParams<{id: string}>();
    const navigation = useNavigation();
    const values = useChartValues(chartId);
    const todayValue = getChartValueForToday(values);
    const [t] = useTranslation();

    const [value, setValue] = useState('');


    // useChartValues return undefined at the beginning so we need
    // to update the state afterwards.
    useEffect(() => {
        if (todayValue) {
            setValue(todayValue.value.toString())
        }
    }, [todayValue]);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => <SaveButton
                mutation={mutation}
                value={value}
                chartId={chartId}
                valueId={todayValue?.id}
            />,
        })
    }, [mutation, chartId, navigation, value, todayValue?.id])

    return (
        <View
            style={styles.container}
        >
            <Input
                label={t('charts.addValue.inputLabels.value')}
                placeholder={t('charts.addValue.inputLabels.valuePlaceholder')}
                onChange={setValue}
                type='decimal'
                value={value}
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
