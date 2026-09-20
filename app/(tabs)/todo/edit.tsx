import useStorageMutation from "@/hooks/useStorageMutation";
import { StyleSheet } from 'react-native';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import View from '@/components/base/View';
import { useTodo } from '@/store/hooks';
import { updateTodo } from '@/store/storage';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputCalendar from '@/components/base/InputCalendar';

type SaveButtonProps = {
    mutation: ReturnType<typeof useStorageMutation>;
    date: number;
    name: string;
    id: string;
}

function SaveButton({
    mutation,
    date,
    name,
    id,
}: SaveButtonProps) {
    const router = useRouter();
    const [t] = useTranslation();

    const onPress = useCallback(async () => {
        const saved = await mutation.run(() => updateTodo(id, name, date));
        if (saved) {
            router.back();
        }
    }, [mutation, date, id, name, router]);

    return (
        <Button text={t('todo.editTodo.saveButton')} onPress={onPress} loading={mutation.isPending}/>
    )
}

export default function EditScreen() {
    const mutation = useStorageMutation();
    const {id} = useLocalSearchParams<{id: string}>();
    const todo = useTodo(id);
    const navigation = useNavigation();
    const [name, setName] = useState(todo?.name || '')
    const [date, setDate] = useState(todo?.date || 0);
    const [t] = useTranslation();

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                mutation={mutation}
                date={date}
                name={name}
                id={id}
            />
        )})
    }, [mutation, id, navigation, date, name])

    useEffect(() => {
        setName(todo?.name || '');
        setDate(todo?.date || 0);
    }, [todo]);

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
    deletecontainer: {
        marginTop: 'auto',
    }
});
