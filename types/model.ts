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

export type FridgeFood = {
    id: string;
    name: string;
    date: number;
}

export type Todo = {
    id: string;
    name: string;
    date: number;
}
