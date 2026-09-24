import { useCallback } from 'react';

import { Stack, useRouter } from 'expo-router';


import Button from '@/components/base/Button';
import useStackTheme from '@/hooks/useStackTheme';
import { useTranslate } from "@/platform/translations";

function AddButton() {
    const router = useRouter();
    const t = useTranslate();

    const goToAddScreen = useCallback(() => {
        router.navigate('/(details)/habits/add')
    }, [router])
    
    return (
        <Button
            text={t('habits.addButton')}
            onPress={goToAddScreen}
        />
    )
}

export default function HabitLayout() {
    const t = useTranslate();
    const screenOptions = useStackTheme();
    return (
        <Stack screenOptions={screenOptions}>
            <Stack.Screen
                name="index"
                options={{
                    title: t('habits.title'),
                    headerShown: true,
                    headerRight: AddButton,
                }}
            />
        </Stack>
    );
}
