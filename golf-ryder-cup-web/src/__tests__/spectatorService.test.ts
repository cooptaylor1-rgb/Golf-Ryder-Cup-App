/**
 * Spectator Service Tests
 *
 * Tests for spectator mode, live updates, and read-only views.
 */

import { describe, it, expect } from 'vitest';
import {
    formatSpectatorMatchScore,
    calculateProjectedScore,
    generateScoreboardText,
} from '@/lib/services/spectatorService';
import type { SpectatorView } from '@/lib/types/captain';

describe('Spectator Service', () => {
    describe('formatSpectatorMatchScore', () => {
        it('should format score when halved', () => {
            const score = formatSpectatorMatchScore('halved', 0, 0);
            expect(score).toContain('Halved');
        });

        it('should format score when team A is up', () => {
            const score = formatSpectatorMatchScore('teamA', 3, 6);
            expect(score).toContain('3');
            expect(score).toContain('UP');
        });

        it('should format score when team B is up', () => {
            const score = formatSpectatorMatchScore('teamB', 2, 4);
            expect(score).toContain('2');
        });

        it('should format closed out match', () => {
            const score = formatSpectatorMatchScore('teamA', 4, 2);
            expect(score).toContain('4&2');
        });
    });

    describe('calculateProjectedScore', () => {
        it('should project final score with no live matches', () => {
            const projected = calculateProjectedScore(10, 8, []);
            expect(projected.teamA).toBe(10);
            expect(projected.teamB).toBe(8);
        });
    });

    describe('generateScoreboardText', () => {
        it('should generate shareable text', () => {
            const view: SpectatorView = {
                tripId: 'trip-1',
                tripName: 'Annual Ryder Cup 2026',
                teamA: { name: 'Team USA', points: 10, color: 'red' },
                teamB: { name: 'Team Europe', points: 8, color: 'blue' },
                currentStatus: 'live',
                liveMatches: [],
                recentResults: [],
                pointsToWin: 14.5,
            };

            const text = generateScoreboardText(view);

            expect(text).toBeDefined();
            expect(typeof text).toBe('string');
            expect(text.length).toBeGreaterThan(0);
            expect(text).toContain('Team USA');
            expect(text).toContain('Team Europe');
        });
    });
});
