import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

import useSmartLoading from '@/hooks/useSmartLoading';

import Text from "./Text";
import View from "./View";

type ButtonProps = {
    text: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
}

const styles = StyleSheet.create({
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});

export default function Button({
    text,
    onPress,
    disabled = false,
    loading = false,
}: ButtonProps) {
    const smartLoading = useSmartLoading(loading);
    const isDisabled = disabled || smartLoading.isLoading;
    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityState={{disabled: isDisabled, busy: smartLoading.isLoading}}
        >
            <View
                color={isDisabled ? 'disabledButton' : 'button'}
                border={'button'}
                style={styles.content}
            >
                {smartLoading.showLoader && <ActivityIndicator size="small" />}
                <Text context={isDisabled ? 'disabledButton' : 'button'}>{text}</Text>
            </View>
        </Pressable>
    )
}
