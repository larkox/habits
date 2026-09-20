import useStorageMutation from "@/hooks/useStorageMutation";
import { ThemeColors } from "@/hooks/useThemeColor";
import { useTodo } from "@/store/hooks";
import { removeTodo } from "@/store/storage";
import { getDue } from "@/utils/time";
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

export default function Todo({
    id,
}: Props) {
    const mutation = useStorageMutation();
    const todo = useTodo(id);
    const [t] = useTranslation();
    const router = useRouter();

    const doneCallback = useCallback(() => {
        void mutation.run(() => removeTodo(id));
    }, [id, mutation]);

    const longPressCallback = useCallback(() => {
        router.navigate(`/(tabs)/todo/edit?id=${id}`);
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
