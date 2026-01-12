'use client';

/**
 * Service Worker Registration Utility
 *
 * Handles SW registration, updates, and provides hooks
 * for the UI to show update prompts.
 */

export type SWUpdateCallback = (registration: ServiceWorkerRegistration) => void;

interface SWConfig {
    onUpdate?: SWUpdateCallback;
    onSuccess?: SWUpdateCallback;
    onOffline?: () => void;
    onOnline?: () => void;
}

let swRegistration: ServiceWorkerRegistration | null = null;
let updateCallback: SWUpdateCallback | null = null;

/**
 * Register the service worker
 */
export async function registerServiceWorker(config?: SWConfig): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        console.log('[PWA] Service workers not supported');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
        });

        swRegistration = registration;
        console.log('[PWA] Service worker registered:', registration.scope);

        // Check for updates periodically (every hour)
        setInterval(() => {
            registration.update();
        }, 60 * 60 * 1000);

        // Handle updates
        registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                        // New update available
                        console.log('[PWA] New content available');
                        if (config?.onUpdate) {
                            config.onUpdate(registration);
                        }
                        if (updateCallback) {
                            updateCallback(registration);
                        }
                    } else {
                        // Content cached for offline use
                        console.log('[PWA] Content cached for offline use');
                        if (config?.onSuccess) {
                            config.onSuccess(registration);
                        }
                    }
                }
            };
        };

        // Setup online/offline handlers
        if (config?.onOffline || config?.onOnline) {
            window.addEventListener('online', () => config.onOnline?.());
            window.addEventListener('offline', () => config.onOffline?.());
        }

        return registration;
    } catch (error) {
        console.error('[PWA] Service worker registration failed:', error);
        return null;
    }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.unregister();
        console.log('[PWA] Service worker unregistered');
        return true;
    } catch (error) {
        console.error('[PWA] Service worker unregister failed:', error);
        return false;
    }
}

/**
 * Skip waiting and activate the new service worker
 */
export function skipWaiting(): void {
    if (swRegistration?.waiting) {
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
}

/**
 * Set a callback for when an update is available
 */
export function onSWUpdate(callback: SWUpdateCallback): void {
    updateCallback = callback;
}

/**
 * Check if the app is currently online
 */
export function isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
}

/**
 * Check if the app is running as an installed PWA
 */
export function isInstalledPWA(): boolean {
    if (typeof window === 'undefined') return false;

    // Check display-mode media query
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // iOS Safari specific
    const isIOSStandalone = (window.navigator as any).standalone === true;

    return isStandalone || isIOSStandalone;
}

/**
 * Get the service worker registration
 */
export function getRegistration(): ServiceWorkerRegistration | null {
    return swRegistration;
}
