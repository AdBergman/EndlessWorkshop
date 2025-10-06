import { useState, useRef, useCallback, useEffect } from 'react';

export const useTooltip = (hideDelay: number = 300) => {
    const [openTooltips, setOpenTooltips] = useState<Set<string>>(new Set());
    const hideTimers = useRef<Record<string, NodeJS.Timeout>>({});

    const showTooltip = useCallback((key: string) => {
        if (hideTimers.current[key]) clearTimeout(hideTimers.current[key]);
        setOpenTooltips(prev => {
            const next = new Set(prev);
            next.add(key);
            return next;
        });
    }, []);

    const hideTooltip = useCallback((key: string) => {
        hideTimers.current[key] = setTimeout(() => {
            setOpenTooltips(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        }, hideDelay);
    }, [hideDelay]);

    useEffect(() => {
        const timers = hideTimers.current;
        return () => {
            Object.values(timers).forEach(clearTimeout);
        };
    }, []);

    return { openTooltips, showTooltip, hideTooltip };
};
