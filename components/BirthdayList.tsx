import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native';

import { useBirthdays } from '@/store/hooks';
import { Birthday } from '@/types/model';
import { getNextMonthAndDay } from '@/utils/time';
import { useCallback, useMemo } from 'react';
import BirthdayElement from './BirthdayElement';

function keyExtractor(item: string) {
    return item;
}

type BirthdaysWithNextDate = Birthday & {
    nextDate: number;
}

export default function BirthdayList() {
    const birthdays = useBirthdays();

    const renderItem = useCallback((info: ListRenderItemInfo<string>) => {
        return (<BirthdayElement id={info.item}/>)
    }, [])

    const enhancedBirthdays = useMemo<BirthdaysWithNextDate[] | undefined>(() => {
        return birthdays?.map((v) => ({
            ...v,
            nextDate: getNextMonthAndDay(v.date),
        }))
    }, [birthdays])

    const data = useMemo(() => {
        if (!enhancedBirthdays) {
            return [];
        }

        const sortedArray = [...enhancedBirthdays];
        sortedArray.sort((a, b) => {
            return (a.nextDate - b.nextDate)
        });

        return sortedArray.map((v) => v.id);
    }, [enhancedBirthdays]);

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
