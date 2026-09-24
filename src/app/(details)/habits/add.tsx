import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useNavigation, useRouter } from 'expo-router';


import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import View from '@/components/base/View';
import useStorageMutation from "@/hooks/useStorageMutation";
import { useTranslate } from "@/platform/translations";
import { addHabit } from '@/store/storage';
import { normalizeRequiredText, parsePositiveInteger } from '@/utils/validation';

type FormErrors = {
    title?: string;
    periodicity?: string;
};

type SaveButtonProps = {
    loading: boolean;
    onPress: () => void;
}

function SaveButton({
    loading,
    onPress,
}: SaveButtonProps) {
    const t = useTranslate();

    return (
        <Button
            text={t('habits.addHabit.addButton')}
            onPress={onPress}
            loading={loading}
        />
    )
}
export default function AddScreen() {
    const mutation = useStorageMutation();
    const navigation = useNavigation();
    const [title, setTitle] = useState('')
    const [periodicity, setPeriodicity] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const t = useTranslate();
    const router = useRouter();

    const save = useCallback(async () => {
        const normalizedTitle = normalizeRequiredText(title);
        const numberValue = parsePositiveInteger(periodicity);
        const nextErrors: FormErrors = {
            title: normalizedTitle ? undefined : t('validation.required'),
            periodicity: numberValue === undefined ? t('validation.positiveInteger') : undefined,
        };
        setErrors(nextErrors);
        if (!normalizedTitle || numberValue === undefined) {
            return;
        }
        const saved = await mutation.run(() => addHabit(normalizedTitle, numberValue));
        if (saved) {
            router.back();
        }
    }, [mutation, periodicity, router, t, title]);

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                loading={mutation.isPending}
                onPress={save}
            />
        )})
    }, [mutation.isPending, navigation, save])

    return (
        <View
            style={styles.container}
        >
            <Input
                label={t('habits.addHabit.inputLabels.title')}
                onChange={setTitle}
                value={title}
                type='text'
                error={errors.title}
            />
            <Input
                label={t('habits.addHabit.inputLabels.periodicity')}
                onChange={setPeriodicity}
                value={periodicity}
                type={'numeric'}
                error={errors.periodicity}
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
