import { useCallback } from 'react';

import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';

function AddButton() {
    const router = useRouter();
    const [t] = useTranslation();

    const goToAddScreen = useCallback(() => {
        router.navigate('/(tabs)/fridge/add')
    }, [router])
    
    return (
        <Button
            text={t('fridge.addButton')}
            onPress={goToAddScreen}
        />
    )
}

export default function FridgeLayout() {
    const [t] = useTranslation();
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: t('fridge.title'),
                    headerShown: true,
                    headerRight: AddButton,
                }}
            />
            <Stack.Screen
                name="add"
                options={{
                    title: t('fridge.addFood.title'),
                    headerShown: true,
                }}
            />
            <Stack.Screen
                name="edit"
                options={{
                    title: t('fridge.editFood.title'),
                    headerShown: true,
                }}
            />
        </Stack>
    );
}
