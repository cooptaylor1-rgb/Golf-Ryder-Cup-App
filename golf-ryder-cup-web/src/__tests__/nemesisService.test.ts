/**
 * Nemesis Service Tests
 *
 * Tests for head-to-head tracking and rivalry statistics.
 */

import { describe, it, expect } from 'vitest';
import {
    formatHeadToHead,
} from '@/lib/services/nemesisService';
import type { HeadToHeadRecord } from '@/lib/types/social';

// Mock record generator
function createMockRecord(
    p1Wins: number = 2,
    p2Wins: number = 1,
    halves: number = 1
): HeadToHeadRecord {
    return {
        id: 'record-1',
        player1Id: 'p1',
        player2Id: 'p2',
        player1Wins: p1Wins,
        player2Wins: p2Wins,
        halves: halves,
        totalMatches: p1Wins + p2Wins + halves,
        singlesRecord: { p1: p1Wins, p2: p2Wins, halves: halves },
        foursomesRecord: { p1: 0, p2: 0, halves: 0 },
        fourballRecord: { p1: 0, p2: 0, halves: 0 },
        recentResults: [],
        currentStreak: { player: 'p1', count: 2 },
        longestStreak: { player: 'p1', count: 3 },
        biggestWinMargin: { player: 'p1', margin: '5&4' },
        updatedAt: new Date().toISOString(),
    };
}

describe('Nemesis Service', () => {
    describe('formatHeadToHead', () => {
        it('should format head-to-head record for display', () => {
            const record = createMockRecord(3, 1, 1);
            const player1 = { id: 'p1', firstName: 'Tiger', lastName: 'Woods' };
            const player2 = { id: 'p2', firstName: 'Phil', lastName: 'Mickelson' };

            // Note: formatHeadToHead takes 4 args - record, player1, player2, perspectivePlayerId
            const formatted = formatHeadToHead(record, player1, player2, 'p1');

            expect(formatted).toBeDefined();
            expect(formatted.formattedRecord).toBeDefined();
            expect(formatted.myWins).toBe(3);
            expect(formatted.theirWins).toBe(1);
        });

        it('should indicate leader correctly', () => {
            const record = createMockRecord(4, 1, 0);
            const player1 = { id: 'p1', firstName: 'Tiger', lastName: 'Woods' };
            const player2 = { id: 'p2', firstName: 'Phil', lastName: 'Mickelson' };

            const formatted = formatHeadToHead(record, player1, player2, 'p1');

            expect(formatted.isWinning).toBe(true);
            expect(formatted.isLosing).toBe(false);
        });

        it('should show tied record', () => {
            const record = createMockRecord(2, 2, 1);
            const player1 = { id: 'p1', firstName: 'Tiger', lastName: 'Woods' };
            const player2 = { id: 'p2', firstName: 'Phil', lastName: 'Mickelson' };

            const formatted = formatHeadToHead(record, player1, player2, 'p1');

            expect(formatted.isWinning).toBe(false);
            expect(formatted.isLosing).toBe(false);
        });

        it('should format record string', () => {
            const record = createMockRecord(3, 2, 1);
            const player1 = { id: 'p1', firstName: 'Tiger', lastName: 'Woods' };
            const player2 = { id: 'p2', firstName: 'Phil', lastName: 'Mickelson' };

            const formatted = formatHeadToHead(record, player1, player2, 'p1');

            // Record should be from perspective of p1: 3 wins - 2 losses - 1 halve
            expect(formatted.formattedRecord).toBe('3-2-1');
        });

        it('should include streak information', () => {
            const record = createMockRecord(3, 1, 0);
            const player1 = { id: 'p1', firstName: 'Tiger', lastName: 'Woods' };
            const player2 = { id: 'p2', firstName: 'Phil', lastName: 'Mickelson' };

            const formatted = formatHeadToHead(record, player1, player2, 'p1');

            expect(formatted.streak).toBeDefined();
        });
    });
});
