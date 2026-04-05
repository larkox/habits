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
    date: number;
    name: string;
    id: string;
}

function SaveButton({
    date,
    name,
    id,
}: SaveButtonProps) {
    const router = useRouter();
    const [t] = useTranslation();

    const onPress = useCallback(() => {
        updateTodo(id, name, date);
        router.back();
    }, [date, id, name, router]);

    return (
        <Button text={t('todo.editTodo.saveButton')} onPress={onPress}/>
    )
}

export default function EditScreen() {
    const {id} = useLocalSearchParams<{id: string}>();
    const todo = useTodo(id);
    const navigation = useNavigation();
    const [name, setName] = useState(todo?.name || '')
    const [date, setDate] = useState(todo?.date || 0);
    const [t] = useTranslation();

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                date={date}
                name={name}
                id={id}
            />
        )})
    }, [id, navigation, date, name])

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
