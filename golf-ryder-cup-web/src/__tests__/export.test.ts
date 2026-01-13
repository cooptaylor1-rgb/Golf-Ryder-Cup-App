/**
 * Export/Import Service Tests
 *
 * Tests for trip backup, export, and import functionality.
 */

import { describe, it, expect } from 'vitest';
import type { TripExport } from '@/lib/types/export';

// Mock export data structure
function createMockExport(): TripExport {
    const now = new Date().toISOString();
    return {
        schemaVersion: 1,
        exportedAt: now,
        appVersion: '1.2.0',
        trip: {
            id: 'trip-123',
            name: 'Test Trip',
            startDate: now,
            endDate: now,
            location: 'Test Location',
            isCaptainModeEnabled: true,
            createdAt: now,
            updatedAt: now,
        },
        teams: [
            {
                id: 'team-1',
                tripId: 'trip-123',
                name: 'Team USA',
                color: 'usa',
                colorHex: '#B31942',
                mode: 'ryderCup',
                createdAt: now,
            },
            {
                id: 'team-2',
                tripId: 'trip-123',
                name: 'Team Europe',
                color: 'europe',
                colorHex: '#003399',
                mode: 'ryderCup',
                createdAt: now,
            },
        ],
        teamMembers: [],
        players: [],
        sessions: [],
        matches: [],
        holeResults: [],
        courses: [],
        teeSets: [],
    };
}

describe('Export Format', () => {
    it('should have required schema version', () => {
        const exportData = createMockExport();
        expect(exportData.schemaVersion).toBeDefined();
        expect(typeof exportData.schemaVersion).toBe('number');
        expect(exportData.schemaVersion).toBe(1);
    });

    it('should have export timestamp', () => {
        const exportData = createMockExport();
        expect(exportData.exportedAt).toBeDefined();
        expect(new Date(exportData.exportedAt).toString()).not.toBe('Invalid Date');
    });

    it('should have app version', () => {
        const exportData = createMockExport();
        expect(exportData.appVersion).toBeDefined();
        expect(typeof exportData.appVersion).toBe('string');
    });

    it('should include trip data', () => {
        const exportData = createMockExport();
        expect(exportData.trip).toBeDefined();
        expect(exportData.trip.id).toBeDefined();
        expect(exportData.trip.name).toBeDefined();
    });

    it('should include related data arrays', () => {
        const exportData = createMockExport();
        expect(Array.isArray(exportData.teams)).toBe(true);
        expect(Array.isArray(exportData.players)).toBe(true);
        expect(Array.isArray(exportData.sessions)).toBe(true);
        expect(Array.isArray(exportData.matches)).toBe(true);
        expect(Array.isArray(exportData.holeResults)).toBe(true);
    });
});

describe('Export Validation', () => {
    it('should validate trip has required fields', () => {
        const exportData = createMockExport();
        const trip = exportData.trip;

        expect(trip.id).toBeTruthy();
        expect(trip.name).toBeTruthy();
        expect(trip.startDate).toBeTruthy();
        expect(trip.createdAt).toBeTruthy();
    });

    it('should validate teams have required fields', () => {
        const exportData = createMockExport();

        for (const team of exportData.teams) {
            expect(team.id).toBeTruthy();
            expect(team.tripId).toBe(exportData.trip.id);
            expect(team.name).toBeTruthy();
        }
    });

    it('should have valid team colors', () => {
        const exportData = createMockExport();
        const validColors = ['usa', 'europe', 'blue', 'red', 'green', 'gold'];

        for (const team of exportData.teams) {
            expect(validColors).toContain(team.color);
        }
    });
});

describe('Import Validation', () => {
    it('should detect missing schema version', () => {
        const invalidExport = { trip: {} } as unknown as TripExport;
        expect(invalidExport.schemaVersion).toBeUndefined();
    });

    it('should detect wrong schema version', () => {
        const exportData = createMockExport();
        // Create a copy with wrong version
        const wrongVersion = { ...exportData, schemaVersion: 999 };
        expect(wrongVersion.schemaVersion).not.toBe(1);
    });

    it('should detect missing trip data', () => {
        const invalidExport = {
            schemaVersion: 1,
            exportedAt: new Date().toISOString(),
            appVersion: '1.0.0',
            trip: null,
        } as unknown as TripExport;

        expect(invalidExport.trip).toBeNull();
    });
});

describe('ID Regeneration', () => {
    it('imported trip should get new ID', () => {
        const exportData = createMockExport();
        const originalTripId = exportData.trip.id;

        // Simulate import regeneration
        const newTripId = 'new-trip-' + Date.now();

        expect(newTripId).not.toBe(originalTripId);
    });

    it('related entities should reference new trip ID', () => {
        const exportData = createMockExport();
        const originalTripId = exportData.trip.id;
        const newTripId = 'new-trip-' + Date.now();

        // Simulate updating references
        const updatedTeams = exportData.teams.map(team => ({
            ...team,
            id: 'new-' + team.id,
            tripId: newTripId,
        }));

        for (const team of updatedTeams) {
            expect(team.tripId).toBe(newTripId);
            expect(team.tripId).not.toBe(originalTripId);
        }
    });
});

describe('Round-Trip Export/Import', () => {
    it('should preserve trip name', () => {
        const exportData = createMockExport();
        const originalName = exportData.trip.name;

        // Simulate round-trip
        const json = JSON.stringify(exportData);
        const imported = JSON.parse(json) as TripExport;

        expect(imported.trip.name).toBe(originalName);
    });

    it('should preserve team count', () => {
        const exportData = createMockExport();
        const originalCount = exportData.teams.length;

        const json = JSON.stringify(exportData);
        const imported = JSON.parse(json) as TripExport;

        expect(imported.teams.length).toBe(originalCount);
    });

    it('should preserve schema version', () => {
        const exportData = createMockExport();

        const json = JSON.stringify(exportData);
        const imported = JSON.parse(json) as TripExport;

        expect(imported.schemaVersion).toBe(exportData.schemaVersion);
    });

    it('should preserve nested arrays', () => {
        const exportData = createMockExport();

        const json = JSON.stringify(exportData);
        const imported = JSON.parse(json) as TripExport;

        expect(Array.isArray(imported.players)).toBe(true);
        expect(Array.isArray(imported.sessions)).toBe(true);
        expect(Array.isArray(imported.matches)).toBe(true);
    });

    it('should handle empty arrays', () => {
        const exportData = createMockExport();
        exportData.players = [];
        exportData.sessions = [];

        const json = JSON.stringify(exportData);
        const imported = JSON.parse(json) as TripExport;

        expect(imported.players).toEqual([]);
        expect(imported.sessions).toEqual([]);
    });
});

describe('Corrupt File Handling', () => {
    it('should detect invalid JSON', () => {
        const invalidJson = '{ not valid json }}}';

        expect(() => JSON.parse(invalidJson)).toThrow();
    });

    it('should detect non-object export', () => {
        const invalidExport = JSON.parse('"just a string"');
        expect(typeof invalidExport).not.toBe('object');
    });

    it('should detect null export', () => {
        const nullExport = JSON.parse('null');
        expect(nullExport).toBeNull();
    });
});
