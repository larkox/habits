import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native';

import Habit from '@/components/Habit';
import { useHabitList } from '@/store/hooks';
import { getDue, isDone } from '@/utils/time';
import { useCallback, useMemo } from 'react';

function keyExtractor(item: string) {
    return item;
}

export default function HabitList() {
    const habitList = useHabitList();

    const renderItem = useCallback((info: ListRenderItemInfo<string>) => {
        return (<Habit id={info.item}/>)
    }, [])

    const data = useMemo(() => {
        if (!habitList) {
            return [];
        }

        const sortedArray = [...habitList];
        sortedArray.sort((a, b) => {
            const isDoneA = isDone(a.lastDone);
            const isDoneB = isDone(b.lastDone);

            if (isDoneA && !isDoneB) {
                return 1;
            }

            if (!isDoneA && isDoneB) {
                return -1;
            }

            const dueA = getDue(a.lastDone, a.periodicity);
            const dueB = getDue(b.lastDone, b.periodicity);
            return (dueA - dueB)
        });

        return sortedArray.map((v) => v.id);
    }, [habitList]);

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
