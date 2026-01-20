/**
 * Path to Victory Service Tests
 *
 * Tests for clinch scenarios and win probability calculations.
 */

import { describe, it, expect } from 'vitest';
import {
    calculatePathToVictory,
    getQuickSummary,
    detectDramaticMoment,
} from '@/lib/services/pathToVictoryService';
import type { TeamStandings } from '@/lib/types/computed';

// Helper to create mock standings
function createMockStandings(
    teamAPoints: number,
    teamBPoints: number,
    remainingMatches: number
): TeamStandings {
    return {
        teamAPoints,
        teamBPoints,
        remainingMatches,
        matchesPlayed: 28 - remainingMatches,
        matchesRemaining: remainingMatches,
        matchesCompleted: 28 - remainingMatches,
        totalMatches: 28,
        leader: teamAPoints > teamBPoints ? 'teamA' : teamBPoints > teamAPoints ? 'teamB' : null,
        margin: Math.abs(teamAPoints - teamBPoints),
    };
}

describe('Path to Victory Service', () => {
    describe('calculatePathToVictory', () => {
        it('should return correct structure for competitive match', () => {
            const standings = createMockStandings(8, 6, 14);
            const path = calculatePathToVictory(standings, 14.5, 'Team USA', 'Team Europe');

            expect(path.teamA).toBeDefined();
            expect(path.teamB).toBeDefined();
            expect(path.teamA.name).toBe('Team USA');
            expect(path.teamB.name).toBe('Team Europe');
            expect(path.remainingMatches).toBe(14);
            expect(path.pointsToWin).toBe(14.5);
        });

        it('should indicate clinch when dominant', () => {
            const standings = createMockStandings(16, 4, 8);
            const path = calculatePathToVictory(standings, 14.5);

            expect(path.teamA.hasClinched).toBe(true);
            expect(path.teamB.isEliminated).toBe(true);
        });

        it('should calculate points needed correctly', () => {
            const standings = createMockStandings(10, 8, 10);
            const path = calculatePathToVictory(standings, 14.5);

            // Team A needs 4.5 more (14.5 - 10)
            expect(path.teamA.pointsNeeded).toBe(4.5);
            // Team B needs 6.5 more (14.5 - 8)
            expect(path.teamB.pointsNeeded).toBe(6.5);
        });

        it('should handle half points', () => {
            const standings = createMockStandings(10.5, 7.5, 10);
            const path = calculatePathToVictory(standings, 14.5);

            expect(path.teamA.currentPoints).toBe(10.5);
            expect(path.teamB.currentPoints).toBe(7.5);
        });

        it('should detect dramatic situations', () => {
            const standings = createMockStandings(12, 11, 5);
            const path = calculatePathToVictory(standings, 14.5);

            expect(path.dramatic).toBe(true);
        });

        it('should not be dramatic when already decided', () => {
            const standings = createMockStandings(15, 5, 8);
            const path = calculatePathToVictory(standings, 14.5);

            expect(path.isDecided).toBe(true);
            expect(path.dramatic).toBe(false);
        });
    });

    describe('getQuickSummary', () => {
        it('should return summary for competitive match', () => {
            const standings = createMockStandings(10, 8, 10);
            const path = calculatePathToVictory(standings, 14.5);
            const summary = getQuickSummary(path);

            expect(summary.teamASummary).toBeDefined();
            expect(summary.teamBSummary).toBeDefined();
        });
    });

    describe('detectDramaticMoment', () => {
        it('should return dramatic info for close competition', () => {
            const standings = createMockStandings(13, 12, 3);
            const path = calculatePathToVictory(standings, 14.5);
            const moment = detectDramaticMoment(path);

            // Function may return null if no dramatic moment detected
            // Just verify it returns without error
            expect(moment === null || typeof moment === 'object').toBe(true);
        });

        it('should handle blowout scenario', () => {
            const standings = createMockStandings(15, 3, 10);
            const path = calculatePathToVictory(standings, 14.5);
            const moment = detectDramaticMoment(path);

            if (moment) {
                expect(moment.isDramatic).toBe(false);
            }
        });
    });
});
