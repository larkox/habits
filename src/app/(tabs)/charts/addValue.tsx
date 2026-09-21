import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import View from '@/components/base/View';
import useStorageMutation from "@/hooks/useStorageMutation";
import { useChartValues } from '@/store/hooks';
import { setChartValue } from '@/store/storage';
import { getChartValueForToday } from '@/utils/charts';
import { parseLocalizedNumber } from '@/utils/validation';

type FormErrors = {
    value?: string;
};

type SaveButtonProps = {
    loading: boolean;
    onPress: () => void;
    isUpdate: boolean;
}

function SaveButton({
    loading,
    onPress,
    isUpdate,
}: SaveButtonProps) {
    const [t] = useTranslation();

    const text = isUpdate ? t('charts.addValue.updateValueButton') : t('charts.addValue.addButton');
    return <Button
        text={text}
        onPress={onPress}
        loading={loading}
    />
}

export default function AddChartValue() {
    const mutation = useStorageMutation();
    const [errors, setErrors] = useState<FormErrors>({});
    const {id: chartId} = useLocalSearchParams<{id: string}>();
    const navigation = useNavigation();
    const values = useChartValues(chartId);
    const todayValue = getChartValueForToday(values);
    const [t] = useTranslation();
    const router = useRouter();

    const [value, setValue] = useState('');

    const save = useCallback(async () => {
        const numberValue = parseLocalizedNumber(value);
        setErrors({value: numberValue === undefined ? t('validation.number') : undefined});
        if (numberValue === undefined) {
            return;
        }
        const saved = await mutation.run(() => setChartValue(chartId, numberValue));
        if (saved) {
            router.back();
        }
    }, [chartId, mutation, router, t, value]);


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
                loading={mutation.isPending}
                onPress={save}
                isUpdate={Boolean(todayValue)}
            />,
        })
    }, [mutation.isPending, navigation, save, todayValue])

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
                error={errors.value}
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
