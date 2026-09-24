import { useCallback, useMemo } from "react";
import { StyleSheet } from "react-native";

import { useRouter } from "expo-router";

import BaseChart from "@/components/base/Chart";
import useStorageMutation from "@/hooks/useStorageMutation";
import { useTranslate } from "@/platform/translations";
import { useChart, useChartValues } from "@/store/hooks";
import { removeChart } from "@/store/storage";
import { getChartValueForToday } from "@/utils/charts";

import Button from "./base/Button";
import Text from "./base/Text";
import View from "./base/View";

type Props = {
    id: string;
}

export default function Chart({
    id,
}: Props) {
    const mutation = useStorageMutation();
    const router = useRouter();
    const chart = useChart(id);
    const values = useChartValues(id);
    const t = useTranslate();

    const hasValueForToday = getChartValueForToday(values);

    const data = useMemo(() => {
        return values?.map((v) => ({value: v.value, label: t('date', {val: v.date, formatParams: {val: {month:'numeric',day:'numeric'}}})}));
    }, [values, t]);

    const doCallback = useCallback(() => {
        router.navigate(`/(details)/charts/addValue?id=${id}`)
    }, [id, router]);

    const deleteCallback = useCallback(() => {
        void mutation.run(() => removeChart(id));
    }, [id, mutation])

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
            <BaseChart data={data} />
            <View
                color={'foreground'}
                style={styles.buttonContainer}
            >
                <Button
                    onPress={doCallback}
                    disabled={mutation.isPending}
                    text={addText}
                />
                <Button
                    onPress={deleteCallback}
                    loading={mutation.isPending}
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
