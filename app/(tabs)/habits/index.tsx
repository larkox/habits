import View from '@/components/base/View';
import HabitList from '@/components/HabitList';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {
    return (
        <View
            color={'background'}
            style={styles.container}
        >
            <HabitList/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 8,
    },
});
