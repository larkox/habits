import { useMemo } from 'react';

import { useThemeColor } from './useThemeColor';

export default function useStackTheme() {
    const backgroundColor = useThemeColor('background');
    const headerBackgroundColor = useThemeColor('foreground');
    const headerTintColor = useThemeColor('foregroundText');

    return useMemo(() => ({
        contentStyle: {backgroundColor},
        headerStyle: {backgroundColor: headerBackgroundColor},
        headerTintColor,
        headerShadowVisible: false,
        headerTitleStyle: {color: headerTintColor},
    }), [backgroundColor, headerBackgroundColor, headerTintColor]);
}
