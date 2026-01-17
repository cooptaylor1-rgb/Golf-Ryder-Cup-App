/**
 * Side Games - Extended Types
 *
 * Additional side game types for Wolf, Vegas, Hammer, and more.
 */

import type { UUID, ISODateString, Player, HoleResult } from './models';

// ============================================
// EXTENDED SIDE GAME TYPES
// ============================================

export type ExtendedSideGameType =
    | 'wolf'
    | 'vegas'
    | 'hammer'
    | 'bloodsome'
    | 'round_robin'
    | 'best_ball'
    | 'shamble'
    | 'stableford_team';

// ============================================
// WOLF
// ============================================

export interface WolfGame {
    id: UUID;
    tripId: UUID;
    sessionId?: UUID;
    name: string;
    buyIn: number;
    playerIds: UUID[]; // Must be exactly 4 players
    rotation: UUID[]; // Wolf order rotation
    currentWolfIndex: number;
    pigAvailable: boolean; // Can someone "pig" (lone wolf)?
    holeResults: WolfHoleResult[];
    standings: WolfStanding[];
    status: 'setup' | 'active' | 'completed';
    createdAt: ISODateString;
}

export interface WolfHoleResult {
    holeNumber: number;
    wolfId: UUID;
    partnerId?: UUID; // null = lone wolf
    isLoneWolf: boolean;
    isPig: boolean; // Triple points lone wolf
    teamAScore: number;
    teamBScore: number;
    winner: 'wolf' | 'pack' | 'push';
    pointsExchanged: number;
}

export interface WolfStanding {
    playerId: UUID;
    points: number;
    wolvesPlayed: number;
    loneWolfAttempts: number;
    loneWolfWins: number;
    pigAttempts: number;
    pigWins: number;
}

export interface WolfConfig {
    pointsPerHole: number;
    loneWolfMultiplier: number; // Usually 2x
    pigMultiplier: number; // Usually 3x
    blindWolfBonus: number; // Bonus if wolf picks before seeing tee shots
}

// ============================================
// VEGAS
// ============================================

export interface VegasGame {
    id: UUID;
    tripId: UUID;
    sessionId?: UUID;
    name: string;
    pointValue: number; // $ per point
    team1PlayerIds: UUID[]; // 2 players
    team2PlayerIds: UUID[]; // 2 players
    flipEnabled: boolean; // Bad hole flips digits
    flipThreshold: number; // e.g., 8+ flips
    holeResults: VegasHoleResult[];
    runningScore: number; // + = team1 winning
    status: 'setup' | 'active' | 'completed';
    createdAt: ISODateString;
}

export interface VegasHoleResult {
    holeNumber: number;
    team1Scores: [number, number]; // Both player scores
    team2Scores: [number, number];
    team1Vegas: number; // Combined vegas number (lower first)
    team2Vegas: number;
    team1Flipped: boolean;
    team2Flipped: boolean;
    pointDiff: number; // Positive = team1 advantage
    runningTotal: number;
}

export interface VegasConfig {
    flipEnabled: boolean;
    flipThreshold: number;
    maxPointsPerHole?: number; // Cap on hole value
    birdieBonus?: number; // Extra for birdies
}

// ============================================
// HAMMER
// ============================================

export interface HammerGame {
    id: UUID;
    tripId: UUID;
    sessionId?: UUID;
    name: string;
    startingValue: number;
    team1PlayerIds: UUID[];
    team2PlayerIds: UUID[];
    currentValue: number;
    hammerHolder: 'team1' | 'team2';
    maxHammers: number; // Max re-hammers per hole
    holeResults: HammerHoleResult[];
    runningScore: number;
    status: 'setup' | 'active' | 'completed';
    createdAt: ISODateString;
}

export interface HammerHoleResult {
    holeNumber: number;
    hammerActions: HammerAction[];
    finalValue: number;
    winner: 'team1' | 'team2' | 'halved';
    pointsWon: number;
}

