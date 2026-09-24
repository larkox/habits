import { useCallback } from 'react';

import { Stack, useRouter } from 'expo-router';


import Button from '@/components/base/Button';
import useStackTheme from '@/hooks/useStackTheme';
import { useTranslate } from "@/platform/translations";

function AddButton() {
    const router = useRouter();
    const t = useTranslate();

    const goToAddScreen = useCallback(() => {
        router.navigate('/(details)/fridge/add')
    }, [router])
    
    return (
        <Button
            text={t('fridge.addButton')}
            onPress={goToAddScreen}
        />
    )
}

export default function FridgeLayout() {
    const t = useTranslate();
    const screenOptions = useStackTheme();
    return (
        <Stack screenOptions={screenOptions}>
            <Stack.Screen
                name="index"
                options={{
                    title: t('fridge.title'),
                    headerShown: true,
                    headerRight: AddButton,
                }}
            />
        </Stack>
    );
}
