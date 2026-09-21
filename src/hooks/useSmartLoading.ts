import { useEffect, useRef, useState } from 'react';

const SHOW_DELAY_MS = 500;
const MINIMUM_VISIBLE_MS = 1000;

export default function useSmartLoading(loading: boolean) {
    const [showLoader, setShowLoader] = useState(false);
    const shownAt = useRef<number | undefined>(undefined);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;

        if (loading) {
            if (!showLoader) {
                timer = setTimeout(() => {
                    shownAt.current = Date.now();
                    setShowLoader(true);
                }, SHOW_DELAY_MS);
            }
        } else if (showLoader) {
            const visibleFor = Date.now() - (shownAt.current ?? Date.now());
            const remaining = Math.max(0, MINIMUM_VISIBLE_MS - visibleFor);
            timer = setTimeout(() => {
                shownAt.current = undefined;
                setShowLoader(false);
            }, remaining);
        }

        return () => {
            if (timer !== undefined) {
                clearTimeout(timer);
            }
        };
    }, [loading, showLoader]);

    return {
        isLoading: loading || showLoader,
        showLoader,
    };
}
