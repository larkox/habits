import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native';

import { useChartIds } from '@/store/hooks';
import { useCallback } from 'react';
import Chart from './Chart';

function keyExtractor(item: string) {
    return item;
}

export default function ChartList() {
    const chartIds = useChartIds();

    const renderItem = useCallback((info: ListRenderItemInfo<string>) => {
        return (<Chart id={info.item}/>)
    }, [])

    return (
        <FlatList
            data={chartIds}
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
