import { useCallback, useEffect, useState } from 'react';

import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';
import FormScreen from '@/components/base/FormScreen';
import Input from '@/components/base/Input';
import InputCalendar from '@/components/base/InputCalendar';
import Loader from '@/components/base/Loader';
import useSmartLoading from '@/hooks/useSmartLoading';
import useStorageMutation from "@/hooks/useStorageMutation";
import { useTodo } from '@/store/hooks';
import { updateTodo } from '@/store/storage';
import type { Todo } from '@/types/model';
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
    const {id} = useLocalSearchParams<{id: string}>();
    const todo = useTodo(id);
    const loading = useSmartLoading(todo === undefined);

    if (loading.isLoading || !todo) {
        return loading.showLoader ? <Loader /> : null;
    }

    return <TodoForm
        key={todo.id}
        todo={todo}
    />;
}

function TodoForm({todo}: {todo: Todo}) {
    const mutation = useStorageMutation();
    const [errors, setErrors] = useState<FormErrors>({});
    const id = todo.id;
    const navigation = useNavigation();
    const [name, setName] = useState(todo.name)
    const [date, setDate] = useState(todo.date);
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

    return (
        <FormScreen>
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
        </FormScreen>
    );
}

