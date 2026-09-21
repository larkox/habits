import { ComponentProps, useCallback } from "react";
import { Pressable } from "react-native";

import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { ThemeColors } from "@/hooks/useThemeColor";
import { useBirthday } from "@/store/hooks";
import { getDue, getNextMonthAndDay } from "@/utils/time";

import Text from "./base/Text";
import View from "./base/View";

type Props = {
    id: string;
}

export default function Birthday({
    id,
}: Props) {
    const birthdate = useBirthday(id);
    const [t] = useTranslation();
    const router = useRouter();

    const longPressCallback = useCallback(() => {
        router.navigate(`/(tabs)/birthdays/edit?id=${id}`);
    }, [id, router])

    if (!birthdate) {
        return;
    }

    const nextDate = getNextMonthAndDay(birthdate.date)
    const due = getDue(nextDate, 0);
    const overdue = due < 0;
    let viewColor: ThemeColors = 'foreground';
    if (overdue) {
        viewColor = 'foregroundOverdue'
    }
    const dueText = t('birthdays.due', {val: due});

    let textContext: ComponentProps<typeof Text>['context'] = 'foreground';
    if (overdue) {
        textContext = 'foregroundOverdue';
    }

    const age = (new Date(nextDate)).getFullYear() - birthdate.year;

    return (
        <Pressable
            onLongPress={longPressCallback}
        >
            <View
                color={viewColor}
                border={'view'}
                style={{flexDirection: 'row', alignItems: 'center'}}
            >
                <View style={{flex: 1, flexShrink: 1}}>
                    <Text context={textContext}>{birthdate.name}</Text>
                    <Text context={textContext}>{dueText}</Text>
                </View>
                <View>
                    <Text context={textContext}>{age}</Text>
                </View>
            </View>
        </Pressable>
    )
}
