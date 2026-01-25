/**
 * Course Library Search API Route Tests
 *
 * Tests for the /api/course-library/search endpoint
 * that handles course searching and selection.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/course-library/search/route';
import {
    searchCloudCourses,
    getCloudCourse,
} from '@/lib/services/courseLibrarySyncService';

// Mock the course library sync service
vi.mock('@/lib/services/courseLibrarySyncService', () => ({
    searchCloudCourses: vi.fn(),
    getCloudCourse: vi.fn(),
    incrementCourseUsage: vi.fn().mockResolvedValue(undefined),
}));

// Type the mocked functions
const mockSearchCloudCourses = searchCloudCourses as ReturnType<typeof vi.fn>;
const mockGetCloudCourse = getCloudCourse as ReturnType<typeof vi.fn>;

describe('Course Library Search API Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET - Search Courses', () => {
        it('rejects empty query', async () => {
            const req = new NextRequest('http://localhost:3000/api/course-library/search');

            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toMatch(/Invalid|required|2 characters/i);
        });

        it('rejects query shorter than 2 characters', async () => {
            const req = new NextRequest('http://localhost:3000/api/course-library/search?q=a');

            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('2 characters');
        });

        it('returns matching courses', async () => {
            mockSearchCloudCourses.mockResolvedValue([
                { id: 'course-1', name: 'Pine Valley Golf Club', location: 'New Jersey', usage_count: 50 },
                { id: 'course-2', name: 'Pinehurst No. 2', location: 'North Carolina', usage_count: 30 },
            ]);

            const req = new NextRequest('http://localhost:3000/api/course-library/search?q=Pine');

            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.results).toHaveLength(2);
            expect(data.query).toBe('Pine');
        });

        it('returns results sorted by confidence then usage', async () => {
            mockSearchCloudCourses.mockResolvedValue([
                { id: 'course-1', name: 'Augusta National', location: 'Georgia', usage_count: 100 },
                { id: 'course-2', name: 'Augusta Municipal', location: 'Georgia', usage_count: 5 },
            ]);

            const req = new NextRequest('http://localhost:3000/api/course-library/search?q=Augusta');

            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.results[0].name).toBe('Augusta National');
        });

        it('returns empty results for no matches', async () => {
            mockSearchCloudCourses.mockResolvedValue([]);

            const req = new NextRequest('http://localhost:3000/api/course-library/search?q=XYZ123');

            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.results).toHaveLength(0);
        });

        it('handles service errors', async () => {
            mockSearchCloudCourses.mockRejectedValue(new Error('Database connection failed'));

            const req = new NextRequest('http://localhost:3000/api/course-library/search?q=Test');

            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Search failed');
        });

        it('includes confidence scores in results', async () => {
            mockSearchCloudCourses.mockResolvedValue([
                { id: 'course-1', name: 'Pebble Beach', location: 'California', usage_count: 200 },
            ]);

            const req = new NextRequest('http://localhost:3000/api/course-library/search?q=Pebble');

            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.results[0]).toHaveProperty('confidence');
            expect(data.results[0].confidence).toBeGreaterThan(0);
        });
    });

    describe('POST - Get Course Details', () => {
        it('rejects missing courseId', async () => {
            const req = new NextRequest('http://localhost:3000/api/course-library/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('courseId');
        });

        it('returns course details', async () => {
            mockGetCloudCourse.mockResolvedValue({
                course: {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    name: 'Augusta National',
                    location: 'Georgia',
                },
                teeSets: [
                    { id: 'ts-1', course_library_id: '550e8400-e29b-41d4-a716-446655440000', name: 'Championship', color: 'Gold', rating: 76.2, slope: 137, par: 72, hole_handicaps: [], hole_pars: [], hole_yardages: [], total_yardage: 7000 },
                    { id: 'ts-2', course_library_id: '550e8400-e29b-41d4-a716-446655440000', name: 'Member', color: 'Blue', rating: 72.8, slope: 131, par: 72, hole_handicaps: [], hole_pars: [], hole_yardages: [], total_yardage: 6500 },
                ],
            });

            const req = new NextRequest('http://localhost:3000/api/course-library/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: '550e8400-e29b-41d4-a716-446655440000' }),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.course.name).toBe('Augusta National');
            expect(data.course.teeSets).toHaveLength(2);
        });

        it('returns 404 for non-existent course', async () => {
            mockGetCloudCourse.mockResolvedValue(null);

            const req = new NextRequest('http://localhost:3000/api/course-library/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: '550e8400-e29b-41d4-a716-446655440099' }),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.error).toContain('not found');
        });
    });
});
