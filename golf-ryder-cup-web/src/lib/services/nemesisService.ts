/**
 * Nemesis Tracking Service
 *
 * Tracks head-to-head records between players across all trips.
 * Identifies each player's nemesis (worst record against) and best matchup.
 */

import { db } from '@/lib/db';
import type { UUID, Match, Player } from '@/lib/types/models';
import type { HeadToHeadRecord, NemesisStats } from '@/lib/types/social';

// ============================================
// HEAD-TO-HEAD RECORD MANAGEMENT
// ============================================

/**
 * Get or create a head-to-head record between two players
 * Player order is normalized (smaller ID first) to prevent duplicates
 */
export async function getOrCreateRecord(
    player1Id: UUID,
    player2Id: UUID
): Promise<HeadToHeadRecord> {
    // Normalize player order
    const [p1, p2] = [player1Id, player2Id].sort();

    const existing = await db.headToHeadRecords
        .where('[player1Id+player2Id]')
        .equals([p1, p2])
        .first();

    if (existing) return existing;

    const record: HeadToHeadRecord = {
        id: crypto.randomUUID(),
        player1Id: p1,
        player2Id: p2,
        player1Wins: 0,
        player2Wins: 0,
        halves: 0,
        totalMatches: 0,
        singlesRecord: { p1: 0, p2: 0, halves: 0 },
        foursomesRecord: { p1: 0, p2: 0, halves: 0 },
        fourballRecord: { p1: 0, p2: 0, halves: 0 },
        recentResults: [],
        currentStreak: { player: null, count: 0 },
        longestStreak: { player: 'p1', count: 0 },
        biggestWinMargin: { player: 'p1', margin: '0' },
        updatedAt: new Date().toISOString(),
    };

    await db.headToHeadRecords.add(record);
    return record;
}

/**
 * Record a match result between two players
 */
export async function recordMatchResult(
    player1Id: UUID,
    player2Id: UUID,
    winner: 'p1' | 'p2' | 'halve',
    matchFormat: 'singles' | 'foursomes' | 'fourball',
    margin?: string,
    tripId?: UUID
): Promise<HeadToHeadRecord> {
    // Normalize player order
    const [normalizedP1, normalizedP2] = [player1Id, player2Id].sort();

    // Adjust winner based on normalization
    let adjustedWinner = winner;
    if (normalizedP1 !== player1Id && winner !== 'halve') {
        adjustedWinner = winner === 'p1' ? 'p2' : 'p1';
    }

    const record = await getOrCreateRecord(normalizedP1, normalizedP2);

    // Update overall record
    record.totalMatches++;
    if (adjustedWinner === 'p1') {
        record.player1Wins++;
    } else if (adjustedWinner === 'p2') {
        record.player2Wins++;
    } else {
        record.halves++;
    }

    // Update format-specific record
    const formatRecord = matchFormat === 'singles'
        ? record.singlesRecord
        : matchFormat === 'foursomes'
            ? record.foursomesRecord
            : record.fourballRecord;

    if (adjustedWinner === 'p1') {
        formatRecord.p1++;
    } else if (adjustedWinner === 'p2') {
        formatRecord.p2++;
    } else {
        formatRecord.halves++;
    }

    // Update recent results (keep last 5)
    record.recentResults.push(adjustedWinner);
    if (record.recentResults.length > 5) {
        record.recentResults.shift();
    }

    // Update current streak
    if (adjustedWinner === 'halve') {
        // Halves reset the streak
        record.currentStreak = { player: null, count: 0 };
    } else {
        if (record.currentStreak.player === adjustedWinner) {
            record.currentStreak.count++;
        } else {
            record.currentStreak = { player: adjustedWinner, count: 1 };
        }

        // Update longest streak
        if (record.currentStreak.count > record.longestStreak.count) {
            record.longestStreak = {
                player: adjustedWinner,
                count: record.currentStreak.count,
            };
        }
    }

    // Update biggest win margin
    if (margin && adjustedWinner !== 'halve') {
        const currentMarginNum = parseMargin(record.biggestWinMargin.margin);
        const newMarginNum = parseMargin(margin);
        if (newMarginNum > currentMarginNum) {
            record.biggestWinMargin = {
                player: adjustedWinner,
                margin,
            };
        }
    }

    // Update last match info
    record.lastMatchDate = new Date().toISOString();
    record.lastMatchTripId = tripId;
    record.lastMatchResult = adjustedWinner;
    record.updatedAt = new Date().toISOString();

    await db.headToHeadRecords.put(record);
    return record;
}

