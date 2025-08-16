import { useChart, useChartValues } from "@/store/hooks";
import { removeChart } from "@/store/storage";
import { getChartValueForToday } from "@/utils/charts";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import Button from "./base/Button";
import Text from "./base/Text";
import View from "./base/View";

type Props = {
    id: string;
}

export default function Chart({
    id,
}: Props) {
    const router = useRouter();
    const chart = useChart(id);
    const values = useChartValues(id);
    const [t] = useTranslation();

    const hasValueForToday = getChartValueForToday(values);

    const data = useMemo(() => {
        return values?.map((v) => ({value: v.value, label: t('date', {val: v.date, formatParams: {val: {month:'numeric',day:'numeric'}}})}));
    }, [values, t]);

    const doCallback = useCallback(() => {
        router.navigate(`/(tabs)/charts/addValue?id=${id}`)
    }, [id, router]);

    const deleteCallback = useCallback(() => {
        removeChart(id);
    }, [id])

    if (!chart) {
        return;
    }

    let addText = t('charts.addValueButton');
    if (hasValueForToday) {
        addText = t('charts.updateValueButton');
    }

    return (
        <View
            color={'foreground'}
            border={'view'}
        >
            <Text
                context={'foreground'}
                type={'subtitle'}
            >
                {chart.title}
            </Text>
            <LineChart data={data}/>
            <View
                color={'foreground'}
                style={styles.buttonContainer}
            >
                <Button
                    onPress={doCallback}
                    text={addText}
                />
                <Button
                    onPress={deleteCallback}
                    text={t('charts.deleteButton')}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
    }
})