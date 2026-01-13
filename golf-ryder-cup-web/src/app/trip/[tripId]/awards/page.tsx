'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, Medal, TrendingUp, Users, RefreshCw, Share2 } from 'lucide-react';
import { computeTripRecords } from '@/lib/services/awardsService';
import type { TripRecords, Award, PlayerStats } from '@/lib/types/awards';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores';

function AwardCard({ award }: { award: Award }) {
    if (!award.winner) {
        return (
            <div className="bg-gray-50 rounded-lg p-4 opacity-60">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{award.icon}</span>
                    <div>
                        <div className="font-medium text-gray-600">{award.title}</div>
                        <div className="text-sm text-gray-400">No winner yet</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{award.icon}</span>
                    <div>
                        <div className="font-semibold text-gray-900">{award.title}</div>
                        <div className="text-sm text-gray-500">{award.description}</div>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {/* Winner */}
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                        award.winner.teamColor === 'usa' ? 'bg-team-usa' : 'bg-team-europe'
                    )}>
                        1
                    </div>
                    <div className="flex-1">
                        <div className="font-medium">{award.winner.playerName}</div>
                        <div className="text-sm text-gray-500">{award.winner.value}</div>
                    </div>
                    <Medal className="w-6 h-6 text-yellow-500" />
                </div>

                {/* Runner-up */}
                {award.runnerUp && (
                    <div className="flex items-center gap-3 opacity-75">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                            award.runnerUp.teamColor === 'usa' ? 'bg-team-usa' : 'bg-team-europe'
                        )}>
                            2
                        </div>
                        <div className="flex-1">
                            <div className="font-medium">{award.runnerUp.playerName}</div>
                            <div className="text-sm text-gray-500">{award.runnerUp.value}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function PlayerStatsCard({ stats, rank }: { stats: PlayerStats; rank: number }) {
    return (
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                rank <= 3 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
            )}>
                {rank}
            </div>
            <div className={cn(
                "w-3 h-8 rounded-full",
                stats.teamColor === 'usa' ? 'bg-team-usa' : 'bg-team-europe'
            )} />
            <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{stats.playerName}</div>
                <div className="text-xs text-gray-500">
                    {stats.wins}W - {stats.losses}L - {stats.halves}H
                </div>
            </div>
            <div className="text-right">
                <div className="font-bold text-lg">{stats.points}</div>
                <div className="text-xs text-gray-500">pts</div>
            </div>
        </div>
    );
}

