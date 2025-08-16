/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export type ThemeColors = keyof typeof Colors.light & keyof typeof Colors.dark | 'transparent'
export function useThemeColor(
    colorName: ThemeColors,
) {
    const theme = useColorScheme() ?? 'light';

    if (colorName === 'transparent') {
        return undefined;
    }

    return Colors[theme][colorName];
}
