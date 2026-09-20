import useStorageMutation from "@/hooks/useStorageMutation";
import { ThemeColors } from "@/hooks/useThemeColor";
import { useHabit } from "@/store/hooks";
import { doHabit } from "@/store/storage";
import { getDue, getStartOfDay } from "@/utils/time";
import { useRouter } from "expo-router";
import { ComponentProps, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
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
    const habit = useHabit(id);
    const [t] = useTranslation();
    const router = useRouter();

    const doCallback = useCallback(() => {
        void mutation.run(() => doHabit(id));
    }, [id, mutation]);

    const longPressCallback = useCallback(() => {
        router.navigate(`/(tabs)/habits/edit?id=${id}`);
    }, [id, router])

    if (!habit) {
        return;
    }

    const done = habit.lastDone === getStartOfDay();
    const due = getDue(habit.lastDone, habit.periodicity);
    const overdue = due < 0;
    let viewColor: ThemeColors = 'foreground';
    if (done) {
        viewColor = 'foregroundDone';
    } else if (overdue) {
        viewColor = 'foregroundOverdue'
    }
    const doText = done ? t('habits.doneButton') : t('habits.doButton');
    const dueText = done ? t('habits.doneToday') : t('habits.due', {val: getDue(habit.lastDone, habit.periodicity)});

    let textContext: ComponentProps<typeof Text>['context'] = 'foreground';
    if (done) {
        textContext = 'foregroundDone';
    }

    if (overdue) {
        textContext = 'foregroundOverdue';
    }


    return (
        <Pressable
            onLongPress={longPressCallback}
            disabled={mutation.isPending}
        >
            <View
                color={viewColor}
                border={'view'}
                style={{flexDirection: 'row', alignItems: 'center'}}
            >
                <View style={{flex: 1, flexShrink: 1}}>
                    <Text context={textContext}>{habit.title}</Text>
                    <Text context={textContext}>{dueText}</Text>
                </View>
                <Button
                    onPress={doCallback}
                    loading={mutation.isPending}
                    text={doText}
                    disabled={done}
                />
            </View>
        </Pressable>
    )
}
