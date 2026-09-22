import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
    children: ReactNode;
};

export default function FormScreen({children}: Props) {
    const {bottom} = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState(() => {
        return Platform.OS === 'android' ? Keyboard.metrics()?.height ?? 0 : 0;
    });

    useEffect(() => {
        if (Platform.OS !== 'android') {
            return;
        }

        const show = Keyboard.addListener('keyboardDidShow', event => {
            setKeyboardHeight(event.endCoordinates.height);
        });
        const hide = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });

        return () => {
            show.remove();
            hide.remove();
        };
    }, []);

    const bottomPadding = bottom + keyboardHeight + 8;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
            testID="form-keyboard-avoider"
        >
            <ScrollView
                contentContainerStyle={[styles.content, {paddingBottom: bottomPadding}]}
                keyboardShouldPersistTaps="always"
                style={styles.container}
                testID="form-scroll"
            >
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        gap: 8,
        padding: 8,
    },
});
