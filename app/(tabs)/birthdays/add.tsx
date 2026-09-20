import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import InputCalendar from '@/components/base/InputCalendar';
import View from '@/components/base/View';
import useStorageMutation from "@/hooks/useStorageMutation";
import { addBirthday } from '@/store/storage';
import { getMonthAndDay, getStartOfDay } from '@/utils/time';
import { normalizeRequiredText, parseBirthYear } from '@/utils/validation';

type FormErrors = {
    name?: string;
    year?: string;
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
            text={t('birthdays.add.addButton')}
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
    const [yearString, setYearString] = useState('');
    const [t] = useTranslation();
    const router = useRouter();

    const save = useCallback(async () => {
        const normalizedName = normalizeRequiredText(name);
        const year = parseBirthYear(yearString);
        const nextErrors = {
            name: normalizedName ? undefined : t('validation.required'),
            year: year === undefined ? t('validation.birthYear') : undefined,
        };
        setErrors(nextErrors);
        if (!normalizedName || year === undefined) {
            return;
        }
        const saved = await mutation.run(() => addBirthday(normalizedName, getMonthAndDay(date), year));
        if (saved) {
            router.back();
        }
    }, [date, mutation, name, router, t, yearString]);

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
                label={t('birthdays.add.inputLabels.name')}
                onChange={setName}
                value={name}
                type='text'
                error={errors.name}
            />
            <Input
                label={t('birthdays.add.inputLabels.year')}
                onChange={setYearString}
                value={yearString}
                type='numeric'
                error={errors.year}
            />
            <InputCalendar
                label={t('birthdays.add.inputLabels.date')}
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
