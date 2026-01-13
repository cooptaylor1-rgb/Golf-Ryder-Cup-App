/**
 * Export Types
 *
 * Types for trip export/import functionality.
 */

import type {
    Trip,
    Player,
    Team,
    TeamMember,
    RyderCupSession,
    Match,
    HoleResult,
    Course,
    TeeSet,
    AuditLogEntry,
} from './models';

/**
 * Export schema version for future compatibility
 */
export const EXPORT_SCHEMA_VERSION = 1;

/**
 * Complete trip export structure
 */
export interface TripExport {
    /** Schema version for compatibility */
    schemaVersion: number;
    /** Export timestamp */
    exportedAt: string;
    /** App version that created this export */
    appVersion: string;
    /** Main trip data */
    trip: Trip;
    /** All players in the trip */
    players: Player[];
    /** Teams */
    teams: Team[];
    /** Team membership links */
    teamMembers: TeamMember[];
    /** Sessions */
    sessions: RyderCupSession[];
    /** All matches */
    matches: Match[];
    /** Hole-by-hole results */
    holeResults: HoleResult[];
    /** Courses used */
    courses: Course[];
    /** Tee sets */
    teeSets: TeeSet[];
    /** Audit log (optional, can be large) */
    auditLog?: AuditLogEntry[];
}

/**
 * Import result with statistics
 */
export interface ImportResult {
    success: boolean;
    tripId: string;
    tripName: string;
    stats: {
        players: number;
        teams: number;
        sessions: number;
        matches: number;
        holeResults: number;
        courses: number;
    };
    errors: string[];
}

/**
 * Trip summary for quick text sharing
 */
export interface TripSummary {
    name: string;
    dates: string;
    location?: string;
    teams: {
        name: string;
        points: number;
        players: string[];
    }[];
    sessions: {
        name: string;
        status: string;
        teamAPoints: number;
        teamBPoints: number;
    }[];
    standings: string;
    totalMatches: number;
    completedMatches: number;
}
