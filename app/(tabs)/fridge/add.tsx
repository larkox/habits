import { StyleSheet } from 'react-native';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import InputCalendar from '@/components/base/InputCalendar';
import View from '@/components/base/View';
import { addFridgeFood } from '@/store/storage';
import { getStartOfDay } from '@/utils/time';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type SaveButtonProps = {
    expiryDate: number;
    title: string;
}

function SaveButton({
    expiryDate,
    title,
}: SaveButtonProps) {
    const router = useRouter();
    const [t] = useTranslation();

    const onPress = useCallback(() => {
        addFridgeFood(title, expiryDate);
        router.back();
    }, [title, expiryDate, router]);

    return (
        <Button text={t('fridge.addFood.addButton')} onPress={onPress}/>
    )
}

export default function AddScreen() {
    const navigation = useNavigation();
    const [name, setName] = useState('')
    const [expiryDate, setExpiryDate] = useState<number>(() => getStartOfDay());
    const [t] = useTranslation();

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                expiryDate={expiryDate}
                title={name}
            />
        )})
    }, [navigation, expiryDate, name])

    return (
        <View
            style={styles.container}
        >
            <Input
                label={t('fridge.addFood.inputLabels.name')}
                onChange={setName}
                value={name}
                type='text'
            />
            <InputCalendar
                label={t('fridge.addFood.inputLabels.expiryDate')}
                setValue={setExpiryDate}
                value={expiryDate}
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
