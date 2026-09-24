import { ComponentProps, useCallback } from "react";
import { Pressable } from "react-native";

import { useRouter } from "expo-router";


import useStorageMutation from "@/hooks/useStorageMutation";
import { ThemeColors } from "@/hooks/useThemeColor";
import { useTranslate } from "@/platform/translations";
import { useTodo } from "@/store/hooks";
import { removeTodo } from "@/store/storage";
import { getDue } from "@/utils/time";

import Button from "./base/Button";
import Text from "./base/Text";
import View from "./base/View";

type Props = {
    id: string;
}

export default function Todo({
    id,
}: Props) {
    const mutation = useStorageMutation();
    const todo = useTodo(id);
    const t = useTranslate();
    const router = useRouter();

    const doneCallback = useCallback(() => {
        void mutation.run(() => removeTodo(id));
    }, [id, mutation]);

    const longPressCallback = useCallback(() => {
        router.navigate(`/(details)/todo/edit?id=${id}`);
    }, [id, router])

    if (!todo) {
        return;
    }

    const due = getDue(todo.date, 0);
    const overdue = due < 0;
    let viewColor: ThemeColors = 'foreground';
    if (overdue) {
        viewColor = 'foregroundOverdue'
    }
    const doText = t('todo.doButton');
    const dueText = t('todo.due', {val: due});

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
                testID="todo-card"
                color={viewColor}
                border={'view'}
                style={{flexDirection: 'row', alignItems: 'center'}}
            >
                <View style={{flex: 1, flexShrink: 1}}>
                    <Text context={textContext}>{todo.name}</Text>
                    <Text context={textContext}>{dueText}</Text>
                </View>
                <Button
                    onPress={doneCallback}
                    loading={mutation.isPending}
                    text={doText}
                />
            </View>
        </Pressable>
    )
}
