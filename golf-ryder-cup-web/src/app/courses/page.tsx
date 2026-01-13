'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, MapPin, Flag, Trash2, Copy, ChevronRight } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { deleteCourseProfile } from '@/lib/services/courseLibraryService';
import type { CourseProfile, TeeSetProfile } from '@/lib/types/courseProfile';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores';

function CourseCard({
    course,
    teeSets,
    onDelete,
    onSelect,
}: {
    course: CourseProfile;
    teeSets: TeeSetProfile[];
    onDelete: (id: string) => void;
    onSelect?: (course: CourseProfile) => void;
}) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = () => {
        onDelete(course.id);
        setShowDeleteConfirm(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div
                className={cn(
                    "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                    onSelect && "active:bg-gray-100"
                )}
                onClick={() => onSelect?.(course)}
            >
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-augusta-green/10 flex items-center justify-center flex-shrink-0">
                        <Flag className="w-6 h-6 text-augusta-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{course.name}</h3>
                        {course.location && (
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">{course.location}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                            <span>{teeSets.length} tee set(s)</span>
                        </div>
                    </div>
                    {onSelect && <ChevronRight className="w-5 h-5 text-gray-400" />}
                </div>
            </div>

            {/* Tee Sets Preview */}
            {teeSets.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                        {teeSets.map((tee) => (
                            <span
                                key={tee.id}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                                style={{
                                    backgroundColor: `${tee.color || '#888'}20`,
                                    color: tee.color || '#888',
                                }}
                            >
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: tee.color || '#888' }}
                                />
                                {tee.name} • {tee.rating}/{tee.slope}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-end">
                {!showDeleteConfirm ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(true);
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                ) : (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-sm text-gray-500">Delete?</span>
                        <button
                            onClick={handleDelete}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                        >
                            No
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CourseLibraryPage() {
    const { showToast } = useUIStore();
    const [searchQuery, setSearchQuery] = useState('');

    // Load course profiles from Dexie
    const courseProfiles = useLiveQuery(
        () => db.courseProfiles.toArray(),
        [],
        []
    );

    // Load tee sets for all courses
    const teeSetProfiles = useLiveQuery(
        () => db.teeSetProfiles.toArray(),
        [],
        []
    );

    // Create a map of course ID to tee sets
    const teeSetsByCourse = new Map<string, TeeSetProfile[]>();
    teeSetProfiles.forEach(tee => {
        const existing = teeSetsByCourse.get(tee.courseProfileId) || [];
        existing.push(tee);
        teeSetsByCourse.set(tee.courseProfileId, existing);
    });

    // Filter courses by search query
    const filteredCourses = courseProfiles.filter((course) => {
        const query = searchQuery.toLowerCase();
        return (
            course.name.toLowerCase().includes(query) ||
            (course.location?.toLowerCase().includes(query) ?? false)
        );
    });

    const handleDelete = async (courseId: string) => {
        try {
            await deleteCourseProfile(courseId);
            showToast('success', 'Course deleted');
        } catch (error) {
            showToast('error', `Failed to delete: ${error}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-augusta-green text-white px-4 py-4 shadow-lg">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <Link href="/more" className="p-2 hover:bg-white/10 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-lg font-semibold flex-1">Course Library</h1>
                    <Link
                        href="/courses/new"
                        className="p-2 hover:bg-white/10 rounded-lg"
                    >
                        <Plus className="w-5 h-5" />
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-augusta-green focus:border-transparent"
                    />
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Copy className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <div className="font-medium text-blue-900">Reusable Course Profiles</div>
                            <div className="text-sm text-blue-700 mt-1">
                                Save courses to your library and quickly add them to any trip.
                                Hole pars, handicaps, and tee sets are preserved.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course List */}
                {filteredCourses.length > 0 ? (
                    <div className="space-y-3">
                        {filteredCourses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                teeSets={teeSetsByCourse.get(course.id) || []}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-8 text-center">
                        <Flag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="font-semibold text-gray-900 mb-1">
                            {searchQuery ? 'No courses found' : 'No saved courses'}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Save courses from your trips to reuse them later'}
                        </p>
                        {!searchQuery && (
                            <Link
                                href="/courses/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-augusta-green text-white rounded-lg hover:bg-augusta-green/90"
                            >
                                <Plus className="w-4 h-4" />
                                Add Course
                            </Link>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
