import { StyleSheet } from 'react-native';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import View from '@/components/base/View';
import { useBirthday } from '@/store/hooks';
import { removeBirthday, updateBirthday } from '@/store/storage';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputCalendar from '@/components/base/InputCalendar';
import { getMonthAndDay, getNextMonthAndDay } from '@/utils/time';

type SaveButtonProps = {
    date: number;
    name: string;
    yearString: string;
    id: string;
}

function SaveButton({
    date,
    name,
    yearString,
    id,
}: SaveButtonProps) {
    const router = useRouter();
    const [t] = useTranslation();

    const onPress = useCallback(() => {
        const year = parseInt(yearString, 10);
        if (isNaN(year)) {
            return;
        }
        updateBirthday(id, name, getMonthAndDay(date), year);
        router.back();
    }, [date, id, name, yearString, router]);

    return (
        <Button text={t('birthdays.edit.saveButton')} onPress={onPress}/>
    )
}

export default function EditScreen() {
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
                date={date}
                name={name}
                yearString={yearString}
                id={id}
            />
        )})
    }, [id, navigation, date, name, yearString])

    useEffect(() => {
        setName(birthday?.name || '');
        setDate(birthday?.date ? getNextMonthAndDay(birthday.date) : 0);
        setYearString(birthday?.year.toString() || '')
    }, [birthday]);

    const deleteCallback = useCallback(() => {
        removeBirthday(id);
        router.back();
    }, [router, id])

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
