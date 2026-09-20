import { useCallback, useMemo } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native';

import { useTodos } from '@/store/hooks';

import TodoElement from './TodoElement';

function keyExtractor(item: string) {
    return item;
}

export default function TodoList() {
    const todos = useTodos();

    const renderItem = useCallback((info: ListRenderItemInfo<string>) => {
        return (<TodoElement id={info.item}/>)
    }, [])

    const data = useMemo(() => {
        if (!todos) {
            return [];
        }

        const sortedArray = [...todos];
        sortedArray.sort((a, b) => {
            return (a.date - b.date)
        });

        return sortedArray.map((v) => v.id);
    }, [todos]);

    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            contentContainerStyle={styles.contentContainer}
            keyExtractor={keyExtractor}
        />
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        gap: 8,
    }
});
