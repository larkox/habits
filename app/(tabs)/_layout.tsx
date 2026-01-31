import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const [t] = useTranslation();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].selectedTabTint,
                headerShown: false,
                tabBarStyle: Platform.select({
                    ios: {
                        // Use a transparent background on iOS to show the blur effect
                        position: 'absolute',
                    },
                    default: {},
                }),
            }}>
            <Tabs.Screen
                name="habits"
                options={{
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                    headerShown: false,
                    title: t('tabs.habits')
                }}
            />
            <Tabs.Screen
                name="todo"
                options={{
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name='checkmark.app.fill' color={color} />,
                    headerShown: false,
                    title: t('tabs.todo')
                }}
            />
            <Tabs.Screen
                name="fridge"
                options={{
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name='archivebox.fill' color={color} />,
                    headerShown: false,
                    title: t('tabs.fridge')
                }}
            />
            <Tabs.Screen
                name="charts"
                options={{
                    tabBarIcon: ({color}) => <IconSymbol size={28} name="chart.line.downtrend.xyaxis" color={color} />,
                    headerShown: false,
                    title: t('tabs.charts')
                }}
            />
        </Tabs>
    );
}
