'use client';

import { useEffect, useRef } from 'react';
import { initCourseSyncService } from '@/lib/services/courseLibrarySyncService';

/**
 * Initializes the course library sync service on app startup.
 * This component should be placed in the app layout.
 * Properly cleans up on unmount to prevent memory leaks.
 */
export function CourseSyncInitializer() {
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        // Initialize the sync service and store cleanup function
        cleanupRef.current = initCourseSyncService();

        // Cleanup on unmount
        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }
        };
    }, []);

    // This component doesn't render anything
    return null;
}
