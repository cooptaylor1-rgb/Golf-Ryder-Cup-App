/**
 * Awards & Records Types
 *
 * P2.4 - Awards & Records
 * Computed awards for MVP, best winning margin, most halves, etc.
 */

export type AwardType =
    | 'mvp'
    | 'best-record'
    | 'most-wins'
    | 'most-halves'
    | 'biggest-win'
    | 'iron-man'
    | 'clutch-performer'
    | 'streak-master';

export interface PlayerStats {
    playerId: string;
    playerName: string;
    teamColor: 'usa' | 'europe';
    matchesPlayed: number;
    wins: number;
    losses: number;
    halves: number;
    points: number;
    winPercentage: number;
    biggestWin: number; // e.g., 5&4 = 5
    holesWon: number;
    holesLost: number;
    holesHalved: number;
    currentStreak: number; // positive = wins, negative = losses
    longestWinStreak: number;
}

export interface Award {
    type: AwardType;
    title: string;
    description: string;
    icon: string;
    winner?: {
        playerId: string;
        playerName: string;
        teamColor: 'usa' | 'europe';
        value: string | number;
    };
    runnerUp?: {
        playerId: string;
        playerName: string;
        teamColor: 'usa' | 'europe';
        value: string | number;
    };
}

export interface TripRecords {
    tripId: string;
    tripName: string;
    computedAt: string;

    // Team Records
    finalScore: { usa: number; europe: number };
    winner: 'usa' | 'europe' | 'halved';
    biggestSessionWin: {
        sessionType: string;
        margin: number;
        winningTeam: 'usa' | 'europe';
    } | null;

    // Individual Awards
    awards: Award[];

    // All Player Stats
    playerStats: PlayerStats[];
}

export const AWARD_DEFINITIONS: Record<AwardType, { title: string; description: string; icon: string }> = {
    'mvp': {
        title: 'MVP',
        description: 'Most valuable player based on points earned',
        icon: '🏆',
    },
    'best-record': {
        title: 'Best Record',
        description: 'Highest win percentage (min. 2 matches)',
        icon: '📊',
    },
    'most-wins': {
        title: 'Match Winner',
        description: 'Most individual match victories',
        icon: '🥇',
    },
    'most-halves': {
        title: 'The Diplomat',
        description: 'Most halved matches',
        icon: '🤝',
    },
    'biggest-win': {
        title: 'Dominant Force',
        description: 'Largest winning margin in a single match',
        icon: '💪',
    },
    'iron-man': {
        title: 'Iron Man',
        description: 'Most matches played',
        icon: '🦾',
    },
    'clutch-performer': {
        title: 'Clutch Performer',
        description: 'Won the most holes while down in match',
        icon: '🎯',
    },
    'streak-master': {
        title: 'Streak Master',
        description: 'Longest winning streak',
        icon: '🔥',
    },
};
