import { useMemo } from "react";

import { LineChart } from "react-native-gifted-charts";

import { useThemeColor } from "@/hooks/useThemeColor";

type Props = {
    data?: {
        value: number;
        label: string;
    }[]
}

export default function Chart({
    data,
}: Props) {
    const baseColor = useThemeColor('foregroundText');
    const rulesColor = useThemeColor('placeholderText');

    const textStyle = useMemo(() => ({color: baseColor}), [baseColor]);

    return <LineChart
        data={data}
        xAxisLabelTextStyle={textStyle}
        yAxisTextStyle={textStyle}
        color={baseColor}
        xAxisColor={baseColor}
        yAxisColor={baseColor}
        dataPointsColor={baseColor}
        rulesColor={rulesColor}
    />
}
