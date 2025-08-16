import { StyleSheet } from 'react-native';

import Button from '@/components/base/Button';
import Input from '@/components/base/Input';
import View from '@/components/base/View';
import { addChart } from '@/store/storage';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type SaveButtonProps = {
    title: string;
}
function AddButton({
    title,
}: SaveButtonProps) {
    const [t] = useTranslation();
    const router = useRouter();

    const onPress = useCallback(() => {
        addChart(title);
        router.back();
    }, [title, router]);
            
    return <Button text={t('charts.addChart.addButton')} onPress={onPress}/>
}
export default function AddChartScreen() {
    const [title, setTitle] = useState('')
    const [t] = useTranslation();
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => <AddButton title={title}/>,
        })
    }, [navigation, title])

    return (
        <View
            style={styles.container}
        >
            <Input
                label={t('charts.addChart.inputLabels.title')}
                placeholder={t('charts.addChart.inputLabels.titlePlaceholder')}
                onChange={setTitle}
                type='text'
                value={title}
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
