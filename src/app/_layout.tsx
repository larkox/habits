import { Stack } from 'expo-router';

import useStackTheme from '@/hooks/useStackTheme';
import '@/i18n/i18n';

export default function RootLayout() {
    const screenOptions = useStackTheme();

    return (
        <Stack screenOptions={screenOptions}>
            <Stack.Screen
                name="index"
                options={{
                    animation: 'none',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false }}
            />
            <Stack.Screen name="+not-found" />
        </Stack>
    );
}
