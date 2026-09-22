import { Text } from 'react-native';

import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import BirthdayLayout from '@/app/(tabs)/birthdays/_layout';
import ChartLayout from '@/app/(tabs)/charts/_layout';
import FridgeLayout from '@/app/(tabs)/fridge/_layout';
import HabitLayout from '@/app/(tabs)/habits/_layout';
import TodoLayout from '@/app/(tabs)/todo/_layout';
import EditTodo from '@/app/(tabs)/todo/edit';
import MainScreen from '@/app/index';
import TodoElement from '@/components/TodoElement';
import useStorageMutation from '@/hooks/useStorageMutation';
import { useTodo } from '@/store/hooks';

jest.mock('react-i18next', () => ({useTranslation: () => [(key: string) => key]}));
jest.mock('@/hooks/useStorageMutation', () => jest.fn());
jest.mock('@/store/hooks', () => ({useTodo: jest.fn()}));

function Index() {
    return <Text>Index screen</Text>;
}
function Add() {
    return <Text>Add screen</Text>;
}
function Edit() {
    return <Text>Edit screen</Text>;
}

const sections = [
    ['todo', TodoLayout, 'add'],
    ['fridge', FridgeLayout, 'add'],
    ['habits', HabitLayout, 'add'],
    ['birthdays', BirthdayLayout, 'add'],
    ['charts', ChartLayout, 'addChart'],
] as const;

describe('router integration', () => {
    test('the root route redirects to habits', async () => {
        const router = renderRouter({
            index: MainScreen,
            '(tabs)/habits/index': Index,
        });
        await router;

        expect(router.getPathname()).toBe('/habits');
        expect(screen.getByText('Index screen')).toBeTruthy();
    });

    test.each(sections)('%s header action navigates to its add route', async (section, Layout, addRoute) => {
        const router = renderRouter({
            [`(tabs)/${section}/_layout`]: Layout,
            [`(tabs)/${section}/index`]: Index,
            [`(tabs)/${section}/${addRoute}`]: Add,
            [`(tabs)/${section}/${section === 'charts' ? 'addValue' : 'edit'}`]: Edit,
        }, {initialUrl: `/${section}`});
        await router;

        expect(router.getPathname()).toBe(`/${section}`);
        await act(async () => {
            fireEvent.press(screen.getByRole('button', {name: `${section}.addButton`}));
        });
        expect(router.getPathname()).toBe(`/${section}/${addRoute}`);
        expect(screen.getByText('Add screen')).toBeTruthy();
    });

    test('a direct edit URL supplies its ID to the real screen', async () => {
        jest.mocked(useTodo).mockReturnValue({id: 'todo-123', name: 'Call', date: Date.now() + 86400000});
        jest.mocked(useStorageMutation).mockReturnValue({run: jest.fn(), isPending: false});
        const router = renderRouter({
            '(tabs)/todo/_layout': TodoLayout,
            '(tabs)/todo/index': Index,
            '(tabs)/todo/add': Add,
            '(tabs)/todo/edit': EditTodo,
        }, {initialUrl: '/todo/edit?id=todo-123'});
        await router;

        expect(router.getPathnameWithParams()).toBe('/todo/edit?id=todo-123');
        expect(useTodo).toHaveBeenCalledWith('todo-123');
        expect(screen.getByDisplayValue('Call')).toBeTruthy();
    });

    test('todo long press opens the edit route with the correct ID', async () => {
        jest.mocked(useTodo).mockReturnValue({id: 'todo-123', name: 'Call', date: Date.now() + 86400000});
        jest.mocked(useStorageMutation).mockReturnValue({run: jest.fn(), isPending: false});
        const router = renderRouter({
            '(tabs)/todo/_layout': TodoLayout,
            '(tabs)/todo/index': () => <TodoElement id="todo-123"/>,
            '(tabs)/todo/add': Add,
            '(tabs)/todo/edit': Edit,
        }, {initialUrl: '/todo'});
        await router;

        await act(async () => {
            fireEvent(screen.getByTestId('todo-card'), 'longPress');
        });
        expect(router.getPathnameWithParams()).toBe('/todo/edit?id=todo-123');
        expect(screen.getByText('Edit screen')).toBeTruthy();
    });
});
