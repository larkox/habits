import { useThemeColor } from "@/hooks/useThemeColor";
import { InputModeOptions, TextInput } from "react-native";
import Text from "./Text";
import View from "./View";

type Props = {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (newValue: string) => void;
    type: InputModeOptions;
}
export default function Input({
    label,
    placeholder,
    value,
    onChange,
    type,
}: Props) {
    const placeholderTextColor = useThemeColor('foregroundText');
    const borderColor = useThemeColor('border');
    return (
        <View>
            <Text context='foreground'>{label}</Text>    
            <TextInput
                placeholder={placeholder}
                value={value}
                inputMode={type}
                onChangeText={onChange}
                style={{borderWidth: 1, borderColor}}
                placeholderTextColor={placeholderTextColor}
            />
        </View>
    )
}