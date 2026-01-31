import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native';

import { useFridgeFood } from '@/store/hooks';
import { useCallback, useMemo } from 'react';
import Food from './Food';

function keyExtractor(item: string) {
    return item;
}

export default function HabitList() {
    const food = useFridgeFood();

    const renderItem = useCallback((info: ListRenderItemInfo<string>) => {
        return (<Food id={info.item}/>)
    }, [])

    const data = useMemo(() => {
        if (!food) {
            return [];
        }

        const sortedArray = [...food];
        sortedArray.sort((a, b) => {
            return (a.date - b.date)
        });

        return sortedArray.map((v) => v.id);
    }, [food]);

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
