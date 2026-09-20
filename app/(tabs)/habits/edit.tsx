import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import View from '@/components/base/View';
import HabitCalendar from '@/components/HabitCalendar';
import useStorageMutation from "@/hooks/useStorageMutation";
import { useHabit } from '@/store/hooks';
import { removeHabit, updateHabit } from '@/store/storage';

type SaveButtonProps = {
    mutation: ReturnType<typeof useStorageMutation>;
    periodicity: string;
    title: string;
    id: string;
}

function SaveButton({
    mutation,
    periodicity,
    title,
    id,
}: SaveButtonProps) {
    const router = useRouter();
    const [t] = useTranslation();

    const onPress = useCallback(async () => {
        const numberValue = parseInt(periodicity, 10);
        if (isNaN(numberValue)) {
            return;
        }
        const saved = await mutation.run(() => updateHabit(id, title, numberValue));
        if (saved) {
            router.back();
        }
    }, [mutation, periodicity, id, title, router]);

    return (
        <Button
            text={t('habits.editHabit.saveButton')}
            onPress={onPress}
            loading={mutation.isPending}
        />
    )
}
export default function EditScreen() {
    const mutation = useStorageMutation();
    const router = useRouter();
    const {id} = useLocalSearchParams<{id: string}>();
    const habit = useHabit(id);
    const navigation = useNavigation();
    const [title, setTitle] = useState(habit?.title || '')
    const [periodicity, setPeriodicity] = useState(habit?.periodicity.toString() || '');
    const [t] = useTranslation();

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                mutation={mutation}
                periodicity={periodicity}
                title={title}
                id={id}
            />
        )})
    }, [mutation, id, navigation, periodicity, title])

    useEffect(() => {
        setTitle(habit?.title || '');
        setPeriodicity(habit?.periodicity.toString() || '');
    }, [habit]);

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
            />
            <Input
                label={t('habits.editHabit.inputLabels.periodicity')}
                onChange={setPeriodicity}
                value={periodicity}
                type={'numeric'}
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
