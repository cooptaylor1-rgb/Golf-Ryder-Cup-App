/**
 * Trip Template Service Tests
 *
 * Tests for template generation, trip duplication, and data integrity.
 */

import { describe, it, expect } from 'vitest';
import {
    TRIP_TEMPLATES,
    getTemplateById,
    calculateTemplatePoints,
} from '@/lib/types/templates';

describe('Trip Templates', () => {
    describe('TRIP_TEMPLATES', () => {
        it('should have at least 5 templates', () => {
            expect(TRIP_TEMPLATES.length).toBeGreaterThanOrEqual(5);
        });

        it('should include classic ryder cup template', () => {
            const classic = TRIP_TEMPLATES.find(t => t.id === 'classic-ryder-cup');
            expect(classic).toBeDefined();
            expect(classic?.days).toBe(3);
            expect(classic?.sessions.length).toBeGreaterThan(0);
        });

        it('should include custom template', () => {
            const custom = TRIP_TEMPLATES.find(t => t.id === 'custom');
            expect(custom).toBeDefined();
            expect(custom?.sessions.length).toBe(0); // Custom starts empty
        });

        it('each template should have required fields', () => {
            for (const template of TRIP_TEMPLATES) {
                expect(template.id).toBeDefined();
                expect(template.name).toBeDefined();
                expect(template.description).toBeDefined();
                expect(template.days).toBeGreaterThan(0);
                expect(template.playersPerTeam).toBeGreaterThan(0);
                expect(template.defaultPointsToWin).toBeGreaterThan(0);
                expect(Array.isArray(template.sessions)).toBe(true);
                expect(Array.isArray(template.features)).toBe(true);
            }
        });

        it('each template session should have valid session type', () => {
            const validTypes = ['singles', 'fourball', 'foursomes'];
            for (const template of TRIP_TEMPLATES) {
                for (const session of template.sessions) {
                    expect(validTypes).toContain(session.sessionType);
                    expect(session.dayOffset).toBeGreaterThanOrEqual(0);
                    expect(['AM', 'PM']).toContain(session.timeSlot);
                    expect(session.matchCount).toBeGreaterThan(0);
                }
            }
        });
    });

    describe('getTemplateById', () => {
        it('should return template for valid ID', () => {
            const template = getTemplateById('classic-ryder-cup');
            expect(template).toBeDefined();
            expect(template?.name).toBe('Classic Ryder Cup');
        });

        it('should return undefined for invalid ID', () => {
            const template = getTemplateById('nonexistent');
            expect(template).toBeUndefined();
        });
    });

    describe('calculateTemplatePoints', () => {
        it('should calculate total points for classic template', () => {
            const template = getTemplateById('classic-ryder-cup');
            expect(template).toBeDefined();
            if (template) {
                const points = calculateTemplatePoints(template);
                // 4+4+4+4+12 = 28 matches = 28 points
                expect(points).toBe(28);
            }
        });

        it('should return 0 for custom template', () => {
            const template = getTemplateById('custom');
            expect(template).toBeDefined();
            if (template) {
                const points = calculateTemplatePoints(template);
                expect(points).toBe(0);
            }
        });

        it('should calculate points for weekend warrior', () => {
            const template = getTemplateById('weekend-warrior');
            expect(template).toBeDefined();
            if (template) {
                const points = calculateTemplatePoints(template);
                // 2+2+2+8 = 14 matches
                expect(points).toBe(14);
            }
        });
    });

    describe('Template Determinism', () => {
        it('should always produce same result for same template', () => {
            const template1 = getTemplateById('classic-ryder-cup');
            const template2 = getTemplateById('classic-ryder-cup');

            expect(template1).toEqual(template2);
        });

        it('session day offsets should not exceed template days', () => {
            for (const template of TRIP_TEMPLATES) {
                for (const session of template.sessions) {
                    expect(session.dayOffset).toBeLessThan(template.days);
                }
            }
        });
    });
});
