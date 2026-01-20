/**
 * Draft Service Tests
 *
 * Tests for draft configuration, snake order, and draft state management.
 */

import { describe, it, expect } from 'vitest';
import {
    createDraftConfig,
    getPickOrderForRound,
    initializeDraftState,
    getCurrentPicker,
    getDraftSummary,
    calculateTeamHandicapTotal,
} from '@/lib/services/draftService';
import type { Player } from '@/lib/types/models';

// Mock player generator
function createMockPlayer(id: string, name: string, handicap: number = 10): Player {
    return {
        id,
        tripId: 'trip-1',
        firstName: name.split(' ')[0],
        lastName: name.split(' ')[1] || '',
        handicapIndex: handicap,
        createdAt: new Date().toISOString(),
    };
}

describe('Draft Service', () => {
    describe('createDraftConfig', () => {
        it('should create a valid snake draft config', () => {
            const config = createDraftConfig(
                'trip-1',
                'snake',
                ['captain-1', 'captain-2'],
                8
            );

            expect(config.id).toBeDefined();
            expect(config.tripId).toBe('trip-1');
            expect(config.type).toBe('snake');
            expect(config.status).toBe('setup');
            expect(config.roundCount).toBe(4); // 8 players / 2 captains
            expect(config.draftOrder.length).toBe(2);
            expect(config.pickTimeSeconds).toBe(60);
        });

        it('should create auction draft with budget', () => {
            const config = createDraftConfig(
                'trip-1',
                'auction',
                ['captain-1', 'captain-2'],
                8,
                { auctionBudget: 200, pickTimeSeconds: 45 }
            );

            expect(config.type).toBe('auction');
            expect(config.auctionBudget).toBe(200);
            expect(config.pickTimeSeconds).toBe(45);
        });

        it('should randomize draft order', () => {
            const orders: string[][] = [];
            for (let i = 0; i < 10; i++) {
                const config = createDraftConfig(
                    'trip-1',
                    'snake',
                    ['c1', 'c2', 'c3', 'c4'],
                    12
                );
                orders.push(config.draftOrder);
            }
            const uniqueOrders = new Set(orders.map(o => o.join(',')));
            expect(uniqueOrders.size).toBeGreaterThanOrEqual(1);
        });
    });

    describe('getPickOrderForRound', () => {
        it('should return normal order for odd rounds', () => {
            const config = createDraftConfig('trip-1', 'snake', ['c1', 'c2', 'c3'], 9);
            config.draftOrder = ['c1', 'c2', 'c3'];

            expect(getPickOrderForRound(config, 1)).toEqual(['c1', 'c2', 'c3']);
            expect(getPickOrderForRound(config, 3)).toEqual(['c1', 'c2', 'c3']);
        });

        it('should reverse order for even rounds (snake)', () => {
            const config = createDraftConfig('trip-1', 'snake', ['c1', 'c2', 'c3'], 9);
            config.draftOrder = ['c1', 'c2', 'c3'];

            expect(getPickOrderForRound(config, 2)).toEqual(['c3', 'c2', 'c1']);
            expect(getPickOrderForRound(config, 4)).toEqual(['c3', 'c2', 'c1']);
        });
    });

    describe('initializeDraftState', () => {
        it('should initialize state with all players available', () => {
            const config = createDraftConfig('trip-1', 'snake', ['c1', 'c2'], 4);
            config.draftOrder = ['c1', 'c2'];

            const players: Player[] = [
                createMockPlayer('p1', 'Tiger Woods', 5),
                createMockPlayer('p2', 'Phil Mickelson', 8),
                createMockPlayer('p3', 'Jordan Spieth', 4),
                createMockPlayer('p4', 'Rory McIlroy', 3),
            ];

            const state = initializeDraftState(config, players, { teamA: 'team-a', teamB: 'team-b' });

            expect(state.config).toBe(config);
            expect(state.currentRound).toBe(1);
            expect(state.currentPick).toBe(1);
            expect(state.availablePlayers.length).toBe(4);
            expect(state.picks.length).toBe(0);
        });
    });

    describe('getCurrentPicker', () => {
        it('should return the current captain picking', () => {
            const config = createDraftConfig('trip-1', 'snake', ['c1', 'c2'], 4);
            config.draftOrder = ['c1', 'c2'];

            const players = [
                createMockPlayer('p1', 'Tiger Woods'),
                createMockPlayer('p2', 'Phil Mickelson'),
            ];

            const state = initializeDraftState(config, players, { teamA: 'team-a', teamB: 'team-b' });
            const picker = getCurrentPicker(state);

            expect(picker.captainId).toBe('c1');
            expect(picker.teamId).toBe('A');
            expect(picker.pickNumber).toBe(1);
        });
    });

    describe('calculateTeamHandicapTotal', () => {
        it('should calculate total handicap correctly', () => {
            const players = [
                createMockPlayer('p1', 'Tiger Woods', 5.2),
                createMockPlayer('p2', 'Phil Mickelson', 8.1),
                createMockPlayer('p3', 'Jordan Spieth', 4.7),
            ];

            const total = calculateTeamHandicapTotal(players);
            expect(total).toBeCloseTo(18, 1);
        });

        it('should return 0 for empty team', () => {
            const total = calculateTeamHandicapTotal([]);
            expect(total).toBe(0);
        });
    });

    describe('getDraftSummary', () => {
        it('should return summary with correct counts', () => {
            const config = createDraftConfig('trip-1', 'snake', ['c1', 'c2'], 4);
            config.draftOrder = ['c1', 'c2'];

            const players = [
                createMockPlayer('p1', 'Tiger Woods', 5),
                createMockPlayer('p2', 'Phil Mickelson', 8),
            ];

            const state = initializeDraftState(config, players, { teamA: 'team-a', teamB: 'team-b' });
            const summary = getDraftSummary(state);

            expect(summary.totalPicks).toBe(0);
            expect(summary.remainingPlayers).toBe(2);
            expect(summary.teamACount).toBe(0);
            expect(summary.teamBCount).toBe(0);
        });
    });
});
