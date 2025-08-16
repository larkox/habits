import { StyleSheet } from 'react-native';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import View from '@/components/base/View';
import { useChartValues } from '@/store/hooks';
import { addChartValue, updateChartValue } from '@/store/storage';
import { getChartValueForToday } from '@/utils/charts';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type SaveButtonProps = {
    value: string;
    valueId?: string;
    chartId: string;
}

function SaveButton({
    value,
    valueId,
    chartId,
}: SaveButtonProps) {
    const router = useRouter();
    const [t] = useTranslation();

    const onPress = useCallback(() => {
        const numberValue = parseFloat(value);
        if (isNaN(numberValue)) {
            return;
        }
        if (valueId) {
            updateChartValue(chartId, valueId, numberValue);
        } else {
            addChartValue(chartId, numberValue);
        }
        router.back();
    }, [value, valueId, chartId, router]);

    const text = valueId ? t('charts.addValue.updateValueButton') : t('charts.addValue.addButton');
    return <Button text={text} onPress={onPress}/>
}

export default function AddChartValue() {
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
            headerRight: () => <SaveButton value={value} chartId={chartId} valueId={todayValue?.id}/>,
        })
    }, [chartId, navigation, value, todayValue?.id])

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
