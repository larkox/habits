import { Stack } from 'expo-router';

import useStackTheme from '@/hooks/useStackTheme';
import { useTranslate } from "@/platform/translations";


export default function DetailsLayout() {
    const t = useTranslate();
    const screenOptions = useStackTheme();

    return (
        <Stack screenOptions={screenOptions}>
            <Stack.Screen
                name="habits/add"
                options={{title: t('habits.addHabit.title')}}
            />
            <Stack.Screen
                name="habits/edit"
                options={{title: t('habits.editHabit.title')}}
            />
            <Stack.Screen
                name="todo/add"
                options={{title: t('todo.addTodo.title')}}
            />
            <Stack.Screen
                name="todo/edit"
                options={{title: t('todo.editTodo.title')}}
            />
            <Stack.Screen
                name="fridge/add"
                options={{title: t('fridge.addFood.title')}}
            />
            <Stack.Screen
                name="fridge/edit"
                options={{title: t('fridge.editFood.title')}}
            />
            <Stack.Screen
                name="birthdays/add"
                options={{title: t('birthdays.add.title')}}
            />
            <Stack.Screen
                name="birthdays/edit"
                options={{title: t('birthdays.edit.title')}}
            />
            <Stack.Screen
                name="charts/addChart"
                options={{title: t('charts.addChart.title')}}
            />
            <Stack.Screen
                name="charts/addValue"
                options={{title: t('charts.addValue.title')}}
            />
        </Stack>
    );
}
