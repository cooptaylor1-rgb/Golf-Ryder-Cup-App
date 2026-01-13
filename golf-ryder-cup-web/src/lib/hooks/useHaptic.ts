/**
 * useHaptic Hook — Premium Haptic Feedback System
 *
 * World-class tactile feedback for the best golf app experience.
 * Respects user preferences and device capabilities.
 * Provides nuanced patterns for different interaction contexts.
 */

'use client';

import { useCallback, useMemo } from 'react';
import { useUIStore } from '../stores';

type HapticType =
    | 'light'           // Subtle tap - selections, toggles
    | 'medium'          // Standard tap - button presses
    | 'heavy'           // Strong tap - important actions
    | 'success'         // Celebration - score recorded, match won
    | 'error'           // Alert - validation failed
    | 'warning'         // Caution - destructive action
    | 'selection'       // Quick tick - list selection
    | 'scorePoint'      // Point scored - satisfying feedback
    | 'scoreWin'        // Match won - victory celebration
    | 'scoreTie'        // Halved hole - neutral feedback
    | 'navigation'      // Page change - subtle transition
    | 'pull'            // Pull to refresh - resistance feel
    | 'snap'            // Snapping into place
    | 'delete';         // Destructive action

/**
 * Premium haptic feedback hook
 * Returns both trigger function and pattern presets
 */
export function useHaptic() {
    const { scoringPreferences } = useUIStore();

    // Haptic patterns designed for premium feel
    // Times in ms, arrays are [vibrate, pause, vibrate, ...]
    const patterns = useMemo<Record<HapticType, number | number[]>>(() => ({
        // Basic interactions
        light: 8,
        medium: 20,
        heavy: 40,

        // Feedback states
        success: [15, 60, 15],              // Quick double-tap
        error: [40, 30, 40, 30, 40],        // Urgent triple-tap
        warning: [25, 50, 25],              // Attention double-tap

        // Selection & navigation
        selection: 6,                        // Barely perceptible tick
        navigation: 12,                      // Subtle page transition

        // Golf-specific scoring feedback
        scorePoint: [20, 40, 30],           // Satisfying point scored
        scoreWin: [15, 50, 25, 50, 35],     // Victory celebration pattern
        scoreTie: 15,                        // Neutral halved

        // Gesture feedback
        pull: [5, 10, 8, 10, 10],           // Resistance feel
        snap: 25,                            // Snapping into place
        delete: [30, 20, 50],               // Destructive confirmation
    }), []);

    const trigger = useCallback((type: HapticType = 'light') => {
        if (!scoringPreferences.hapticFeedback) return;

        // Check for Vibration API support
        if (!('vibrate' in navigator)) return;

        try {
            navigator.vibrate(patterns[type]);
        } catch {
            // Ignore errors - haptic is optional enhancement
        }
    }, [scoringPreferences.hapticFeedback, patterns]);

    // Convenience methods for common interactions
    const haptics = useMemo(() => ({
        trigger,
        // Quick access methods
        tap: () => trigger('light'),
        press: () => trigger('medium'),
        impact: () => trigger('heavy'),
        success: () => trigger('success'),
        error: () => trigger('error'),
        warning: () => trigger('warning'),
        select: () => trigger('selection'),
        navigate: () => trigger('navigation'),
        // Golf scoring
        scorePoint: () => trigger('scorePoint'),
        scoreWin: () => trigger('scoreWin'),
        scoreTie: () => trigger('scoreTie'),
        // Gestures
        pull: () => trigger('pull'),
        snap: () => trigger('snap'),
        delete: () => trigger('delete'),
    }), [trigger]);

    return haptics;
}

export default useHaptic;
