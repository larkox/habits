import { useCallback } from 'react';

import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';
import useStackTheme from '@/hooks/useStackTheme';

function AddButton() {
    const router = useRouter();
    const [t] = useTranslation();

    const goToAddScreen = useCallback(() => {
        router.navigate('/(tabs)/birthdays/add')
    }, [router])
    
    return (
        <Button
            text={t('birthdays.addButton')}
            onPress={goToAddScreen}
        />
    )
}

export default function BirthdaysLayout() {
    const [t] = useTranslation();
    const screenOptions = useStackTheme();
    return (
        <Stack screenOptions={screenOptions}>
            <Stack.Screen
                name="index"
                options={{
                    title: t('birthdays.title'),
                    headerShown: true,
                    headerRight: AddButton,
                }}
            />
            <Stack.Screen
                name="add"
                options={{
                    title: t('birthdays.add.title'),
                    headerShown: true,
                }}
            />
            <Stack.Screen
                name="edit"
                options={{
                    title: t('birthdays.edit.title'),
                    headerShown: true,
                }}
            />
        </Stack>
    );
}
