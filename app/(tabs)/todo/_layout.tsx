import { Stack, useRouter } from 'expo-router';

import Button from '@/components/base/Button';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

function AddButton() {
    const router = useRouter();
    const [t] = useTranslation();

    const goToAddScreen = useCallback(() => {
        router.navigate('/(tabs)/todo/add')
    }, [router])
    
    return (
        <Button
            text={t('todo.addButton')}
            onPress={goToAddScreen}
        />
    )
}

export default function TodoLayout() {
    const [t] = useTranslation();
    return (
        <Stack>
            <Stack.Screen name="index" options={{
                title: t('todo.title'),
                headerShown: true,
                headerRight: AddButton,
            }} />
            <Stack.Screen name="add" options={{
                title: t('todo.addTodo.title'),
                headerShown: true,
            }} />
            <Stack.Screen name="edit" options={{
                title: t('todo.editTodo.title'),
                headerShown: true,
            }} />
        </Stack>
    );
}