/**
 * Parse match margin string to numeric value for comparison
 */
function parseMargin(margin: string): number {
    // Handle formats like "3&2", "5&4", "2 up", "1 hole"
    const match = margin.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

/**
 * Get head-to-head record between two players
 */
export async function getRecord(
    player1Id: UUID,
    player2Id: UUID
): Promise<HeadToHeadRecord | undefined> {
    const [p1, p2] = [player1Id, player2Id].sort();
    return db.headToHeadRecords
        .where('[player1Id+player2Id]')
        .equals([p1, p2])
        .first();
}

/**
 * Get all records for a player
 */
export async function getPlayerRecords(playerId: UUID): Promise<HeadToHeadRecord[]> {
    const records = await db.headToHeadRecords.toArray();
    return records.filter(r => r.player1Id === playerId || r.player2Id === playerId);
}

// ============================================
// NEMESIS ANALYSIS
// ============================================

/**
 * Calculate nemesis stats for a player
 */
export async function calculateNemesisStats(
    playerId: UUID,
    _players: Player[]
): Promise<NemesisStats> {
    const records = await getPlayerRecords(playerId);

    if (records.length === 0) {
        return {
            playerId,
            totalOpponents: 0,
            overallRecord: { wins: 0, losses: 0, halves: 0 },
        };
    }

    let overallWins = 0;
    let overallLosses = 0;
    let overallHalves = 0;
    let nemesisId: UUID | undefined;
    let nemesisRecord: string | undefined;
    let worstWinPercentage = 1.0;
    let bestMatchupId: UUID | undefined;
    let bestMatchupRecord: string | undefined;
    let bestWinPercentage = 0;

    for (const record of records) {
        const isP1 = record.player1Id === playerId;
        const opponentId = isP1 ? record.player2Id : record.player1Id;
        const wins = isP1 ? record.player1Wins : record.player2Wins;
        const losses = isP1 ? record.player2Wins : record.player1Wins;
        const halves = record.halves;

        overallWins += wins;
        overallLosses += losses;
        overallHalves += halves;

        const totalGames = wins + losses + halves;
        if (totalGames === 0) continue;

        const winPercentage = wins / totalGames;
        const recordString = `${wins}-${losses}-${halves}`;

        // Find nemesis (worst record against)
        if (winPercentage < worstWinPercentage && totalGames >= 2) {
            worstWinPercentage = winPercentage;
            nemesisId = opponentId;
            nemesisRecord = recordString;
        }

        // Find best matchup
        if (winPercentage > bestWinPercentage && totalGames >= 2) {
            bestWinPercentage = winPercentage;
            bestMatchupId = opponentId;
            bestMatchupRecord = recordString;
        }
    }

    return {
        playerId,
        nemesisId,
        nemesisRecord,
        bestMatchupId,
        bestMatchupRecord,
        totalOpponents: records.length,
        overallRecord: {
            wins: overallWins,
            losses: overallLosses,
            halves: overallHalves,
        },
    };
}

/**
 * Get formatted head-to-head summary
 */
export function formatHeadToHead(
    record: HeadToHeadRecord,
    player1: Player,
    player2: Player,
    perspectivePlayerId: UUID
): {
    myWins: number;
    theirWins: number;
    halves: number;
    formattedRecord: string;
    isWinning: boolean;
    isLosing: boolean;
    streak: string;
    formats: {
        singles: string;
        foursomes: string;
        fourball: string;
    };
} {
    const isP1 = record.player1Id === perspectivePlayerId;
    const myWins = isP1 ? record.player1Wins : record.player2Wins;
    const theirWins = isP1 ? record.player2Wins : record.player1Wins;
    const halves = record.halves;

    const formattedRecord = `${myWins}-${theirWins}-${halves}`;
    const isWinning = myWins > theirWins;
    const isLosing = theirWins > myWins;

    // Format streak
    let streak = '';
    if (record.currentStreak.count > 0 && record.currentStreak.player) {
        const isMyStreak = (record.currentStreak.player === 'p1') === isP1;
        streak = isMyStreak
            ? `${record.currentStreak.count}W streak`
            : `${record.currentStreak.count}L streak`;
    }

    // Format records
    const formatFormatRecord = (r: { p1: number; p2: number; halves: number }) => {
        const w = isP1 ? r.p1 : r.p2;
        const l = isP1 ? r.p2 : r.p1;
        return `${w}-${l}-${r.halves}`;
    };

    return {
        myWins,
        theirWins,
        halves,
        formattedRecord,
        isWinning,
        isLosing,
        streak,
        formats: {
            singles: formatFormatRecord(record.singlesRecord),
            foursomes: formatFormatRecord(record.foursomesRecord),
            fourball: formatFormatRecord(record.fourballRecord),
        },
    };
}

// ============================================
// LEADERBOARDS & RANKINGS
// ============================================

/**
 * Get rivalry leaderboard
 */
export async function getRivalryLeaderboard(
    players: Player[]
): Promise<{
    playerId: UUID;
    playerName: string;
    wins: number;
    losses: number;
    halves: number;
    winPercentage: number;
    nemesisName?: string;
}[]> {
    const leaderboard = await Promise.all(
        players.map(async player => {
            const stats = await calculateNemesisStats(player.id, players);
            const nemesis = stats.nemesisId
                ? players.find(p => p.id === stats.nemesisId)
                : undefined;

            const total = stats.overallRecord.wins + stats.overallRecord.losses + stats.overallRecord.halves;
            const winPercentage = total > 0 ? stats.overallRecord.wins / total : 0;

            return {
                playerId: player.id,
                playerName: `${player.firstName} ${player.lastName}`,
                wins: stats.overallRecord.wins,
                losses: stats.overallRecord.losses,
                halves: stats.overallRecord.halves,
                winPercentage,
                nemesisName: nemesis ? `${nemesis.firstName} ${nemesis.lastName}` : undefined,
            };
        })
    );

    return leaderboard.sort((a, b) => b.winPercentage - a.winPercentage);
}

/**
 * Get all rivalries sorted by number of matches
 */
export async function getMostPlayedRivalries(
    players: Player[],
    limit: number = 10
): Promise<{
    player1Name: string;
    player2Name: string;
    record: HeadToHeadRecord;
    totalMatches: number;
}[]> {
    const records = await db.headToHeadRecords.toArray();

    const playersMap = new Map(players.map(p => [p.id, p]));

    return records
        .map(record => {
            const p1 = playersMap.get(record.player1Id);
            const p2 = playersMap.get(record.player2Id);
            return {
                player1Name: p1 ? `${p1.firstName} ${p1.lastName}` : 'Unknown',
                player2Name: p2 ? `${p2.firstName} ${p2.lastName}` : 'Unknown',
                record,
                totalMatches: record.totalMatches,
            };
        })
        .sort((a, b) => b.totalMatches - a.totalMatches)
        .slice(0, limit);
}

/**
 * Get hottest rivalries (closest records)
 */
export async function getClosestRivalries(
    players: Player[],
    limit: number = 10
): Promise<{
    player1Name: string;
    player2Name: string;
    record: HeadToHeadRecord;
    differential: number;
}[]> {
    const records = await db.headToHeadRecords.toArray();

    const playersMap = new Map(players.map(p => [p.id, p]));

    return records
        .filter(r => r.totalMatches >= 3) // Minimum games for meaningful rivalry
        .map(record => {
            const p1 = playersMap.get(record.player1Id);
            const p2 = playersMap.get(record.player2Id);
            return {
                player1Name: p1 ? `${p1.firstName} ${p1.lastName}` : 'Unknown',
                player2Name: p2 ? `${p2.firstName} ${p2.lastName}` : 'Unknown',
                record,
                differential: Math.abs(record.player1Wins - record.player2Wins),
            };
        })
        .sort((a, b) => a.differential - b.differential)
        .slice(0, limit);
}

// ============================================
// BATCH UPDATES FROM MATCHES
// ============================================

/**
 * Update head-to-head records from a completed match
 */
export async function updateFromMatch(
    match: Match,
    tripId: UUID,
    sessionType?: 'singles' | 'foursomes' | 'fourball' | 'shamble' | 'scramble'
): Promise<void> {
    if (match.status !== 'completed') return;

    // Determine format from session type or player count
    let format: 'singles' | 'foursomes' | 'fourball';
    if (sessionType === 'singles' || (match.teamAPlayerIds.length === 1 && match.teamBPlayerIds.length === 1)) {
        format = 'singles';
    } else if (sessionType === 'foursomes') {
        format = 'foursomes';
    } else {
        format = 'fourball';
    }

    // Determine winner based on result
    let winner: 'p1' | 'p2' | 'halve' = 'halve';
    if (match.result === 'teamAWin' || (match.margin > 0 && match.teamAPlayerIds.length > 0)) {
        winner = 'p1';
    } else if (match.result === 'teamBWin' || (match.margin < 0 && match.teamBPlayerIds.length > 0)) {
        winner = 'p2';
    } else if (match.result === 'halved') {
        winner = 'halve';
    }

    // For singles, record between the two players
    if (format === 'singles' && match.teamAPlayerIds.length === 1 && match.teamBPlayerIds.length === 1) {
        const marginStr = match.holesRemaining > 0
            ? `${match.margin}&${match.holesRemaining}`
            : `${match.margin} up`;
        await recordMatchResult(
            match.teamAPlayerIds[0],
            match.teamBPlayerIds[0],
            winner,
            'singles',
            marginStr,
            tripId
        );
    } else {
        // For team formats, record between all combinations
        const marginStr = match.holesRemaining > 0
            ? `${match.margin}&${match.holesRemaining}`
            : `${match.margin} up`;
        for (const p1Id of match.teamAPlayerIds) {
            for (const p2Id of match.teamBPlayerIds) {
                await recordMatchResult(p1Id, p2Id, winner, format, marginStr, tripId);
            }
        }
    }
}

/**
 * Rebuild all head-to-head records from match history
 */
export async function rebuildAllRecords(): Promise<void> {
    // Clear existing records
    await db.headToHeadRecords.clear();

    // Get all completed matches
    const matches = await db.matches.where('status').equals('completed').toArray();

    // Group by trip for tripId
    const trips = await db.trips.toArray();
    const matchTripMap = new Map<UUID, UUID>();

    for (const trip of trips) {
        const sessions = await db.sessions.where('tripId').equals(trip.id).toArray();
        for (const session of sessions) {
            const sessionMatches = await db.matches.where('sessionId').equals(session.id).toArray();
            for (const match of sessionMatches) {
                matchTripMap.set(match.id, trip.id);
            }
        }
    }

    // Process each match
    for (const match of matches) {
        const tripId = matchTripMap.get(match.id);
        if (tripId) {
            await updateFromMatch(match, tripId);
        }
    }
}
