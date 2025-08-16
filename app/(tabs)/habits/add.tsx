import { StyleSheet } from 'react-native';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import View from '@/components/base/View';
import { addHabit } from '@/store/storage';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type SaveButtonProps = {
    periodicity: string;
    title: string;
}

function SaveButton({
    periodicity,
    title,
}: SaveButtonProps) {
    const router = useRouter();
    const [t] = useTranslation();

    const onPress = useCallback(() => {
        const numberValue = parseInt(periodicity);
        if (isNaN(numberValue)) {
            return;
        }
        addHabit(title, numberValue);
        router.back();
    }, [title, periodicity, router]);

    return (
        <Button text={t('habits.addHabit.addButton')} onPress={onPress}/>
    )
}
export default function AddScreen() {
    const navigation = useNavigation();
    const [title, setTitle] = useState('')
    const [periodicity, setPeriodicity] = useState('');
    const [t] = useTranslation();

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                periodicity={periodicity}
                title={title}
            />
        )})
    }, [navigation, periodicity, title])

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
