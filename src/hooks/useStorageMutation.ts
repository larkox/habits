import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

import { useTranslate } from "@/platform/translations";
import type { Result } from "@/types/result";

export default function useStorageMutation() {
    const [isPending, setIsPending] = useState(false);
    const inFlight = useRef(false);
    const mounted = useRef(true);
    const t = useTranslate();

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const run = useCallback(async (operation: () => Promise<Result>): Promise<boolean> => {
        // A ref also blocks a second press before React renders the disabled button.
        if (inFlight.current || !mounted.current) {
            return false;
        }
        inFlight.current = true;
        setIsPending(true);

        try {
            const result = await operation();
            if (!mounted.current) {
                return false;
            }
            if (!result.ok) {
                const isValidationError = result.error.code === 'validation_error';
                Alert.alert(
                    t(isValidationError ? 'errors.validationTitle' : 'errors.storageTitle'),
                    t(isValidationError ? 'errors.validationMessage' : 'errors.storageMessage'),
                );
                return false;
            }
            return true;
        } finally {
            inFlight.current = false;
            if (mounted.current) {
                setIsPending(false);
            }
        }
    }, [t]);

    return useMemo(() => ({run, isPending}), [run, isPending]);
}
