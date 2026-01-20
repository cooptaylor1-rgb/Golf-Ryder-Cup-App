/**
 * Keyboard Shortcuts Provider
 *
 * Wraps the app to enable global keyboard shortcuts.
 */
'use client';

import { ReactNode } from 'react';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';

interface KeyboardShortcutsProviderProps {
    children?: ReactNode;
}

function KeyboardShortcutsEnabler() {
    // Initialize global keyboard shortcuts
    useKeyboardShortcuts({ enabled: true });
    return null;
}

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
    return (
        <>
            <KeyboardShortcutsEnabler />
            <KeyboardShortcutsHelp />
            {children}
        </>
    );
}
