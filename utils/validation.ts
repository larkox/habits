const LOCALIZED_NUMBER_PATTERN = /^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/;
const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;

export function normalizeRequiredText(value: string) {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
}

export function parseLocalizedNumber(value: string) {
    const normalized = value.trim();
    if (!LOCALIZED_NUMBER_PATTERN.test(normalized)) {
        return undefined;
    }

    const parsed = Number(normalized.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : undefined;
}

export function parsePositiveInteger(value: string) {
    const normalized = value.trim();
    if (!POSITIVE_INTEGER_PATTERN.test(normalized)) {
        return undefined;
    }

    const parsed = Number(normalized);
    return Number.isSafeInteger(parsed) ? parsed : undefined;
}

export function parseBirthYear(value: string) {
    const year = parsePositiveInteger(value);
    if (year === undefined || year > new Date().getFullYear()) {
        return undefined;
    }

    return year;
}

export function isValidMonthAndDay(value: string) {
    const match = /^(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
        return false;
    }

    const month = Number(match[1]);
    const day = Number(match[2]);
    const date = new Date(2000, month - 1, day);
    return date.getFullYear() === 2000
        && date.getMonth() === month - 1
        && date.getDate() === day;
}
