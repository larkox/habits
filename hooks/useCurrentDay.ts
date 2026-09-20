import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { getStartOfDay } from '@/utils/time';

/** Refresh date-based reminders at local midnight and after returning to the app. */
export default function useCurrentDay() {
    const [today, setToday] = useState(getStartOfDay);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        const refresh = () => {
            clearTimeout(timer);
            setToday(getStartOfDay());
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            timer = setTimeout(refresh, Math.max(1, midnight.getTime() - Date.now()));
        };
        refresh();
        const subscription = AppState.addEventListener('change', state => {
            if (state === 'active') {
                refresh();
            }
        });
        return () => {
            clearTimeout(timer);
            subscription.remove();
        };
    }, []);

    return today;
}
