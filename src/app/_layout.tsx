import { Stack } from 'expo-router';

import useStackTheme from '@/hooks/useStackTheme';
import useSystemLanguage from '@/i18n/useSystemLanguage';

export default function RootLayout() {
    const screenOptions = useStackTheme();
    useSystemLanguage();

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
            <Stack.Screen
                name="(details)"
                options={{headerShown: false}}
            />
            <Stack.Screen name="+not-found" />
        </Stack>
    );
}
