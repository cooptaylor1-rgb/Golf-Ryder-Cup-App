'use client';

import React, { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Upload, Share2, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import {
    exportTripToFile,
    importTripFromFile,
    shareTripSummary,
} from '@/lib/services/exportImportService';
import { db } from '@/lib/db';
import { useUIStore } from '@/lib/stores';

export default function TripSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const tripId = params.tripId as string;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useUIStore();

    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [importResult, setImportResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportTripToFile(tripId);
            showToast('success', 'Trip exported');
        } catch {
            showToast('error', 'Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setImportResult(null);

        try {
            const result = await importTripFromFile(file);
            if (result.success) {
                setImportResult({
                    success: true,
                    message: `Imported "${result.tripName}" with ${result.stats.players} players, ${result.stats.matches} matches`,
                });
                showToast('success', 'Trip imported');
            } else {
                setImportResult({
                    success: false,
                    message: 'Import failed. Check file format.',
                });
                showToast('error', 'Import failed');
            }
        } catch {
            setImportResult({
                success: false,
                message: 'Could not read file',
            });
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        try {
            await shareTripSummary(tripId);
            showToast('success', 'Summary copied to clipboard');
        } catch {
            showToast('error', 'Could not copy summary');
        } finally {
            setIsSharing(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            // Delete all related data
            const sessions = await db.sessions.where('tripId').equals(tripId).toArray();
            const sessionIds = sessions.map((s) => s.id);
            const matches = await db.matches.where('sessionId').anyOf(sessionIds).toArray();
            const matchIds = matches.map((m) => m.id);

            await db.transaction(
                'rw',
                [db.trips, db.teams, db.teamMembers, db.sessions, db.matches, db.holeResults],
                async () => {
                    await db.holeResults.where('matchId').anyOf(matchIds).delete();
                    await db.matches.where('sessionId').anyOf(sessionIds).delete();
                    await db.sessions.where('tripId').equals(tripId).delete();

                    const teams = await db.teams.where('tripId').equals(tripId).toArray();
                    const teamIds = teams.map((t) => t.id);
                    await db.teamMembers.where('teamId').anyOf(teamIds).delete();
                    await db.teams.where('tripId').equals(tripId).delete();

                    await db.trips.delete(tripId);
                }
            );

            showToast('success', 'Trip deleted');
            router.push('/');
        } catch {
            showToast('error', 'Could not delete trip');
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-augusta-green text-white px-4 py-4 shadow-lg">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <Link href={`/trip/${tripId}`} className="p-2 hover:bg-white/10 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-lg font-semibold">Trip Settings</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Backup & Export Section */}
                <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Backup & Export</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Save your trip data or share with others
                        </p>
                    </div>

                    <div className="p-4 space-y-3">
                        {/* Export Button */}
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Download className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-left flex-1">
                                <div className="font-medium text-gray-900">
                                    {isExporting ? 'Exporting...' : 'Export Trip'}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Download as JSON file for backup
                                </div>
                            </div>
                        </button>

                        {/* Import Button */}
                        <button
                            onClick={handleImportClick}
                            disabled={isImporting}
                            className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Upload className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="text-left flex-1">
                                <div className="font-medium text-gray-900">
                                    {isImporting ? 'Importing...' : 'Import Trip'}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Restore from a backup file
                                </div>
                            </div>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {/* Import Result */}
                        {importResult && (
                            <div
                                className={`flex items-start gap-3 p-3 rounded-lg ${importResult.success
                                    ? 'bg-green-50 text-green-800'
                                    : 'bg-red-50 text-red-800'
                                    }`}
                            >
                                {importResult.success ? (
                                    <CheckCircle className="w-5 h-5 mt-0.5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 mt-0.5" />
                                )}
                                <div className="text-sm">{importResult.message}</div>
                            </div>
                        )}

                        {/* Share Summary */}
                        <button
                            onClick={handleShare}
                            disabled={isSharing}
                            className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Share2 className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="text-left flex-1">
                                <div className="font-medium text-gray-900">
                                    {isSharing ? 'Copying...' : 'Share Summary'}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Copy standings to clipboard
                                </div>
                            </div>
                        </button>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="font-semibold text-red-600">Danger Zone</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Irreversible actions
                        </p>
                    </div>

                    <div className="p-4">
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-medium text-red-600">Delete Trip</div>
                                    <div className="text-sm text-red-500">
                                        Permanently remove this trip and all data
                                    </div>
                                </div>
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <div className="p-4 bg-red-50 rounded-lg">
                                    <p className="text-sm text-red-800 font-medium">
                                        Are you sure? This cannot be undone.
                                    </p>
                                    <p className="text-sm text-red-600 mt-1">
                                        All matches, scores, and settings will be permanently deleted.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Yes, Delete Trip'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
