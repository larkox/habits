import { ComponentProps, useCallback } from "react";
import { Pressable } from "react-native";

import { useRouter } from "expo-router";


import useStorageMutation from "@/hooks/useStorageMutation";
import { ThemeColors } from "@/hooks/useThemeColor";
import { useTranslate } from "@/platform/translations";
import { useFood } from "@/store/hooks";
import { removeFoodFromFridge } from "@/store/storage";
import { getDue } from "@/utils/time";

import Button from "./base/Button";
import Text from "./base/Text";
import View from "./base/View";

type Props = {
    id: string;
}

export default function Habit({
    id,
}: Props) {
    const mutation = useStorageMutation();
    const food = useFood(id);
    const t = useTranslate();
    const router = useRouter();

    const eatCallback = useCallback(() => {
        void mutation.run(() => removeFoodFromFridge(id));
    }, [id, mutation]);

    const longPressCallback = useCallback(() => {
        router.navigate(`/(details)/fridge/edit?id=${id}`);
    }, [id, router])

    if (!food) {
        return;
    }

    const due = getDue(food.date, 0);
    const overdue = due < 0;
    let viewColor: ThemeColors = 'foreground';
    if (overdue) {
        viewColor = 'foregroundOverdue'
    }
    const eatText = t('fridge.eatButton');
    const dueText = t('fridge.due', {val: due});

    let textContext: ComponentProps<typeof Text>['context'] = 'foreground';
    if (overdue) {
        textContext = 'foregroundOverdue';
    }

    return (
        <Pressable
            onLongPress={longPressCallback}
            disabled={mutation.isPending}
        >
            <View
                testID="food-card"
                color={viewColor}
                border={'view'}
                style={{flexDirection: 'row', alignItems: 'center'}}
            >
                <View style={{flex: 1, flexShrink: 1}}>
                    <Text context={textContext}>{food.name}</Text>
                    <Text context={textContext}>{dueText}</Text>
                </View>
                <Button
                    onPress={eatCallback}
                    loading={mutation.isPending}
                    text={eatText}
                />
            </View>
        </Pressable>
    )
}
