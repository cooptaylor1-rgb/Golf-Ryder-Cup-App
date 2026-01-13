/**
 * Trip Templates - Types and Data
 *
 * Pre-configured trip templates for quick setup.
 * Templates generate sessions, matches, and default settings.
 */

import type { SessionType } from './models';

/**
 * Template session configuration
 */
export interface TemplateSession {
    dayOffset: number; // 0 = first day, 1 = second day, etc.
    timeSlot: 'AM' | 'PM';
    sessionType: SessionType;
    matchCount: number;
    name?: string;
}

/**
 * Trip template definition
 */
export interface TripTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    days: number;
    sessions: TemplateSession[];
    defaultPointsToWin: number;
    playersPerTeam: number;
    features: string[];
}

/**
 * Pre-defined trip templates
 */
export const TRIP_TEMPLATES: TripTemplate[] = [
    {
        id: 'classic-ryder-cup',
        name: 'Classic Ryder Cup',
        description: '3-day tournament with foursomes, fourball, and singles. The full experience.',
        icon: '🏆',
        days: 3,
        playersPerTeam: 6,
        defaultPointsToWin: 14.5,
        features: ['6 sessions', '28 total points', 'Full Ryder Cup format'],
        sessions: [
            // Day 1
            { dayOffset: 0, timeSlot: 'AM', sessionType: 'foursomes', matchCount: 4, name: 'Friday AM Foursomes' },
            { dayOffset: 0, timeSlot: 'PM', sessionType: 'fourball', matchCount: 4, name: 'Friday PM Fourball' },
            // Day 2
            { dayOffset: 1, timeSlot: 'AM', sessionType: 'foursomes', matchCount: 4, name: 'Saturday AM Foursomes' },
            { dayOffset: 1, timeSlot: 'PM', sessionType: 'fourball', matchCount: 4, name: 'Saturday PM Fourball' },
            // Day 3
            { dayOffset: 2, timeSlot: 'AM', sessionType: 'singles', matchCount: 12, name: 'Sunday Singles' },
        ],
    },
    {
        id: 'weekend-warrior',
        name: 'Weekend Warrior',
        description: '2-day tournament perfect for a weekend getaway. Fast and furious.',
        icon: '⚡',
        days: 2,
        playersPerTeam: 4,
        defaultPointsToWin: 9.5,
        features: ['4 sessions', '18 total points', 'Compact format'],
        sessions: [
            // Day 1
            { dayOffset: 0, timeSlot: 'AM', sessionType: 'fourball', matchCount: 2, name: 'Saturday AM Fourball' },
            { dayOffset: 0, timeSlot: 'PM', sessionType: 'foursomes', matchCount: 2, name: 'Saturday PM Foursomes' },
            // Day 2
            { dayOffset: 1, timeSlot: 'AM', sessionType: 'fourball', matchCount: 2, name: 'Sunday AM Fourball' },
            { dayOffset: 1, timeSlot: 'PM', sessionType: 'singles', matchCount: 8, name: 'Sunday Singles' },
        ],
    },
    {
        id: 'singles-showdown',
        name: 'Singles Showdown',
        description: 'One day of head-to-head matches. Pure 1v1 competition.',
        icon: '🎯',
        days: 1,
        playersPerTeam: 6,
        defaultPointsToWin: 6.5,
        features: ['2 sessions', '12 total points', 'All singles'],
        sessions: [
            { dayOffset: 0, timeSlot: 'AM', sessionType: 'singles', matchCount: 6, name: 'Morning Singles' },
            { dayOffset: 0, timeSlot: 'PM', sessionType: 'singles', matchCount: 6, name: 'Afternoon Singles' },
        ],
    },
    {
        id: 'partners-paradise',
        name: 'Partners Paradise',
        description: 'Team format only - foursomes and fourball. Great for partner chemistry.',
        icon: '🤝',
        days: 2,
        playersPerTeam: 4,
        defaultPointsToWin: 8.5,
        features: ['4 sessions', '16 total points', 'No singles'],
        sessions: [
            { dayOffset: 0, timeSlot: 'AM', sessionType: 'fourball', matchCount: 2, name: 'Day 1 AM Fourball' },
            { dayOffset: 0, timeSlot: 'PM', sessionType: 'foursomes', matchCount: 2, name: 'Day 1 PM Foursomes' },
            { dayOffset: 1, timeSlot: 'AM', sessionType: 'foursomes', matchCount: 2, name: 'Day 2 AM Foursomes' },
            { dayOffset: 1, timeSlot: 'PM', sessionType: 'fourball', matchCount: 2, name: 'Day 2 PM Fourball' },
        ],
    },
    {
        id: '9-hole-popup',
        name: '9-Hole Pop-Up',
        description: 'Quick 9-hole format. Perfect for after work or limited time.',
        icon: '🌅',
        days: 1,
        playersPerTeam: 4,
        defaultPointsToWin: 4.5,
        features: ['2 sessions', '8 total points', 'Quick play'],
        sessions: [
            { dayOffset: 0, timeSlot: 'AM', sessionType: 'fourball', matchCount: 2, name: 'Fourball' },
            { dayOffset: 0, timeSlot: 'PM', sessionType: 'singles', matchCount: 4, name: 'Singles' },
        ],
    },
    {
        id: 'custom',
        name: 'Custom Setup',
        description: 'Start from scratch and build your own format.',
        icon: '✏️',
        days: 1,
        playersPerTeam: 4,
        defaultPointsToWin: 14.5,
        features: ['Fully customizable', 'Add sessions manually'],
        sessions: [],
    },
];

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): TripTemplate | undefined {
    return TRIP_TEMPLATES.find(t => t.id === id);
}

/**
 * Calculate total points available in a template
 */
export function calculateTemplatePoints(template: TripTemplate): number {
    return template.sessions.reduce((total, session) => total + session.matchCount, 0);
}
