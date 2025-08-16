import { StyleSheet } from 'react-native';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import View from '@/components/base/View';
import { useHabit } from '@/store/hooks';
import { removeHabit, updateHabit } from '@/store/storage';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import HabitCalendar from '@/components/HabitCalendar';

type SaveButtonProps = {
    periodicity: string;
    title: string;
    id: string;
}

function SaveButton({
    periodicity,
    title,
    id,
}: SaveButtonProps) {
    const router = useRouter();
    const [t] = useTranslation();

    const onPress = useCallback(() => {
        const numberValue = parseInt(periodicity);
        if (isNaN(numberValue)) {
            return;
        }
        updateHabit(id, title, numberValue);
        router.back();
    }, [periodicity, id, title, router]);

    return (
        <Button text={t('habits.editHabit.saveButton')} onPress={onPress}/>
    )
}
export default function EditScreen() {
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
                periodicity={periodicity}
                title={title}
                id={id}
            />
        )})
    }, [id, navigation, periodicity, title])

    useEffect(() => {
        setTitle(habit?.title || '');
        setPeriodicity(habit?.periodicity.toString() || '');
    }, [habit]);

    const deleteCallback = useCallback(() => {
        removeHabit(id);
        router.back();
    }, [router, id])
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
