'use client';

/**
 * Quick Score Modal
 *
 * A slide-up modal for quickly entering hole results without
 * navigating away from the current page. Triggered from QuickScoreFAB.
 *
 * Features:
 * - Simple 3-button interface: Team A wins, Halved, Team B wins
 * - Shows current match status
 * - Voice input support (future)
 * - Haptic feedback
 * - Auto-advances to next hole
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Minus, ChevronLeft, ChevronRight, Trophy, Users } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useTripStore, useScoringStore } from '@/lib/stores';
import { calculateMatchState } from '@/lib/services/scoringEngine';
import { useHaptic } from '@/lib/hooks/useHaptic';
import type { Match, Player, HoleResult, HoleWinner } from '@/lib/types/models';
import type { MatchState } from '@/lib/types/computed';

interface QuickScoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    matchId: string;
}

export function QuickScoreModal({ isOpen, onClose, matchId }: QuickScoreModalProps) {
    const { players, teams } = useTripStore();
    const { trigger } = useHaptic();
    const [currentHole, setCurrentHole] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Get match data
    const match = useLiveQuery(
        () => db.matches.get(matchId),
        [matchId]
    );

    // Get hole results
    const holeResults = useLiveQuery(
        async () => {
            if (!matchId) return [];
            return db.holeResults
                .where('matchId')
                .equals(matchId)
                .sortBy('holeNumber');
        },
        [matchId],
        []
    );

    // Calculate match state
    const matchState: MatchState | null = match && holeResults
        ? calculateMatchState(match, holeResults)
        : null;

    // Auto-set current hole to next unplayed
    useEffect(() => {
        if (holeResults && holeResults.length > 0) {
            const playedHoles = holeResults.map(r => r.holeNumber);
            const nextHole = Math.max(...playedHoles) + 1;
            if (nextHole <= 18) {
                setCurrentHole(nextHole);
            }
        }
    }, [holeResults]);

    // Get team players
    const getTeamPlayers = (playerIds: string[]) => {
        return playerIds
            .map(id => players.find(p => p.id === id))
            .filter(Boolean) as Player[];
    };

    const teamAPlayers = match ? getTeamPlayers(match.teamAPlayerIds) : [];
    const teamBPlayers = match ? getTeamPlayers(match.teamBPlayerIds) : [];

    // Get team names
    const teamA = teams.find(t => t.color === 'usa');
    const teamB = teams.find(t => t.color === 'europe');
    const teamAName = teamA?.name || 'Team A';
    const teamBName = teamB?.name || 'Team B';

    // Get result for current hole
    const currentResult = holeResults.find(r => r.holeNumber === currentHole);

    // Handle score entry
    const handleScore = async (winner: HoleWinner) => {
        if (!match || isSubmitting) return;

        setIsSubmitting(true);
        trigger('medium');

        try {
            const existingResult = holeResults.find(r => r.holeNumber === currentHole);

            const holeResult: HoleResult = {
                id: existingResult?.id || crypto.randomUUID(),
                matchId: match.id,
                holeNumber: currentHole,
                winner,
                timestamp: new Date().toISOString(),
                teamAStrokes: winner === 'teamA' ? 1 : winner === 'teamB' ? 2 : 1,
                teamBStrokes: winner === 'teamB' ? 1 : winner === 'teamA' ? 2 : 1,
            };

            await db.holeResults.put(holeResult);

            // Show success feedback
            setShowSuccess(true);
            trigger('success');

            // Auto-advance to next hole after brief delay
            setTimeout(() => {
                setShowSuccess(false);
                if (currentHole < 18) {
                    setCurrentHole(prev => prev + 1);
                }
            }, 600);

        } catch (error) {
            console.error('Failed to save score:', error);
            trigger('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format player names
    const formatNames = (playerList: Player[]) => {
        if (playerList.length === 0) return 'TBD';
        return playerList.map(p => p.lastName).join(' / ');
    };

    if (!match) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl"
                        style={{ maxHeight: '85vh' }}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-10 h-1 rounded-full bg-muted" />
                        </div>

                        {/* Header */}
                        <div className="px-4 pb-4 flex items-center justify-between border-b border-border">
                            <div>
                                <h2 className="text-lg font-semibold">Quick Score</h2>
                                <p className="text-sm text-muted-foreground">
                                    {matchState?.displayScore || 'All Square'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-muted transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Hole Navigator */}
                        <div className="px-4 py-4 flex items-center justify-center gap-4">
                            <button
                                onClick={() => setCurrentHole(prev => Math.max(1, prev - 1))}
                                disabled={currentHole === 1}
                                className="p-2 rounded-full hover:bg-muted disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <div className="text-center">
                                <div className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                                    {currentHole}
                                </div>
                                <div className="text-sm text-muted-foreground">Hole</div>
                            </div>

                            <button
                                onClick={() => setCurrentHole(prev => Math.min(18, prev + 1))}
                                disabled={currentHole === 18}
                                className="p-2 rounded-full hover:bg-muted disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* Current Result Indicator */}
                        {currentResult && (
                            <div className="px-4 pb-2 text-center">
                                <span className="text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground">
                                    {currentResult.winner === 'teamA' ? `${teamAName} won` :
                                        currentResult.winner === 'teamB' ? `${teamBName} won` : 'Halved'}
                                </span>
                            </div>
                        )}

                        {/* Score Buttons */}
                        <div className="px-4 py-6 space-y-3">
                            {/* Team A Wins */}
                            <button
                                onClick={() => handleScore('teamA')}
                                disabled={isSubmitting}
                                className={`w-full py-5 px-4 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] ${currentResult?.winner === 'teamA'
                                    ? 'ring-2 ring-offset-2 ring-[var(--team-usa)]'
                                    : ''
                                    }`}
                                style={{
                                    background: 'var(--team-usa-light)',
                                    borderLeft: '4px solid var(--team-usa)',
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{ background: 'var(--team-usa)' }}
                                    >
                                        <Trophy size={18} className="text-white" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">{teamAName} Wins</div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatNames(teamAPlayers)}
                                        </div>
                                    </div>
                                </div>
                                {currentResult?.winner === 'teamA' && (
                                    <Check size={24} style={{ color: 'var(--team-usa)' }} />
                                )}
                            </button>

                            {/* Halved */}
                            <button
                                onClick={() => handleScore('halved')}
                                disabled={isSubmitting}
                                className={`w-full py-5 px-4 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] ${currentResult?.winner === 'halved'
                                    ? 'ring-2 ring-offset-2 ring-muted-foreground'
                                    : ''
                                    }`}
                                style={{
                                    background: 'var(--canvas-sunken)',
                                    borderLeft: '4px solid var(--rule-strong)',
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center bg-muted"
                                    >
                                        <Minus size={18} className="text-muted-foreground" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">Halved</div>
                                        <div className="text-sm text-muted-foreground">
                                            Both teams tied
                                        </div>
                                    </div>
                                </div>
                                {currentResult?.winner === 'halved' && (
                                    <Check size={24} className="text-muted-foreground" />
                                )}
                            </button>

                            {/* Team B Wins */}
                            <button
                                onClick={() => handleScore('teamB')}
                                disabled={isSubmitting}
                                className={`w-full py-5 px-4 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] ${currentResult?.winner === 'teamB'
                                    ? 'ring-2 ring-offset-2 ring-[var(--team-europe)]'
                                    : ''
                                    }`}
                                style={{
                                    background: 'var(--team-europe-light)',
                                    borderLeft: '4px solid var(--team-europe)',
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{ background: 'var(--team-europe)' }}
                                    >
                                        <Trophy size={18} className="text-white" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">{teamBName} Wins</div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatNames(teamBPlayers)}
                                        </div>
                                    </div>
                                </div>
                                {currentResult?.winner === 'teamB' && (
                                    <Check size={24} style={{ color: 'var(--team-europe)' }} />
                                )}
                            </button>
                        </div>

                        {/* Success Overlay */}
                        <AnimatePresence>
                            {showSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-t-3xl"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div
                                            className="w-16 h-16 rounded-full flex items-center justify-center"
                                            style={{ background: 'var(--masters)' }}
                                        >
                                            <Check size={32} className="text-white" />
                                        </div>
                                        <span className="font-semibold">Saved!</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Bottom safe area */}
                        <div className="h-8" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
