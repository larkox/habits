import View from '@/components/base/View';
import FoodList from '@/components/FoodList';
import { StyleSheet } from 'react-native';

export default function FridgeScreen() {
    return (
        <View
            color={'background'}
            style={styles.container}
        >
            <FoodList/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 8,
    },
});
