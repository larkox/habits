import type { ComponentType } from 'react';
import { Text } from 'react-native';

import { router as expoRouter } from 'expo-router';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import DetailsLayout from '@/app/(details)/_layout';
import EditTodo from '@/app/(details)/todo/edit';
import TabLayout from '@/app/(tabs)/_layout';
import BirthdayLayout from '@/app/(tabs)/birthdays/_layout';
import ChartLayout from '@/app/(tabs)/charts/_layout';
import FridgeLayout from '@/app/(tabs)/fridge/_layout';
import HabitLayout from '@/app/(tabs)/habits/_layout';
import TodoLayout from '@/app/(tabs)/todo/_layout';
import RootLayout from '@/app/_layout';
import MainScreen from '@/app/index';
import TodoElement from '@/components/TodoElement';
import useStorageMutation from '@/hooks/useStorageMutation';
import { useTodo } from '@/store/hooks';

jest.mock('@/i18n/useSystemLanguage', () => jest.fn());
jest.mock('@/platform/translations', () => ({
    useTranslate: () => (key: string) => key,
    useTranslationLanguage: () => 'en',
}));
jest.mock('@/hooks/useStorageMutation', () => jest.fn());
jest.mock('@/store/hooks', () => ({
    useTodo: jest.fn(),
    useTodos: () => [],
    useBirthdays: () => [],
    useFridgeFood: () => [],
}));

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

function routes(section?: string, sectionLayout?: ComponentType) {
    return {
        _layout: RootLayout,
        index: MainScreen,
        '+not-found': Index,
        '(tabs)/_layout': TabLayout,
        '(tabs)/habits/index': Index,
        '(tabs)/todo/index': Index,
        '(tabs)/fridge/index': Index,
        '(tabs)/birthdays/index': Index,
        '(tabs)/charts/index': Index,
        '(tabs)/data/index': Index,
        ...(section && sectionLayout ? {[`(tabs)/${section}/_layout`]: sectionLayout} : {}),
        '(details)/_layout': DetailsLayout,
        '(details)/habits/add': Add,
        '(details)/habits/edit': Edit,
        '(details)/todo/add': Add,
        '(details)/todo/edit': Edit,
        '(details)/fridge/add': Add,
        '(details)/fridge/edit': Edit,
        '(details)/birthdays/add': Add,
        '(details)/birthdays/edit': Edit,
        '(details)/charts/addChart': Add,
        '(details)/charts/addValue': Add,
    };
}

describe('router integration', () => {
    test('the root route redirects to habits', async () => {
        const router = renderRouter(routes());
        await router;

        expect(router.getPathname()).toBe('/habits');
        expect(screen.getByText('Index screen')).toBeTruthy();
    });

    test.each(sections)('%s header opens add above the tabs', async (section, Layout, addRoute) => {
        const router = renderRouter(routes(section, Layout), {initialUrl: `/${section}`});
        await router;

        expect(router.getPathname()).toBe(`/${section}`);
        expect(screen.getAllByRole('button', {name: /tab, \d of 6/}).length).toBe(6);
        await act(async () => {
            fireEvent.press(screen.getByRole('button', {name: `${section}.addButton`}));
        });
        expect(router.getPathname()).toBe(`/${section}/${addRoute}`);
        expect(screen.getByText('Add screen')).toBeTruthy();
        expect(screen.queryAllByRole('button', {name: /tab, \d of 6/})).toHaveLength(0);
        await act(async () => { expoRouter.back(); });
        expect(router.getPathname()).toBe(`/${section}`);
        expect(screen.getAllByRole('button', {name: /tab, \d of 6/})).toHaveLength(6);
    });

    test.each([
        ['habits/edit', 'Edit screen'],
        ['todo/edit', 'Edit screen'],
        ['fridge/edit', 'Edit screen'],
        ['birthdays/edit', 'Edit screen'],
        ['charts/addValue', 'Add screen'],
    ])('direct detail route %s has no tab bar', async (path, text) => {
        const router = renderRouter(routes(), {initialUrl: `/${path}?id=item-1`});
        await router;

        expect(router.getPathnameWithParams()).toBe(`/${path}?id=item-1`);
        expect(screen.getByText(text)).toBeTruthy();
        expect(screen.queryAllByRole('button', {name: /tab, \d of 6/})).toHaveLength(0);
    });

    test('a direct edit URL supplies its ID to the real screen', async () => {
        jest.mocked(useTodo).mockReturnValue({id: 'todo-123', name: 'Call', date: Date.now() + 86400000});
        jest.mocked(useStorageMutation).mockReturnValue({run: jest.fn(), isPending: false});
        const router = renderRouter({...routes(), '(details)/todo/edit': EditTodo}, {initialUrl: '/todo/edit?id=todo-123'});
        await router;

        expect(router.getPathnameWithParams()).toBe('/todo/edit?id=todo-123');
        expect(useTodo).toHaveBeenCalledWith('todo-123');
        expect(screen.getByDisplayValue('Call')).toBeTruthy();
        expect(screen.queryAllByRole('button', {name: /tab, \d of 6/})).toHaveLength(0);
    });

    test('todo long press opens edit above the tabs with the correct ID', async () => {
        jest.mocked(useTodo).mockReturnValue({id: 'todo-123', name: 'Call', date: Date.now() + 86400000});
        jest.mocked(useStorageMutation).mockReturnValue({run: jest.fn(), isPending: false});
        const router = renderRouter({
            ...routes('todo', TodoLayout),
            '(tabs)/todo/index': () => <TodoElement id="todo-123"/>,
        }, {initialUrl: '/todo'});
        await router;

        await act(async () => {
            fireEvent(screen.getByTestId('todo-card'), 'longPress');
        });
        expect(router.getPathnameWithParams()).toBe('/todo/edit?id=todo-123');
        expect(screen.getByText('Edit screen')).toBeTruthy();
        expect(screen.queryAllByRole('button', {name: /tab, \d of 6/})).toHaveLength(0);
    });
});
