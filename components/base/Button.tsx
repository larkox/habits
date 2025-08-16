import { Pressable } from "react-native";
import Text from "./Text";
import View from "./View";

type ButtonProps = {
    text: string;
    onPress: () => void;
    disabled?: boolean;
}

export default function Button({
    text,
    onPress,
    disabled = false,
}: ButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
        >
            <View color={disabled ? 'disabledButton' : 'button'} border={'button'}>
                <Text context={disabled ? 'disabledButton' : 'button'}>{text}</Text>
            </View>
        </Pressable>
    )
}
