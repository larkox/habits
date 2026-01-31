import { StyleSheet } from 'react-native';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import View from '@/components/base/View';
import { useFood } from '@/store/hooks';
import { updateFoodFromFridge } from '@/store/storage';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputCalendar from '@/components/base/InputCalendar';

type SaveButtonProps = {
    expiryDate: number;
    name: string;
    id: string;
}

function SaveButton({
    expiryDate,
    name,
    id,
}: SaveButtonProps) {
    const router = useRouter();
    const [t] = useTranslation();

    const onPress = useCallback(() => {
        updateFoodFromFridge(id, name, expiryDate);
        router.back();
    }, [expiryDate, id, name, router]);

    return (
        <Button text={t('fridge.editFood.saveButton')} onPress={onPress}/>
    )
}
export default function EditScreen() {
    const {id} = useLocalSearchParams<{id: string}>();
    const food = useFood(id);
    const navigation = useNavigation();
    const [name, setName] = useState(food?.name || '')
    const [expiryDate, setExpiryDate] = useState(food?.date || 0);
    const [t] = useTranslation();

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                expiryDate={expiryDate}
                name={name}
                id={id}
            />
        )})
    }, [id, navigation, expiryDate, name])

    useEffect(() => {
        setName(food?.name || '');
        setExpiryDate(food?.date || 0);
    }, [food]);

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
    deletecontainer: {
        marginTop: 'auto',
    }
});
