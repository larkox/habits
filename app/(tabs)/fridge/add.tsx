import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import InputCalendar from '@/components/base/InputCalendar';
import View from '@/components/base/View';
import useStorageMutation from "@/hooks/useStorageMutation";
import { addFridgeFood } from '@/store/storage';
import { getStartOfDay } from '@/utils/time';

type SaveButtonProps = {
    mutation: ReturnType<typeof useStorageMutation>;
    expiryDate: number;
    title: string;
}

function SaveButton({
    mutation,
    expiryDate,
    title,
}: SaveButtonProps) {
    const router = useRouter();
    const [t] = useTranslation();

    const onPress = useCallback(async () => {
        const saved = await mutation.run(() => addFridgeFood(title, expiryDate));
        if (saved) {
            router.back();
        }
    }, [mutation, title, expiryDate, router]);

    return (
        <Button
            text={t('fridge.addFood.addButton')}
            onPress={onPress}
            loading={mutation.isPending}
        />
    )
}

export default function AddScreen() {
    const mutation = useStorageMutation();
    const navigation = useNavigation();
    const [name, setName] = useState('')
    const [expiryDate, setExpiryDate] = useState<number>(() => getStartOfDay());
    const [t] = useTranslation();

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                mutation={mutation}
                expiryDate={expiryDate}
                title={name}
            />
        )})
    }, [mutation, navigation, expiryDate, name])

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
