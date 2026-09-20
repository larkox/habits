import useStorageMutation from "@/hooks/useStorageMutation";
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
    mutation: ReturnType<typeof useStorageMutation>;
    expiryDate: number;
    name: string;
    id: string;
}

function SaveButton({
    mutation,
    expiryDate,
    name,
    id,
}: SaveButtonProps) {
    const router = useRouter();
    const [t] = useTranslation();

    const onPress = useCallback(async () => {
        const saved = await mutation.run(() => updateFoodFromFridge(id, name, expiryDate));
        if (saved) {
            router.back();
        }
    }, [mutation, expiryDate, id, name, router]);

    return (
        <Button text={t('fridge.editFood.saveButton')} onPress={onPress} loading={mutation.isPending}/>
    )
}
export default function EditScreen() {
    const mutation = useStorageMutation();
    const {id} = useLocalSearchParams<{id: string}>();
    const food = useFood(id);
    const navigation = useNavigation();
    const [name, setName] = useState(food?.name || '')
    const [expiryDate, setExpiryDate] = useState(food?.date || 0);
    const [t] = useTranslation();

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                mutation={mutation}
                expiryDate={expiryDate}
                name={name}
                id={id}
            />
        )})
    }, [mutation, id, navigation, expiryDate, name])

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
