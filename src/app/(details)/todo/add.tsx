import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useNavigation, useRouter } from 'expo-router';


import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import InputCalendar from '@/components/base/InputCalendar';
import View from '@/components/base/View';
import useStorageMutation from "@/hooks/useStorageMutation";
import { useTranslate } from "@/platform/translations";
import { addTodo } from '@/store/storage';
import { getStartOfDay } from '@/utils/time';
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
    const t = useTranslate();

    return (
        <Button
            text={t('todo.addTodo.addButton')}
            onPress={onPress}
            loading={loading}
        />
    )
}

export default function AddScreen() {
    const mutation = useStorageMutation();
    const [errors, setErrors] = useState<FormErrors>({});
    const navigation = useNavigation();
    const [name, setName] = useState('')
    const [date, setDate] = useState<number>(() => getStartOfDay());
    const t = useTranslate();
    const router = useRouter();

    const save = useCallback(async () => {
        const normalizedName = normalizeRequiredText(name);
        setErrors({name: normalizedName ? undefined : t('validation.required')});
        if (!normalizedName) {
            return;
        }
        const saved = await mutation.run(() => addTodo(normalizedName, date));
        if (saved) {
            router.back();
        }
    }, [date, mutation, name, router, t]);

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                loading={mutation.isPending}
                onPress={save}
            />
        )})
    }, [mutation.isPending, navigation, save])

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
});
