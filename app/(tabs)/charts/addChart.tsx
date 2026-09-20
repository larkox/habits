import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import View from '@/components/base/View';
import useStorageMutation from "@/hooks/useStorageMutation";
import { addChart } from '@/store/storage';
import { normalizeRequiredText } from '@/utils/validation';

type FormErrors = {
    title?: string;
};

type SaveButtonProps = {
    loading: boolean;
    onPress: () => void;
}
function AddButton({
    loading,
    onPress,
}: SaveButtonProps) {
    const [t] = useTranslation();
            
    return <Button
        text={t('charts.addChart.addButton')}
        onPress={onPress}
        loading={loading}
    />
}
export default function AddChartScreen() {
    const mutation = useStorageMutation();
    const [errors, setErrors] = useState<FormErrors>({});
    const [title, setTitle] = useState('')
    const [t] = useTranslation();
    const navigation = useNavigation();
    const router = useRouter();

    const save = useCallback(async () => {
        const normalizedTitle = normalizeRequiredText(title);
        setErrors({title: normalizedTitle ? undefined : t('validation.required')});
        if (!normalizedTitle) {
            return;
        }
        const saved = await mutation.run(() => addChart(normalizedTitle));
        if (saved) {
            router.back();
        }
    }, [mutation, router, t, title]);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => <AddButton
                loading={mutation.isPending}
                onPress={save}
            />,
        })
    }, [mutation.isPending, navigation, save])

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
                error={errors.title}
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
