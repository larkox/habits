export type Habit = {
    id: string;
    title: string;
    lastDone: number;
    periodicity: number;
}

export type Chart = {
    id: string;
    title: string;
}

export type ChartValue = {
    id: string;
    chartId: string;
    value: number;
    date: number;
}