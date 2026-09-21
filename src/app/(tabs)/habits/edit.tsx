import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import Loader from '@/components/base/Loader';
import View from '@/components/base/View';
import HabitCalendar from '@/components/HabitCalendar';
import useSmartLoading from '@/hooks/useSmartLoading';
import useStorageMutation from "@/hooks/useStorageMutation";
import { useHabit } from '@/store/hooks';
import { removeHabit, updateHabit } from '@/store/storage';
import type { Habit } from '@/types/model';
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
    const [t] = useTranslation();

    return (
        <Button
            text={t('habits.editHabit.saveButton')}
            onPress={onPress}
            loading={loading}
        />
    )
}
export default function EditScreen() {
    const {id} = useLocalSearchParams<{id: string}>();
    const habit = useHabit(id);
    const loading = useSmartLoading(habit === undefined);

    if (loading.isLoading || !habit) {
        return loading.showLoader ? <Loader /> : null;
    }

    return <HabitForm
        key={habit.id}
        habit={habit}
    />;
}

function HabitForm({habit}: {habit: Habit}) {
    const mutation = useStorageMutation();
    const router = useRouter();
    const id = habit.id;
    const navigation = useNavigation();
    const [title, setTitle] = useState(habit.title)
    const [periodicity, setPeriodicity] = useState(habit.periodicity.toString());
    const [errors, setErrors] = useState<FormErrors>({});
    const [t] = useTranslation();

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
        const saved = await mutation.run(() => updateHabit(id, normalizedTitle, numberValue));
        if (saved) {
            router.back();
        }
    }, [id, mutation, periodicity, router, t, title]);

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                loading={mutation.isPending}
                onPress={save}
            />
        )})
    }, [mutation.isPending, navigation, save])

    const deleteCallback = useCallback(async () => {
        const removed = await mutation.run(() => removeHabit(id));
        if (removed) {
            router.back();
        }
    }, [mutation, router, id])
    return (
        <View
            style={styles.container}
        >
            <Input
                label={t('habits.editHabit.inputLabels.title')}
                onChange={setTitle}
                value={title}
                type='text'
                error={errors.title}
            />
            <Input
                label={t('habits.editHabit.inputLabels.periodicity')}
                onChange={setPeriodicity}
                value={periodicity}
                type={'numeric'}
                error={errors.periodicity}
            />
            <HabitCalendar id={id}/>
            <View style={styles.deletecontainer}>
                <Button
                    text={t('habits.deleteButton')}
                    onPress={deleteCallback}
                    loading={mutation.isPending}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 8,
    },
    deletecontainer: {
        marginTop: 'auto',
    }
});
