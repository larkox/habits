import { Stack, useRouter } from 'expo-router';

import Button from '@/components/base/Button';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

function AddChartHeaderButton() {
    const router = useRouter();
    const [t] = useTranslation();
        
    const goToAddScreen = useCallback(() => {
        router.navigate('/(tabs)/charts/addChart')
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
    return (
        <Stack>
            <Stack.Screen name="index" options={{
                title: t('charts.title'),
                headerShown: true,
                headerRight: AddChartHeaderButton,
            }} />
            <Stack.Screen name="addChart" options={{
                title: t('charts.addChart.title'),
                headerShown: true,
            }} />
            <Stack.Screen name="addValue" options={{
                title: t('charts.addValue.title'),
                headerShown: true,
            }} />
        </Stack>
    );
}