export interface HammerAction {
    team: 'team1' | 'team2';
    action: 'hammer' | 'accept' | 'decline';
    valueAfter: number;
    timestamp: ISODateString;
}

export interface HammerConfig {
    startingValue: number;
    valueMultiplier: number; // Usually 2x per hammer
    maxHammersPerHole: number;
    autoAcceptFinal: boolean; // Last hammer must be accepted
}

// ============================================
// BLOODSOME (aka Bloodsome Foursome)
// ============================================

export interface BloodsomeGame {
    id: UUID;
    tripId: UUID;
    sessionId?: UUID;
    name: string;
    buyIn: number;
    team1PlayerIds: UUID[];
    team2PlayerIds: UUID[];
    // Each team picks worst shot of opponents
    holeResults: BloodsomeHoleResult[];
    runningScore: number;
    status: 'setup' | 'active' | 'completed';
    createdAt: ISODateString;
}

export interface BloodsomeHoleResult {
    holeNumber: number;
    team1ChosenShots: string[]; // Description of opponent shots chosen
    team2ChosenShots: string[];
    team1Score: number;
    team2Score: number;
    winner: 'team1' | 'team2' | 'halved';
}

// ============================================
// NASSAU WITH AUTO-PRESS
// ============================================

export interface NassauEnhanced {
    id: UUID;
    tripId: UUID;
    sessionId?: UUID;
    name: string;
    baseValue: number;
    team1PlayerIds: UUID[];
    team2PlayerIds: UUID[];
    autoPressEnabled: boolean;
    autoPressThreshold: number; // Press when down by X holes
    maxPresses: number;
    presses: NassauPress[];
    frontNine: NassauNineResult;
    backNine: NassauNineResult;
    overall: NassauOverallResult;
    status: 'setup' | 'active' | 'completed';
    createdAt: ISODateString;
}

export interface NassauPress {
    id: UUID;
    nine: 'front' | 'back' | 'overall';
    startHole: number;
    pressedByTeam: 'team1' | 'team2';
    value: number;
    winner?: 'team1' | 'team2' | 'push';
    isAuto: boolean; // Auto-press vs manual
}

export interface NassauNineResult {
    team1Holes: number;
    team2Holes: number;
    halvesCount: number;
    winner?: 'team1' | 'team2' | 'push';
    presses: NassauPress[];
}

export interface NassauOverallResult {
    team1Total: number;
    team2Total: number;
    winner?: 'team1' | 'team2' | 'push';
}

// ============================================
// SETTLEMENT CALCULATION
// ============================================

export interface SettlementTransaction {
    id: UUID;
    tripId: UUID;
    fromPlayerId: UUID;
    fromPlayerName: string;
    toPlayerId: UUID;
    toPlayerName: string;
    amount: number;
    gameBreakdown: SettlementGameItem[];
    status: 'pending' | 'completed' | 'disputed';
    venmoLink?: string;
    paypalLink?: string;
    zelleInfo?: string;
    settledAt?: ISODateString;
    createdAt: ISODateString;
}

export interface SettlementGameItem {
    gameName: string;
    gameType: string;
    amount: number;
    description: string;
}

export interface TripSettlementSummary {
    tripId: UUID;
    totalPot: number;
    transactions: SettlementTransaction[];
    playerBalances: PlayerSettlementBalance[];
    isFullySettled: boolean;
    generatedAt: ISODateString;
}

export interface PlayerSettlementBalance {
    playerId: UUID;
    playerName: string;
    netAmount: number; // Positive = owed, Negative = owes
    breakdown: {
        skins: number;
        nassau: number;
        wolf: number;
        vegas: number;
        hammer: number;
        sideBets: number;
        other: number;
    };
    owesTo: { playerId: UUID; playerName: string; amount: number }[];
    owedBy: { playerId: UUID; playerName: string; amount: number }[];
}
