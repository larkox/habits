import View from '@/components/base/View';
import ChartList from '@/components/ChartList';
import { StyleSheet } from 'react-native';

export default function ChartListScreen() {
    return (
        <View
            color={'background'}
            style={styles.container}
        >
            <ChartList/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 8,
    },
});
