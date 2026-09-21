import { ActivityIndicator, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

import View from './View';

export default function Loader() {
    const color = useThemeColor('button');

    return (
        <View style={styles.container}>
            <ActivityIndicator
                color={color}
                size="large"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
});
