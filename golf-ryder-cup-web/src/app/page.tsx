'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useTripStore } from '@/lib/stores';
import { ChevronRight, MapPin, Calendar, Plus, Home, Target, Users, Trophy, MoreHorizontal } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { calculateTeamStandings } from '@/lib/services/tournamentEngine';
import type { TeamStandings } from '@/lib/types/computed';

/**
 * HOME PAGE — The Front Page
 *
 * Design Philosophy:
 * - Tournament names in warm serif
 * - Scores are monumental, owning the screen
 * - Generous white space creates calm authority
 * - Typography does the heavy lifting, not decoration
 */
export default function HomePage() {
  const router = useRouter();
  const { loadTrip } = useTripStore();
  const [standings, setStandings] = useState<TeamStandings | null>(null);

  const trips = useLiveQuery(
    () => db.trips.orderBy('startDate').reverse().toArray(),
    []
  );

  // Find active trip
  const activeTrip = trips?.find(t => {
    const now = new Date();
    const start = new Date(t.startDate);
    const end = new Date(t.endDate);
    return now >= start && now <= end;
  });

  // Load standings for active trip
  useEffect(() => {
    if (activeTrip) {
      loadTrip(activeTrip.id);
      calculateTeamStandings(activeTrip.id).then(setStandings);
    }
  }, [activeTrip, loadTrip]);

  const handleSelectTrip = async (tripId: string) => {
    await loadTrip(tripId);
    router.push('/standings');
  };

  const hasTrips = trips && trips.length > 0;
  const pastTrips = trips?.filter(t => t.id !== activeTrip?.id) || [];

  return (
    <div className="min-h-screen pb-nav page-enter" style={{ background: 'var(--canvas)' }}>
      {/* Minimal Header */}
      <header className="header">
        <div className="container-editorial">
          <span className="type-overline">Ryder Cup Tracker</span>
        </div>
      </header>

      <main className="container-editorial">
        {/* LEAD — Active Tournament with Live Score */}
        {activeTrip && standings ? (
          <section className="section">
            <button
              onClick={() => handleSelectTrip(activeTrip.id)}
              className="w-full text-left press-scale card-interactive"
              style={{ background: 'transparent', border: 'none', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)', margin: 'calc(-1 * var(--space-4))' }}
            >
              {/* Live Badge */}
              <div className="live-indicator" style={{ marginBottom: 'var(--space-4)' }}>
                Live
              </div>

              {/* Tournament Name — Warm Serif */}
              <h1 className="type-display" style={{ marginBottom: 'var(--space-8)' }}>
                {activeTrip.name}
              </h1>

              {/* Score Hero — Team Identity Blocks */}
              <div className="score-vs">
                {/* Team USA Block */}
                <div
                  className={`score-vs-team score-vs-usa ${standings.teamAPoints >= standings.teamBPoints ? 'leading' : ''}`}
                >
                  <span
                    className={`team-dot team-dot-lg team-dot-usa ${standings.leader !== null ? 'team-dot-pulse' : ''}`}
                    style={{ display: 'inline-block', marginBottom: 'var(--space-3)' }}
                  />
                  <p
                    className="score-monumental"
                    style={{
                      color: standings.teamAPoints >= standings.teamBPoints
                        ? 'var(--team-usa)'
                        : 'var(--ink-tertiary)'
                    }}
                  >
                    {standings.teamAPoints}
                  </p>
                  <p
                    className="type-overline"
                    style={{
                      marginTop: 'var(--space-3)',
                      color: 'var(--team-usa)'
                    }}
                  >
                    USA
                  </p>
                </div>

                {/* Separator */}
                <div className="score-vs-divider">–</div>

                {/* Team Europe Block */}
                <div
                  className={`score-vs-team score-vs-europe ${standings.teamBPoints > standings.teamAPoints ? 'leading' : ''}`}
                >
                  <span
                    className={`team-dot team-dot-lg team-dot-europe ${standings.leader !== null ? 'team-dot-pulse' : ''}`}
                    style={{ display: 'inline-block', marginBottom: 'var(--space-3)' }}
                  />
                  <p
                    className="score-monumental"
                    style={{
                      color: standings.teamBPoints > standings.teamAPoints
                        ? 'var(--team-europe)'
                        : 'var(--ink-tertiary)'
                    }}
                  >
                    {standings.teamBPoints}
                  </p>
                  <p
                    className="type-overline"
                    style={{
                      marginTop: 'var(--space-3)',
                      color: 'var(--team-europe)'
                    }}
                  >
                    EUR
                  </p>
                </div>
              </div>

              {/* Context — Location & Date */}
              <div
                className="flex items-center justify-center gap-6 type-caption"
                style={{ marginTop: 'var(--space-6)' }}
              >
                {activeTrip.location && (
                  <span className="flex items-center gap-2">
                    <MapPin size={14} strokeWidth={1.5} />
                    {activeTrip.location}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Calendar size={14} strokeWidth={1.5} />
                  {formatDate(activeTrip.startDate, 'short')}
                </span>
              </div>

              {/* Call to Action */}
              <div
                className="flex items-center justify-center gap-2"
                style={{
                  marginTop: 'var(--space-10)',
                  color: 'var(--masters)',
                  fontWeight: 500
                }}
              >
                <span>View standings</span>
                <ChevronRight size={18} strokeWidth={2} />
              </div>
            </button>
          </section>
        ) : activeTrip ? (
          /* Active trip loading */
          <section className="section">
            <button
              onClick={() => handleSelectTrip(activeTrip.id)}
              className="w-full text-left"
            >
              <div className="live-indicator" style={{ marginBottom: 'var(--space-4)' }}>
                Active
              </div>
              <h1 className="type-display" style={{ marginBottom: 'var(--space-6)' }}>
                {activeTrip.name}
              </h1>
              <div className="flex items-center gap-6 type-caption">
                {activeTrip.location && (
                  <span className="flex items-center gap-2">
                    <MapPin size={14} strokeWidth={1.5} />
                    {activeTrip.location}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Calendar size={14} strokeWidth={1.5} />
                  {formatDate(activeTrip.startDate, 'short')}
                </span>
              </div>
              <div
                className="flex items-center gap-2"
                style={{
                  marginTop: 'var(--space-6)',
                  color: 'var(--masters)',
                  fontWeight: 500
                }}
              >
                <span>Continue</span>
                <ChevronRight size={18} strokeWidth={2} />
              </div>
            </button>
          </section>
        ) : null}

        {activeTrip && <hr className="divider-lg" />}

        {/* ARCHIVE — Tournament List */}
        <section className={activeTrip ? 'section-sm' : 'section'}>
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 'var(--space-6)' }}
          >
            <h2 className="type-overline">
              {hasTrips ? 'Tournaments' : 'Get Started'}
            </h2>
            {hasTrips && (
              <Link
                href="/trip/new"
                className="flex items-center gap-1"
                style={{
                  color: 'var(--masters)',
                  fontWeight: 500,
                  fontSize: 'var(--text-sm)'
                }}
              >
                <Plus size={16} strokeWidth={2} />
                New
              </Link>
            )}
          </div>

          {pastTrips.length > 0 ? (
            <div className="stagger-fast">
              {pastTrips.map((trip, index) => (
                <button
                  key={trip.id}
                  onClick={() => handleSelectTrip(trip.id)}
                  className="match-row row-interactive w-full text-left stagger-item"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="type-title-sm" style={{ marginBottom: 'var(--space-1)' }}>
                      {trip.name}
                    </p>
                    <div className="flex items-center gap-4 type-caption">
                      {trip.location && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin size={12} strokeWidth={1.5} />
                          <span className="truncate">{trip.location}</span>
                        </span>
                      )}
                      <span>{formatDate(trip.startDate, 'short')}</span>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    strokeWidth={1.5}
                    className="row-chevron"
                    style={{ color: 'var(--ink-tertiary)' }}
                  />
                </button>
              ))}
            </div>
          ) : !activeTrip ? (
            /* Empty state */
            <div className="empty-state animate-victory">
              <div className="empty-state-icon animate-breathe">
                <Trophy size={28} strokeWidth={1.5} />
              </div>
              <p className="empty-state-title">No tournaments yet</p>
              <p className="empty-state-text">
                Create your first tournament to start tracking matches with friends
              </p>
              <Link href="/trip/new" className="btn btn-primary press-scale">
                <Plus size={18} strokeWidth={2} />
                Create Tournament
              </Link>
            </div>
          ) : null}
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <Link href="/" className="nav-item nav-item-active">
          <Home size={22} strokeWidth={1.75} />
          <span>Home</span>
        </Link>
        <Link href="/score" className="nav-item">
          <Target size={22} strokeWidth={1.75} />
          <span>Score</span>
        </Link>
        <Link href="/matchups" className="nav-item">
          <Users size={22} strokeWidth={1.75} />
          <span>Matches</span>
        </Link>
        <Link href="/standings" className="nav-item">
          <Trophy size={22} strokeWidth={1.75} />
          <span>Standings</span>
        </Link>
        <Link href="/more" className="nav-item">
          <MoreHorizontal size={22} strokeWidth={1.75} />
          <span>More</span>
        </Link>
      </nav>
    </div>
  );
}
