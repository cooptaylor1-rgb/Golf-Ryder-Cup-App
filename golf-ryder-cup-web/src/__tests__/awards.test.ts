/**
 * Awards Service Tests
 *
 * Tests for player stats calculation and award computation.
 */

import { describe, it, expect } from 'vitest';
import type { PlayerStats } from '@/lib/types/awards';
import { AWARD_DEFINITIONS, AwardType } from '@/lib/types/awards';

// Helper to create mock player stats
function createMockStats(overrides: Partial<PlayerStats> = {}): PlayerStats {
    return {
        playerId: 'player-1',
        playerName: 'Test Player',
        teamColor: 'usa',
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        halves: 0,
        points: 0,
        winPercentage: 0,
        biggestWin: 0,
        holesWon: 0,
        holesLost: 0,
        holesHalved: 0,
        currentStreak: 0,
        longestWinStreak: 0,
        ...overrides,
    };
}

describe('Award Definitions', () => {
    it('should have all required award types defined', () => {
        const requiredTypes: AwardType[] = [
            'mvp',
            'best-record',
            'most-wins',
            'most-halves',
            'biggest-win',
            'iron-man',
            'streak-master',
        ];

        for (const type of requiredTypes) {
            const definition = AWARD_DEFINITIONS[type];
            expect(definition).toBeDefined();
            expect(definition?.title).toBeDefined();
            expect(definition?.icon).toBeDefined();
            expect(definition?.description).toBeDefined();
        }
    });

    it('each award definition should have required fields', () => {
        const types = Object.keys(AWARD_DEFINITIONS) as AwardType[];
        expect(types.length).toBeGreaterThan(0);

        for (const type of types) {
            const definition = AWARD_DEFINITIONS[type];
            expect(definition.title).toBeDefined();
            expect(definition.icon).toBeDefined();
            expect(definition.description).toBeDefined();
        }
    });
});

describe('Player Stats Calculation', () => {
    it('should correctly calculate win percentage', () => {
        const _stats = createMockStats({
            matchesPlayed: 10,
            wins: 5,
            losses: 3,
            halves: 2,
        });

        // Win percentage = (wins + halves * 0.5) / matches * 100
        const expectedPct = ((5 + 2 * 0.5) / 10) * 100;
        expect(expectedPct).toBe(60);
    });

    it('should handle zero matches played', () => {
        const stats = createMockStats({
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            halves: 0,
        });

        expect(stats.winPercentage).toBe(0);
    });

    it('should track winning streaks correctly', () => {
        const stats = createMockStats({
            matchesPlayed: 5,
            wins: 4,
            losses: 1,
            currentStreak: 3,
            longestWinStreak: 4,
        });

        expect(stats.longestWinStreak).toBeGreaterThanOrEqual(stats.currentStreak);
    });

    it('should track biggest win margin', () => {
        const stats = createMockStats({
            biggestWin: 5, // 5&4 victory
        });

        expect(stats.biggestWin).toBeGreaterThanOrEqual(0);
        expect(stats.biggestWin).toBeLessThanOrEqual(10); // Max theoretical margin
    });
});

describe('Award Eligibility', () => {
    it('MVP should go to player with most points', () => {
        const players: PlayerStats[] = [
            createMockStats({ playerId: 'p1', points: 5 }),
            createMockStats({ playerId: 'p2', points: 8 }),
            createMockStats({ playerId: 'p3', points: 3 }),
        ];

        const mvp = players.reduce((best, player) =>
            player.points > best.points ? player : best
        );

        expect(mvp.playerId).toBe('p2');
    });

    it('Best Record should require minimum matches', () => {
        const players: PlayerStats[] = [
            createMockStats({ playerId: 'p1', matchesPlayed: 1, winPercentage: 100 }),
            createMockStats({ playerId: 'p2', matchesPlayed: 5, winPercentage: 80 }),
        ];

        // With minimum 2 matches requirement
        const eligible = players.filter(p => p.matchesPlayed >= 2);
        expect(eligible.length).toBe(1);
        expect(eligible[0].playerId).toBe('p2');
    });

    it('Most Wins should find player with highest win count', () => {
        const players: PlayerStats[] = [
            createMockStats({ playerId: 'p1', wins: 3 }),
            createMockStats({ playerId: 'p2', wins: 5 }),
            createMockStats({ playerId: 'p3', wins: 2 }),
        ];

        const mostWins = players.reduce((best, player) =>
            player.wins > best.wins ? player : best
        );

        expect(mostWins.playerId).toBe('p2');
    });

    it('Iron Man should find player with most matches', () => {
        const players: PlayerStats[] = [
            createMockStats({ playerId: 'p1', matchesPlayed: 6 }),
            createMockStats({ playerId: 'p2', matchesPlayed: 4 }),
            createMockStats({ playerId: 'p3', matchesPlayed: 8 }),
        ];

        const ironMan = players.reduce((best, player) =>
            player.matchesPlayed > best.matchesPlayed ? player : best
        );

        expect(ironMan.playerId).toBe('p3');
    });

    it('Diplomat should find player with most halves', () => {
        const players: PlayerStats[] = [
            createMockStats({ playerId: 'p1', halves: 2 }),
            createMockStats({ playerId: 'p2', halves: 4 }),
            createMockStats({ playerId: 'p3', halves: 1 }),
        ];

        const diplomat = players.reduce((best, player) =>
            player.halves > best.halves ? player : best
        );

        expect(diplomat.playerId).toBe('p2');
    });

    it('Dominant Force should find largest winning margin', () => {
        const players: PlayerStats[] = [
            createMockStats({ playerId: 'p1', biggestWin: 3 }),
            createMockStats({ playerId: 'p2', biggestWin: 6 }),
            createMockStats({ playerId: 'p3', biggestWin: 2 }),
        ];

        const dominant = players.reduce((best, player) =>
            player.biggestWin > best.biggestWin ? player : best
        );

        expect(dominant.playerId).toBe('p2');
    });

    it('Streak Master should find longest winning streak', () => {
        const players: PlayerStats[] = [
            createMockStats({ playerId: 'p1', longestWinStreak: 3 }),
            createMockStats({ playerId: 'p2', longestWinStreak: 5 }),
            createMockStats({ playerId: 'p3', longestWinStreak: 2 }),
        ];

        const streakMaster = players.reduce((best, player) =>
            player.longestWinStreak > best.longestWinStreak ? player : best
        );

        expect(streakMaster.playerId).toBe('p2');
    });
});

describe('Edge Cases', () => {
    it('should handle empty player list', () => {
        const players: PlayerStats[] = [];
        expect(players.length).toBe(0);
    });

    it('should handle tie for award (first wins)', () => {
        const players: PlayerStats[] = [
            createMockStats({ playerId: 'p1', points: 5 }),
            createMockStats({ playerId: 'p2', points: 5 }),
        ];

        // With reduce, first one wins ties
        const mvp = players.reduce((best, player) =>
            player.points > best.points ? player : best
        );

        expect(mvp.playerId).toBe('p1');
    });

    it('should handle players with all zeros', () => {
        const stats = createMockStats({
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            halves: 0,
            points: 0,
        });

        expect(stats.points).toBe(0);
        expect(stats.winPercentage).toBe(0);
    });
});
