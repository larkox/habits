import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import InputCalendar from '@/components/base/InputCalendar';
import Loader from '@/components/base/Loader';
import View from '@/components/base/View';
import useSmartLoading from '@/hooks/useSmartLoading';
import useStorageMutation from "@/hooks/useStorageMutation";
import { useBirthday } from '@/store/hooks';
import { removeBirthday, updateBirthday } from '@/store/storage';
import type { Birthday } from '@/types/model';
import { getMonthAndDay, getMonthAndDayTimestamp } from '@/utils/time';
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
            text={t('birthdays.edit.saveButton')}
            onPress={onPress}
            loading={loading}
        />
    )
}

export default function EditScreen() {
    const {id} = useLocalSearchParams<{id: string}>();
    const birthday = useBirthday(id);
    const loading = useSmartLoading(birthday === undefined);

    if (loading.isLoading || !birthday) {
        return loading.showLoader ? <Loader /> : null;
    }

    return <BirthdayForm
        key={birthday.id}
        birthday={birthday}
    />;
}

function BirthdayForm({birthday}: {birthday: Birthday}) {
    const mutation = useStorageMutation();
    const [errors, setErrors] = useState<FormErrors>({});
    const router = useRouter();
    const id = birthday.id;
    const navigation = useNavigation();
    const [name, setName] = useState(birthday.name);
    const [date, setDate] = useState(getMonthAndDayTimestamp(birthday.date));
    const [yearString, setYearString] = useState(birthday.year.toString());
    const [t] = useTranslation();

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
        const saved = await mutation.run(() => updateBirthday(id, normalizedName, getMonthAndDay(date), year));
        if (saved) {
            router.back();
        }
    }, [date, id, mutation, name, router, t, yearString]);

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                loading={mutation.isPending}
                onPress={save}
            />
        )})
    }, [mutation.isPending, navigation, save])

    const deleteCallback = useCallback(async () => {
        const removed = await mutation.run(() => removeBirthday(id));
        if (removed) {
            router.back();
        }
    }, [mutation, router, id])

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
            <View style={styles.deletecontainer}>
                <Button
                    text={t('birthdays.edit.deleteButton')}
                    onPress={deleteCallback}
                    loading={mutation.isPending}
                />
            </View>
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
