import { StyleSheet } from 'react-native';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import InputCalendar from '@/components/base/InputCalendar';
import View from '@/components/base/View';
import { addBirthday } from '@/store/storage';
import { getMonthAndDay, getStartOfDay } from '@/utils/time';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type SaveButtonProps = {
    date: number;
    title: string;
    yearString: string;
}

function SaveButton({
    date,
    title,
    yearString,
}: SaveButtonProps) {
    const router = useRouter();
    const [t] = useTranslation();

    const onPress = useCallback(() => {
        const year = parseInt(yearString, 10);
        if (isNaN(year)) {
            return;
        }
        addBirthday(title, getMonthAndDay(date), year);
        router.back();
    }, [title, date, yearString, router]);

    return (
        <Button text={t('birthdays.add.addButton')} onPress={onPress}/>
    )
}

export default function AddScreen() {
    const navigation = useNavigation();
    const [name, setName] = useState('')
    const [date, setDate] = useState<number>(() => getStartOfDay());
    const [yearString, setYearString] = useState('');
    const [t] = useTranslation();

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                date={date}
                title={name}
                yearString={yearString}
            />
        )})
    }, [navigation, date, yearString, name])

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
                type='numeric'
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
