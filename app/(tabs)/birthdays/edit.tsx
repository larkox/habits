import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import InputCalendar from '@/components/base/InputCalendar';
import View from '@/components/base/View';
import useStorageMutation from "@/hooks/useStorageMutation";
import { useBirthday } from '@/store/hooks';
import { removeBirthday, updateBirthday } from '@/store/storage';
import { getMonthAndDay, getNextMonthAndDay } from '@/utils/time';

type SaveButtonProps = {
    mutation: ReturnType<typeof useStorageMutation>;
    date: number;
    name: string;
    yearString: string;
    id: string;
}

function SaveButton({
    mutation,
    date,
    name,
    yearString,
    id,
}: SaveButtonProps) {
    const router = useRouter();
    const [t] = useTranslation();

    const onPress = useCallback(async () => {
        const year = parseInt(yearString, 10);
        if (isNaN(year)) {
            return;
        }
        const saved = await mutation.run(() => updateBirthday(id, name, getMonthAndDay(date), year));
        if (saved) {
            router.back();
        }
    }, [mutation, date, id, name, yearString, router]);

    return (
        <Button
            text={t('birthdays.edit.saveButton')}
            onPress={onPress}
            loading={mutation.isPending}
        />
    )
}

export default function EditScreen() {
    const mutation = useStorageMutation();
    const router = useRouter();
    const {id} = useLocalSearchParams<{id: string}>();
    const birthday = useBirthday(id);
    const navigation = useNavigation();
    const [name, setName] = useState(birthday?.name || '');
    const [date, setDate] = useState(birthday?.date ? getNextMonthAndDay(birthday.date) : 0);
    const [yearString, setYearString] = useState(birthday?.year.toString() || '');
    const [t] = useTranslation();

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                mutation={mutation}
                date={date}
                name={name}
                yearString={yearString}
                id={id}
            />
        )})
    }, [mutation, id, navigation, date, name, yearString])

    useEffect(() => {
        setName(birthday?.name || '');
        setDate(birthday?.date ? getNextMonthAndDay(birthday.date) : 0);
        setYearString(birthday?.year.toString() || '')
    }, [birthday]);

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
            />
            <Input
                label={t('birthdays.add.inputLabels.year')}
                onChange={setYearString}
                value={yearString}
                type='text'
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
