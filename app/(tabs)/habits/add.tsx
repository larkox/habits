import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import View from '@/components/base/View';
import useStorageMutation from "@/hooks/useStorageMutation";
import { addHabit } from '@/store/storage';

type SaveButtonProps = {
    mutation: ReturnType<typeof useStorageMutation>;
    periodicity: string;
    title: string;
}

function SaveButton({
    mutation,
    periodicity,
    title,
}: SaveButtonProps) {
    const router = useRouter();
    const [t] = useTranslation();

    const onPress = useCallback(async () => {
        const numberValue = parseInt(periodicity, 10);
        if (isNaN(numberValue)) {
            return;
        }
        const saved = await mutation.run(() => addHabit(title, numberValue));
        if (saved) {
            router.back();
        }
    }, [mutation, title, periodicity, router]);

    return (
        <Button
            text={t('habits.addHabit.addButton')}
            onPress={onPress}
            loading={mutation.isPending}
        />
    )
}
export default function AddScreen() {
    const mutation = useStorageMutation();
    const navigation = useNavigation();
    const [title, setTitle] = useState('')
    const [periodicity, setPeriodicity] = useState('');
    const [t] = useTranslation();

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                mutation={mutation}
                periodicity={periodicity}
                title={title}
            />
        )})
    }, [mutation, navigation, periodicity, title])

    return (
        <View
            style={styles.container}
        >
            <Input
                label={t('habits.addHabit.inputLabels.title')}
                onChange={setTitle}
                value={title}
                type='text'
            />
            <Input
                label={t('habits.addHabit.inputLabels.periodicity')}
                onChange={setPeriodicity}
                value={periodicity}
                type={'numeric'}
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
