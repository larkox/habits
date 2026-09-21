import { StyleSheet } from 'react-native';

import View from '@/components/base/View';
import TodoList from '@/components/TodoList';

export default function Todo() {
    return (
        <View
            color={'background'}
            style={styles.container}
        >
            <TodoList/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 8,
    },
});