export default function AwardsPage() {
    const params = useParams();
    const tripId = params.tripId as string;
    const { showToast } = useUIStore();

    const [records, setRecords] = useState<TripRecords | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'awards' | 'leaderboard'>('awards');

    const loadRecords = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await computeTripRecords(tripId);
            setRecords(data);
        } catch (err) {
            setError(`Failed to load records: ${err}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRecords();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tripId]);

    const handleShare = async () => {
        if (!records) return;

        const lines = [
            `🏆 ${records.tripName} - Awards`,
            '',
            `📊 Final Score: USA ${records.finalScore.usa} - ${records.finalScore.europe} Europe`,
            records.winner !== 'halved'
                ? `🎉 ${records.winner === 'usa' ? 'Team USA' : 'Team Europe'} WINS!`
                : '🤝 Match TIED!',
            '',
            '🏅 Award Winners:',
            ...records.awards
                .filter(a => a.winner)
                .map(a => `${a.icon} ${a.title}: ${a.winner!.playerName}`),
            '',
            '#RyderCup #GolfTrip',
        ];

        try {
            await navigator.clipboard.writeText(lines.join('\n'));
            showToast('success', 'Copied to clipboard!');
        } catch {
            showToast('error', 'Failed to copy');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-augusta-green text-white px-4 py-4 shadow-lg">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={`/trip/${tripId}`} className="p-2 hover:bg-white/10 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-lg font-semibold">Awards & Records</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadRecords}
                            disabled={isLoading}
                            className="p-2 hover:bg-white/10 rounded-lg"
                        >
                            <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
                        </button>
                        <button
                            onClick={handleShare}
                            disabled={!records}
                            className="p-2 hover:bg-white/10 rounded-lg"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-6">
                {isLoading && (
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl h-32 animate-pulse" />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-800 p-4 rounded-xl">
                        {error}
                    </div>
                )}

                {records && !isLoading && (
                    <>
                        {/* Final Score Card */}
                        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 text-center">
                                <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                                    Final Score
                                </div>
                                <div className="flex items-center justify-center gap-6">
                                    <div className="text-center">
                                        <div className={cn(
                                            "text-5xl font-bold",
                                            records.finalScore.usa > records.finalScore.europe && "text-team-usa"
                                        )}>
                                            {records.finalScore.usa}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">USA</div>
                                    </div>
                                    <div className="text-2xl text-gray-300">—</div>
                                    <div className="text-center">
                                        <div className={cn(
                                            "text-5xl font-bold",
                                            records.finalScore.europe > records.finalScore.usa && "text-team-europe"
                                        )}>
                                            {records.finalScore.europe}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">Europe</div>
                                    </div>
                                </div>
                                {records.winner !== 'halved' && (
                                    <div className={cn(
                                        "mt-4 py-2 px-4 rounded-full inline-flex items-center gap-2",
                                        records.winner === 'usa' ? "bg-team-usa/10 text-team-usa" : "bg-team-europe/10 text-team-europe"
                                    )}>
                                        <Trophy className="w-5 h-5" />
                                        <span className="font-semibold">
                                            {records.winner === 'usa' ? 'Team USA' : 'Team Europe'} Wins!
                                        </span>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Tab Navigation */}
                        <div className="flex bg-white rounded-xl p-1 shadow-sm">
                            <button
                                onClick={() => setActiveTab('awards')}
                                className={cn(
                                    "flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
                                    activeTab === 'awards'
                                        ? "bg-augusta-green text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                <Trophy className="w-4 h-4" />
                                Awards
                            </button>
                            <button
                                onClick={() => setActiveTab('leaderboard')}
                                className={cn(
                                    "flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
                                    activeTab === 'leaderboard'
                                        ? "bg-augusta-green text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                <TrendingUp className="w-4 h-4" />
                                Leaderboard
                            </button>
                        </div>

                        {/* Awards Tab */}
                        {activeTab === 'awards' && (
                            <div className="space-y-4">
                                {records.awards.map((award) => (
                                    <AwardCard key={award.type} award={award} />
                                ))}
                            </div>
                        )}

                        {/* Leaderboard Tab */}
                        {activeTab === 'leaderboard' && (
                            <div className="space-y-2">
                                {records.playerStats
                                    .sort((a, b) => b.points - a.points || b.winPercentage - a.winPercentage)
                                    .map((stats, index) => (
                                        <PlayerStatsCard
                                            key={stats.playerId}
                                            stats={stats}
                                            rank={index + 1}
                                        />
                                    ))}

                                {records.playerStats.length === 0 && (
                                    <div className="bg-white rounded-xl p-8 text-center">
                                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p className="text-gray-500">No player stats yet</p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Complete some matches to see the leaderboard
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Biggest Session Win */}
                        {records.biggestSessionWin && (
                            <section className="bg-white rounded-xl shadow-sm p-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                        records.biggestSessionWin.winningTeam === 'usa'
                                            ? "bg-team-usa/10 text-team-usa"
                                            : "bg-team-europe/10 text-team-europe"
                                    )}>
                                        🔥
                                    </div>
                                    <div>
                                        <div className="font-medium">Biggest Session Win</div>
                                        <div className="text-sm text-gray-500">
                                            {records.biggestSessionWin.winningTeam === 'usa' ? 'USA' : 'Europe'} won{' '}
                                            {records.biggestSessionWin.sessionType} by {records.biggestSessionWin.margin} points
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
