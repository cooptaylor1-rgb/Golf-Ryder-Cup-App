/**
 * Onboarding Hook
 *
 * Manages first-run experience state via localStorage.
 * Tracks whether user has completed onboarding.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_KEY = 'golf-ryder-cup-onboarding-complete';
const ONBOARDING_VERSION = '1.0'; // Increment to re-show onboarding after major updates

interface OnboardingState {
    hasCompletedOnboarding: boolean;
    isLoading: boolean;
    showOnboarding: boolean;
    completeOnboarding: () => void;
    resetOnboarding: () => void;
}

export function useOnboarding(): OnboardingState {
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true); // Default true to prevent flash
    const [isLoading, setIsLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Check localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(ONBOARDING_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Check version to potentially re-show onboarding after major updates
                if (parsed.version === ONBOARDING_VERSION) {
                    setHasCompletedOnboarding(true);
                    setShowOnboarding(false);
                } else {
                    // New version, show onboarding again
                    setHasCompletedOnboarding(false);
                    setShowOnboarding(true);
                }
            } else {
                // First time user
                setHasCompletedOnboarding(false);
                setShowOnboarding(true);
            }
        } catch {
            // If localStorage fails, don't show onboarding
            setHasCompletedOnboarding(true);
            setShowOnboarding(false);
        }
        setIsLoading(false);
    }, []);

    const completeOnboarding = useCallback(() => {
        try {
            localStorage.setItem(
                ONBOARDING_KEY,
                JSON.stringify({
                    version: ONBOARDING_VERSION,
                    completedAt: new Date().toISOString(),
                })
            );
        } catch {
            // Silently fail if localStorage is unavailable
        }
        setHasCompletedOnboarding(true);
        setShowOnboarding(false);
    }, []);

    const resetOnboarding = useCallback(() => {
        try {
            localStorage.removeItem(ONBOARDING_KEY);
        } catch {
            // Silently fail
        }
        setHasCompletedOnboarding(false);
        setShowOnboarding(true);
    }, []);

    return {
        hasCompletedOnboarding,
        isLoading,
        showOnboarding,
        completeOnboarding,
        resetOnboarding,
    };
}

export default useOnboarding;
