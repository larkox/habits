import { ChartValue } from "@/types/model";

import { getStartOfDay } from "./time";

export function getChartValueForToday(values: ChartValue[] | undefined) {
    if (!values) {
        return undefined;
    }

    if (!values.length) {
        return undefined;
    }

    const lastValue = values[values.length - 1];

    if (!lastValue) {
        return undefined;
    }

    if (lastValue.date !== getStartOfDay()) {
        return undefined;
    }

    return lastValue;
}
