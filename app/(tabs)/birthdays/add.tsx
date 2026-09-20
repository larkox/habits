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

type SaveButtonProps = {
    mutation: ReturnType<typeof useStorageMutation>;
    date: number;
    title: string;
    yearString: string;
}

function SaveButton({
    mutation,
    date,
    title,
    yearString,
}: SaveButtonProps) {
    const router = useRouter();
    const [t] = useTranslation();

    const onPress = useCallback(async () => {
        const year = parseInt(yearString, 10);
        if (isNaN(year)) {
            return;
        }
        const saved = await mutation.run(() => addBirthday(title, getMonthAndDay(date), year));
        if (saved) {
            router.back();
        }
    }, [mutation, title, date, yearString, router]);

    return (
        <Button
            text={t('birthdays.add.addButton')}
            onPress={onPress}
            loading={mutation.isPending}
        />
    )
}

export default function AddScreen() {
    const mutation = useStorageMutation();
    const navigation = useNavigation();
    const [name, setName] = useState('')
    const [date, setDate] = useState<number>(() => getStartOfDay());
    const [yearString, setYearString] = useState('');
    const [t] = useTranslation();

    useEffect(() => {
        navigation.setOptions({headerRight: () => (
            <SaveButton
                mutation={mutation}
                date={date}
                title={name}
                yearString={yearString}
            />
        )})
    }, [mutation, navigation, date, yearString, name])

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
