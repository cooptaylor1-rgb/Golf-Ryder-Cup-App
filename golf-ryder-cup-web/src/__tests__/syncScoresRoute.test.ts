/**
 * Score Sync API Route Tests
 *
 * Tests for the /api/sync/scores endpoint that handles
 * offline scoring event synchronization.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/sync/scores/route';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            upsert: vi.fn().mockResolvedValue({ error: null }),
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
            }),
        })),
    })),
}));

// Helper to create mock NextRequest with JSON body
function createMockRequest(body: unknown): NextRequest {
    return new NextRequest('http://localhost:3000/api/sync/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

describe('Score Sync API Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset environment variables for each test
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
        vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    describe('Payload Validation', () => {
        it('rejects missing matchId', async () => {
            const req = createMockRequest({ events: [] });
            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('matchId');
        });

        it('rejects missing events array', async () => {
            const req = createMockRequest({ matchId: 'match-123' });
            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('events');
        });

        it('rejects non-array events', async () => {
            const req = createMockRequest({
                matchId: 'match-123',
                events: 'not-an-array',
            });
            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(400);
        });
    });

    describe('Local-Only Mode (No Supabase)', () => {
        it('acknowledges events when no Supabase configured', async () => {
            const req = createMockRequest({
                matchId: 'match-123',
                events: [
                    { id: 'evt-1', type: 'SCORE', holeNumber: 1, data: { winner: 'teamA' }, timestamp: new Date().toISOString() },
                    { id: 'evt-2', type: 'SCORE', holeNumber: 2, data: { winner: 'halved' }, timestamp: new Date().toISOString() },
                ],
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.mode).toBe('local-only');
            expect(data.synced).toBe(2);
        });
    });

    describe('With Supabase Configured', () => {
        beforeEach(() => {
            vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
            vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');
        });

        it('syncs events to database successfully', async () => {
            const req = createMockRequest({
                matchId: 'match-123',
                events: [
                    { id: 'evt-1', type: 'SCORE', holeNumber: 1, data: { winner: 'teamA' }, timestamp: new Date().toISOString() },
                ],
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('processes multiple events', async () => {
            const req = createMockRequest({
                matchId: 'match-123',
                events: [
                    { id: 'evt-1', type: 'SCORE', holeNumber: 1, data: { winner: 'teamA' }, timestamp: new Date().toISOString() },
                    { id: 'evt-2', type: 'SCORE', holeNumber: 2, data: { winner: 'teamB' }, timestamp: new Date().toISOString() },
                    { id: 'evt-3', type: 'UNDO', holeNumber: 2, data: {}, timestamp: new Date().toISOString() },
                ],
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('handles empty events array', async () => {
            const req = createMockRequest({
                matchId: 'match-123',
                events: [],
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.synced).toBe(0);
        });

        it('returns 500 for malformed JSON', async () => {
            const req = new NextRequest('http://localhost:3000/api/sync/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: '{ invalid json }',
            });

            const response = await POST(req);
            expect(response.status).toBe(500);
        });
    });
});
