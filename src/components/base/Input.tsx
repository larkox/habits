import { InputModeOptions, TextInput } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

import Text from "./Text";
import View from "./View";

type Props = {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (newValue: string) => void;
    type: InputModeOptions;
    error?: string;
}
export default function Input({
    label,
    placeholder,
    value,
    onChange,
    type,
    error,
}: Props) {
    const color = useThemeColor('foregroundText');
    const placeholderTextColor = useThemeColor('placeholderText');
    const backgroundColor = useThemeColor('foreground');
    const borderColor = useThemeColor('border');
    return (
        <View>
            <Text context='foreground'>{label}</Text>    
            <TextInput
                placeholder={placeholder}
                value={value}
                inputMode={type}
                onChangeText={onChange}
                style={{borderWidth: 1, borderColor, color, backgroundColor}}
                placeholderTextColor={placeholderTextColor}
            />
            {error && <Text context='foregroundOverdue'>{error}</Text>}
        </View>
    )
}
