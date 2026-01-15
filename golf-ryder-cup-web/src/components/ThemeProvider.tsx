'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/lib/stores';

/**
 * ThemeProvider
 *
 * Applies the theme class to the document on mount and when theme changes.
 * Must be rendered client-side to access document.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme, setTheme } = useUIStore();

    // Apply theme on mount and when it changes
    useEffect(() => {
        // Re-apply theme to ensure classes are set (handles hydration)
        setTheme(theme);
    }, [theme, setTheme]);

    return <>{children}</>;
}

export default ThemeProvider;
