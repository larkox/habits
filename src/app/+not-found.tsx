import { StyleSheet } from 'react-native';

import { Link, Stack } from 'expo-router';

import Text from '@/components/base/Text';
import View from '@/components/base/View';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <View style={styles.container}>
                <Text
                    context={'foreground'}
                    type="title"
                >
                    This screen does not exist.
                </Text>
                <Link
                    href="/"
                    style={styles.link}
                >
                    <Text
                        context={'foreground'}
                        type="link"
                    >
                        Go to home screen!
                    </Text>
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
});
