import { Stack } from 'expo-router';

import useStackTheme from '@/hooks/useStackTheme';
import { useTranslate } from "@/platform/translations";


export default function DataLayout() {
    const t = useTranslate();
    const screenOptions = useStackTheme();
    return (
        <Stack screenOptions={screenOptions}>
            <Stack.Screen
                name="index"
                options={{title: t('data.title'), headerShown: true}}
            />
        </Stack>
    );
}
