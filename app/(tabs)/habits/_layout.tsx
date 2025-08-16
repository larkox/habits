import { Stack, useRouter } from 'expo-router';

import Button from '@/components/base/Button';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

function AddButton() {
    const router = useRouter();
    const [t] = useTranslation();

    const goToAddScreen = useCallback(() => {
        router.navigate('/(tabs)/habits/add')
    }, [router])
    
    return (
        <Button
            text={t('habits.addButton')}
            onPress={goToAddScreen}
        />
    )
}

export default function HabitLayout() {
    const [t] = useTranslation();
    return (
        <Stack>
            <Stack.Screen name="index" options={{
                title: t('habits.title'),
                headerShown: true,
                headerRight: AddButton,
            }} />
            <Stack.Screen name="add"
                options={{
                    title: t('habits.addHabit.title'),
                    headerShown: true,
                }}
            />
            <Stack.Screen name="edit"
                options={{
                    title: t('habits.editHabit.title'),
                    headerShown: true,
                }}
            />
        </Stack>
    );
}
