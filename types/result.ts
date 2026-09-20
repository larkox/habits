export type Result<T = void> =
    | { ok: true; value: T }
    | { ok: false; error: { code: 'storage_error' } };
