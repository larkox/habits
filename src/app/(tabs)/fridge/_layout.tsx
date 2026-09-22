import { useCallback } from 'react';

import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';
import useStackTheme from '@/hooks/useStackTheme';

function AddButton() {
    const router = useRouter();
    const [t] = useTranslation();

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
    const [t] = useTranslation();
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
