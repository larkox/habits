import { Stack } from 'expo-router';

import '@/i18n/i18n';

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{
                animation: 'none',
                headerShown: false,
            }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
        </Stack>
    );
}
