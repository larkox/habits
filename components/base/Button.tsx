import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
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
    const isDisabled = disabled || loading;
    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityState={{disabled: isDisabled, busy: loading}}
        >
            <View
                color={isDisabled ? 'disabledButton' : 'button'}
                border={'button'}
                style={styles.content}
            >
                {loading && <ActivityIndicator size="small" />}
                <Text context={isDisabled ? 'disabledButton' : 'button'}>{text}</Text>
            </View>
        </Pressable>
    )
}

