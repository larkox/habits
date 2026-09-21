import React from 'react';
import { Platform } from 'react-native';

import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import useCurrentDay from '@/hooks/useCurrentDay';
import { useBirthdays, useFridgeFood, useTodos } from '@/store/hooks';
import { getBirthdayBadge, getFridgeBadge, getTodoBadge, ReminderBadge } from '@/utils/badges';

function badgeOptions(badge: ReminderBadge | undefined, colors: typeof Colors.light) {
    const badgeStyles = {
        neutral: { backgroundColor: colors.badgeNeutral, color: colors.badgeNeutralText },
        warning: { backgroundColor: colors.badgeWarning, color: colors.badgeWarningText },
        imminent: { backgroundColor: colors.badgeImminent, color: colors.badgeImminentText },
    };
    return {
        tabBarBadge: badge?.count,
        tabBarBadgeStyle: badge ? badgeStyles[badge.urgency] : undefined,
    };
}

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const [t] = useTranslation();
    const today = useCurrentDay();
    const todos = useTodos();
    const birthdays = useBirthdays();
    const foods = useFridgeFood();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.selectedTabTint,
                headerShown: false,
                tabBarStyle: Platform.select({
                    ios: {
                        // Use a transparent background on iOS to show the blur effect
                        position: 'absolute',
                    },
                    default: {},
                }),
            }}
        >
            <Tabs.Screen
                name="habits"
                options={{
                    tabBarIcon: ({ color }) => <IconSymbol
                        size={28}
                        name="house.fill"
                        color={color}
                    />,
                    headerShown: false,
                    title: t('tabs.habits')
                }}
            />
            <Tabs.Screen
                name="todo"
                options={{
                    ...badgeOptions(getTodoBadge(todos, today), colors),
                    tabBarIcon: ({ color }) => <IconSymbol
                        size={28}
                        name='checkmark.app.fill'
                        color={color}
                    />,
                    headerShown: false,
                    title: t('tabs.todo')
                }}
            />
            <Tabs.Screen
                name="fridge"
                options={{
                    ...badgeOptions(getFridgeBadge(foods, today), colors),
                    tabBarIcon: ({ color }) => <IconSymbol
                        size={28}
                        name='archivebox.fill'
                        color={color}
                    />,
                    headerShown: false,
                    title: t('tabs.fridge')
                }}
            />
            <Tabs.Screen
                name="birthdays"
                options={{
                    ...badgeOptions(getBirthdayBadge(birthdays, today), colors),
                    tabBarIcon: ({ color }) => <IconSymbol
                        size={28}
                        name='birthday.cake.fill'
                        color={color}
                    />,
                    headerShown: false,
                    title: t('tabs.birthdays')
                }}
            />
            <Tabs.Screen
                name="charts"
                options={{
                    tabBarIcon: ({color}) => <IconSymbol
                        size={28}
                        name="chart.line.downtrend.xyaxis"
                        color={color}
                    />,
                    headerShown: false,
                    title: t('tabs.charts')
                }}
            />
            <Tabs.Screen
                name="data"
                options={{
                    tabBarIcon: ({color}) => <IconSymbol
                        size={28}
                        name="arrow.up.arrow.down.square.fill"
                        color={color}
                    />,
                    headerShown: false,
                    title: t('tabs.data')
                }}
            />
        </Tabs>
    );
}
