import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import InputCalendar from '@/components/base/InputCalendar';
import View from '@/components/base/View';
import useStorageMutation from "@/hooks/useStorageMutation";
import { useTodo } from '@/store/hooks';
import { updateTodo } from '@/store/storage';
import { normalizeRequiredText } from '@/utils/validation';

type FormErrors = {
    name?: string;
};

type SaveButtonProps = {
    loading: boolean;
    onPress: () => void;
}

function SaveButton({
    loading,
    onPress,
}: SaveButtonProps) {
    const [t] = useTranslation();

    return (
        <Button
            text={t('todo.editTodo.saveButton')}
            onPress={onPress}
            loading={loading}
        />
    )
}

export default function EditScreen() {
    const mutation = useStorageMutation();
    const [errors, setErrors] = useState<FormErrors>({});
    const {id} = useLocalSearchParams<{id: string}>();
    const todo = useTodo(id);
    const navigation = useNavigation();
    const [name, setName] = useState(todo?.name || '')
    const [date, setDate] = useState(todo?.date || 0);
    const [t] = useTranslation();
    const router = useRouter();

    const save = useCallback(async () => {
        const normalizedName = normalizeRequiredText(name);
        setErrors({name: normalizedName ? undefined : t('validation.required')});
        if (!normalizedName) {
            return;
        }
        const saved = await mutation.run(() => updateTodo(id, normalizedName, date));
        if (saved) {
            router.back();
        }
    }, [date, id, mutation, name, router, t]);

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                loading={mutation.isPending}
                onPress={save}
            />
        )})
    }, [mutation.isPending, navigation, save])

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
                error={errors.name}
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
