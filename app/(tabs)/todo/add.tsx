import useStorageMutation from "@/hooks/useStorageMutation";
import { StyleSheet } from 'react-native';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import InputCalendar from '@/components/base/InputCalendar';
import View from '@/components/base/View';
import { addTodo } from '@/store/storage';
import { getStartOfDay } from '@/utils/time';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type SaveButtonProps = {
    mutation: ReturnType<typeof useStorageMutation>;
    date: number;
    title: string;
}

function SaveButton({
    mutation,
    date,
    title,
}: SaveButtonProps) {
    const router = useRouter();
    const [t] = useTranslation();

    const onPress = useCallback(async () => {
        const saved = await mutation.run(() => addTodo(title, date));
        if (saved) {
            router.back();
        }
    }, [mutation, title, date, router]);

    return (
        <Button text={t('todo.addTodo.addButton')} onPress={onPress} loading={mutation.isPending}/>
    )
}

export default function AddScreen() {
    const mutation = useStorageMutation();
    const navigation = useNavigation();
    const [name, setName] = useState('')
    const [date, setDate] = useState<number>(() => getStartOfDay());
    const [t] = useTranslation();

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                mutation={mutation}
                date={date}
                title={name}
            />
        )})
    }, [mutation, navigation, date, name])

    return (
        <View
            style={styles.container}
        >
            <Input
                label={t('todo.addTodo.inputLabels.name')}
                onChange={setName}
                value={name}
                type='text'
            />
            <InputCalendar
                label={t('todo.addTodo.inputLabels.date')}
                setValue={setDate}
                value={date}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 8,
    },
});
