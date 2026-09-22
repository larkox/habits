import { useCallback } from 'react';

import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';
import useStackTheme from '@/hooks/useStackTheme';

function AddChartHeaderButton() {
    const router = useRouter();
    const [t] = useTranslation();
        
    const goToAddScreen = useCallback(() => {
        router.navigate('/(details)/charts/addChart')
    }, [router])

    return (
        <Button
            text={t('charts.addButton')}
            onPress={goToAddScreen}
        />
    )
}
export default function HabitLayout() {
    const [t] = useTranslation();
    const screenOptions = useStackTheme();
    return (
        <Stack screenOptions={screenOptions}>
            <Stack.Screen
                name="index"
                options={{
                    title: t('charts.title'),
                    headerShown: true,
                    headerRight: AddChartHeaderButton,
                }}
            />
        </Stack>
    );
}
