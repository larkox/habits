import { useCallback } from 'react';

import { Stack, useRouter } from 'expo-router';


import Button from '@/components/base/Button';
import useStackTheme from '@/hooks/useStackTheme';
import { useTranslate } from "@/platform/translations";

function AddButton() {
    const router = useRouter();
    const t = useTranslate();

    const goToAddScreen = useCallback(() => {
        router.navigate('/(details)/todo/add')
    }, [router])
    
    return (
        <Button
            text={t('todo.addButton')}
            onPress={goToAddScreen}
        />
    )
}

export default function TodoLayout() {
    const t = useTranslate();
    const screenOptions = useStackTheme();
    return (
        <Stack screenOptions={screenOptions}>
            <Stack.Screen
                name="index"
                options={{
                    title: t('todo.title'),
                    headerShown: true,
                    headerRight: AddButton,
                }}
            />
        </Stack>
    );
}
