import { ComponentProps } from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

import { ThemeColors, useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = {
    type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
    context: 'foreground' | 'foregroundDone' | 'foregroundOverdue' | 'button' | 'disabledButton';
    children: ComponentProps<typeof RNText>['children']
};

export default function Text({
    type = 'default',
    context,
    ...rest
}: ThemedTextProps) {
    let colorName: ThemeColors;
    switch (context) {
        case 'foreground':
            colorName = 'foregroundText';
            break;
        case 'foregroundDone':
            colorName = 'foregroundDoneText';
            break;
        case 'foregroundOverdue':
            colorName = 'foregroundOverdueText';
            break;
        case 'button':
            colorName = 'buttonText';
            break;
        case 'disabledButton':
            colorName = 'disabledButtonText';
            break;
    }
    const color = useThemeColor(colorName);

    return (
        <RNText
            style={[
                { color },
                type === 'default' ? styles.default : undefined,
                type === 'title' ? styles.title : undefined,
                type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
                type === 'subtitle' ? styles.subtitle : undefined,
                type === 'link' ? styles.link : undefined,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    default: {
        fontSize: 16,
        lineHeight: 24,
    },
    defaultSemiBold: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '600',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 32,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    link: {
        lineHeight: 30,
        fontSize: 16,
        color: '#0a7ea4',
    },
});
