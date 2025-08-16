import { View as RNView, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { ThemeColors, useThemeColor } from '@/hooks/useThemeColor';
import { ComponentProps, useMemo } from 'react';

export type ViewProps = {
    color?: ThemeColors;
    style?: StyleProp<ViewStyle>;
    border?: 'button' | 'view';
    children?: ComponentProps<typeof RNView>['children'];
}

export default function View({
    color = 'transparent',
    style,
    children,
    border,
}: ViewProps) {
    const backgroundColor = useThemeColor(color);
    const borderColor = useThemeColor('buttonBorder');
    const baseStyle = useMemo(() => {
        return [
            style,
            {backgroundColor},
            border ? styles.borders : styles.noBorders,
            border ? {borderColor} : {borderColor: undefined},
            {padding: 8},
        ];
    }, [backgroundColor, borderColor, border, style]);

    return <RNView style={baseStyle}>{children}</RNView>;
}

const styles = StyleSheet.create({
    noBorders: {
        borderWidth: undefined,
        borderRadius: undefined,
    },
    borders: {
        borderWidth: 1,
        borderRadius: 8,
    }
})