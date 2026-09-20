import { initialSchema } from './001-initial-schema';
import type { Migration } from './migration';

export const migrations: readonly Migration[] = [
    initialSchema,
];
