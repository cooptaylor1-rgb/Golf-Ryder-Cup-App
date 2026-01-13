'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTripStore } from '@/lib/stores';
import { AppShellNew } from '@/components/layout';
import {
  Card,
  SectionHeader,
  StandingsCardSkeleton,
  NoStandingsEmptyNew,
} from '@/components/ui';
import { calculateTeamStandings, calculateMagicNumber, calculatePlayerLeaderboard } from '@/lib/services/tournamentEngine';
import { cn } from '@/lib/utils';
import type { TeamStandings, MagicNumber, PlayerLeaderboard } from '@/lib/types/computed';
import { Trophy, Medal, TrendingUp, Target, Award } from 'lucide-react';

/**
 * STANDINGS PAGE - Masters-inspired Championship View
 *
 * The hero moment: large, elegant score display
 * Gold accents for winners and special achievements
 */

// Enhanced Team Standings Card component
interface TeamStandingsCardProps {
  standings: TeamStandings;
  magicNumber: MagicNumber;
  teamAName: string;
  teamBName: string;
}

function TeamStandingsCardNew({
  standings,
  magicNumber,
  teamAName,
  teamBName,
}: TeamStandingsCardProps) {
  const { teamAPoints, teamBPoints, matchesPlayed, leader } = standings;
  const { pointsToWin, hasClinched, clinchingTeam, teamANeeded, teamBNeeded } = magicNumber;

  const totalPoints = teamAPoints + teamBPoints;
  const teamAPercent = totalPoints > 0 ? (teamAPoints / totalPoints) * 100 : 50;
  const teamBPercent = totalPoints > 0 ? (teamBPoints / totalPoints) * 100 : 50;

  // Determine if a team can clinch based on needed points
  const canClinch = !hasClinched && (teamANeeded <= 3 || teamBNeeded <= 3);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface-card border border-surface-border">
      {/* Subtle ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-gold/5 rounded-full blur-3xl" />

      {/* Points to Win Banner - elegant gold */}
      <div className="relative bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5 px-4 py-3 text-center border-b border-gold/10">
        <span className="text-sm text-gold font-medium">
          {pointsToWin} points to win
        </span>
      </div>

      {/* Main Score Display */}
      <div className="relative p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          {/* Team A */}
          <div className="text-center flex-1">
            <div className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3',
              'bg-team-usa/10 border border-team-usa/20',
            )}>
              <div className="h-2 w-2 rounded-full bg-team-usa" />
              <span className="text-xs font-semibold uppercase tracking-wider text-team-usa">
                {teamAName}
              </span>
            </div>
            <p className={cn(
              'font-mono text-5xl lg:text-6xl font-bold tracking-tight',
              teamAPoints > teamBPoints ? 'text-team-usa' : 'text-magnolia',
            )}>
              {teamAPoints}
            </p>
          </div>

          {/* VS Divider - elegant */}
          <div className="px-6">
            <div className="h-14 w-14 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center">
              <span className="text-xs font-bold text-text-tertiary tracking-wider">VS</span>
            </div>
          </div>

          {/* Team B */}
          <div className="text-center flex-1">
            <div className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3',
              'bg-team-europe/10 border border-team-europe/20',
            )}>
              <div className="h-2 w-2 rounded-full bg-team-europe" />
              <span className="text-xs font-semibold uppercase tracking-wider text-team-europe">
                {teamBName}
              </span>
            </div>
            <p className={cn(
              'font-mono text-5xl lg:text-6xl font-bold tracking-tight',
              teamBPoints > teamAPoints ? 'text-team-europe' : 'text-magnolia',
            )}>
              {teamBPoints}
            </p>
          </div>
        </div>

        {/* Progress Bar - refined */}
        <div className="h-2 rounded-full bg-surface-elevated overflow-hidden flex">
          <div
            className="bg-team-usa transition-all duration-500"
            style={{ width: `${teamAPercent}%` }}
          />
          <div
            className="bg-team-europe transition-all duration-500"
            style={{ width: `${teamBPercent}%` }}
          />
        </div>

        {/* Magic Number / Victory State */}
        {(canClinch || hasClinched) && (
          <div className={cn(
            'mt-6 p-4 rounded-xl text-center',
            hasClinched
              ? 'bg-gradient-to-r from-gold/10 via-gold/15 to-gold/10 border border-gold/20'
              : 'bg-masters-green/10 border border-masters-green/20',
          )}>
            {hasClinched ? (
              <div className="flex items-center justify-center gap-3">
                <Trophy className="h-5 w-5 text-gold" />
                <span className="font-serif text-lg text-gold">
                  {clinchingTeam === 'A' ? teamAName : teamBName} Wins!
                </span>
              </div>
            ) : (
              <p className="text-sm text-masters-green-light font-medium">
                Magic Number: <span className="font-bold text-lg ml-1">
                  {leader === 'teamA' ? teamANeeded : teamBNeeded}
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Player Leaderboard Entry - Masters elegance
interface LeaderboardEntryProps {
  entry: PlayerLeaderboard;
  rank: number;
  isTeamA: boolean;
}

function LeaderboardEntry({ entry, rank, isTeamA }: LeaderboardEntryProps) {
  return (
    <div className={cn(
      'flex items-center gap-4 p-4',
      rank <= 3 && 'bg-gold/3',
    )}>
      {/* Rank Badge - Gold medals for top 3 */}
      <div className={cn(
        'h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0',
        rank === 1 && 'bg-gradient-to-br from-gold to-gold-dark text-surface-base',
        rank === 2 && 'bg-gradient-to-br from-silver to-gray-400 text-gray-800',
        rank === 3 && 'bg-gradient-to-br from-bronze to-amber-700 text-amber-100',
        rank > 3 && 'bg-surface-elevated text-text-secondary',
      )}>
        {rank}
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-magnolia truncate">
          {entry.playerName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className={cn(
            'h-2 w-2 rounded-full',
            isTeamA ? 'bg-team-usa' : 'bg-team-europe',
          )} />
          <span className="text-xs text-text-secondary">
            {entry.record}
          </span>
        </div>
      </div>

      {/* Points - Gold accent */}
      <div className="text-right shrink-0">
        <p className={cn(
          'text-xl font-bold',
          rank <= 3 ? 'text-gold' : 'text-masters-green-light',
        )}>
          {entry.points}
        </p>
        <p className="text-xs text-text-tertiary">
          {entry.matchesPlayed} {entry.matchesPlayed === 1 ? 'match' : 'matches'}
        </p>
      </div>
    </div>
  );
}

// Stat Card component - refined
interface StatCardProps {
  value: number;
  label: string;
  highlight?: boolean;
}

function StatCard({ value, label, highlight = false }: StatCardProps) {
  return (
    <div className="p-5 rounded-xl bg-surface-card border border-surface-border text-center">
      <p className={cn(
        'text-3xl font-mono font-bold',
        highlight ? 'text-gold' : 'text-magnolia',
      )}>
        {value}
      </p>
      <p className="text-xs text-text-tertiary mt-2">{label}</p>
    </div>
  );
}

export default function StandingsPage() {
  const router = useRouter();
  const { currentTrip, teams } = useTripStore();

  const [standings, setStandings] = useState<TeamStandings | null>(null);
  const [magicNumber, setMagicNumber] = useState<MagicNumber | null>(null);
  const [leaderboard, setLeaderboard] = useState<PlayerLeaderboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if no trip
  useEffect(() => {
    if (!currentTrip) {
      router.push('/');
    }
  }, [currentTrip, router]);

  // Load standings
  useEffect(() => {
    const loadStandings = async () => {
      if (!currentTrip) return;

      setIsLoading(true);
      try {
        const teamStandings = await calculateTeamStandings(currentTrip.id);
        const magic = calculateMagicNumber(teamStandings);
        const players = await calculatePlayerLeaderboard(currentTrip.id);

        setStandings(teamStandings);
        setMagicNumber(magic);
        setLeaderboard(players);
      } catch (error) {
        console.error('Failed to load standings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStandings();
  }, [currentTrip]);

  if (!currentTrip) return null;

  const teamA = teams.find(t => t.color === 'usa');
  const teamB = teams.find(t => t.color === 'europe');

  return (
    <AppShellNew
      headerTitle="Standings"
      headerSubtitle={currentTrip.name}
    >
      <div className="p-4 lg:p-6 space-y-6">
        {isLoading ? (
          // Loading state with skeletons
          <div className="space-y-6">
            <StandingsCardSkeleton />
            <Card>
              <SectionHeader title="Player Leaderboard" icon={Medal} size="sm" className="mb-4" />
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-surface-muted" />
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-surface-muted rounded" />
                      <div className="h-3 w-16 bg-surface-muted rounded mt-1" />
                    </div>
                    <div className="h-6 w-8 bg-surface-muted rounded" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : standings && magicNumber ? (
          <>
            {/* Team Standings Card */}
            <TeamStandingsCardNew
              standings={standings}
              magicNumber={magicNumber}
              teamAName={teamA?.name || 'Team USA'}
              teamBName={teamB?.name || 'Team Europe'}
            />

            {/* Player Leaderboard */}
            <section>
              <SectionHeader
                title="Player Leaderboard"
                subtitle={leaderboard.length > 0 ? `${leaderboard.length} players` : undefined}
                icon={Medal}
                className="mb-4"
              />

              <Card padding="none" className="overflow-hidden divide-y divide-surface-border/50">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => (
                    <LeaderboardEntry
                      key={entry.playerId}
                      entry={entry}
                      rank={index + 1}
                      isTeamA={entry.teamId === teamA?.id}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-surface-elevated mb-4">
                      <Trophy className="h-6 w-6 text-text-tertiary" />
                    </div>
                    <p className="text-text-secondary font-medium">No matches completed yet</p>
                    <p className="text-sm text-text-tertiary mt-1">Player records will appear here</p>
                  </div>
                )}
              </Card>
            </section>

            {/* Match Stats */}
            <section>
              <SectionHeader
                title="Match Stats"
                icon={TrendingUp}
                size="sm"
                className="mb-4"
              />

              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  value={standings.matchesPlayed}
                  label="Matches Complete"
                  highlight
                />
                <StatCard
                  value={standings.matchesRemaining}
                  label="Matches Remaining"
                />
              </div>
            </section>
          </>
        ) : (
          // Empty state
          <Card variant="outlined" padding="none">
            <NoStandingsEmptyNew />
          </Card>
        )}
      </div>
    </AppShellNew>
  );
}
