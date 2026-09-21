import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import useStackTheme from '@/hooks/useStackTheme';

export default function DataLayout() {
    const [t] = useTranslation();
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
