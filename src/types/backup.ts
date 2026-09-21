import type { Birthday, Chart, ChartValue, FridgeFood, Habit, Todo } from './model';

export type HabitHistoryEntry = { id: string; habitId: string; date: number };

export type BackupData = {
    habits: Habit[];
    habitHistory: HabitHistoryEntry[];
    charts: Chart[];
    chartValues: ChartValue[];
    fridge: FridgeFood[];
    todos: Todo[];
    birthdays: Birthday[];
};

export type BackupFile = {
    format: 'habits-backup';
    version: 1;
    exportedAt: string;
    includesHistory: boolean;
    data: BackupData;
};

export type ExportScope = 'elements' | 'history';
export type ImportMode = 'append' | 'replace';
