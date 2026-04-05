import View from '@/components/base/View';
import BirthdayList from '@/components/BirthdayList';
import { StyleSheet } from 'react-native';

export default function Birthdays() {
    return (
        <View
            color={'background'}
            style={styles.container}
        >
            <BirthdayList/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 8,
    },
});
