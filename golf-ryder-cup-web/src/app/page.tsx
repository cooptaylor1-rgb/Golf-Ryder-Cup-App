'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { seedDemoData, clearDemoData } from '@/lib/db/seed';
import { useTripStore, useUIStore } from '@/lib/stores';
import { AppShellNew } from '@/components/layout';
import { Badge, ConfirmDialog } from '@/components/ui';
import {
  Trophy,
  Play,
  Plus,
  ChevronRight,
  Calendar,
  MapPin,
  Zap,
  Settings,
  ChevronDown,
  Flag,
  Users,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

/**
 * THE MASTERS-INSPIRED HOME PAGE
 *
 * Design Philosophy:
 * - Understated luxury, timeless elegance
 * - The quiet confidence of a private club
 * - Serif typography for headlines
 * - Championship gold as premium accent
 * - Generous whitespace
 */

// ============================================
// CHAMPIONSHIP CARD
// The elegant focal point - Masters quality
// ============================================
interface ChampionshipCardProps {
  hasActiveTrip: boolean;
  activeTrip?: {
    id: string;
    name: string;
    location?: string;
    startDate: Date | string;
    endDate: Date | string;
  };
  onResume: () => void;
  onCreate: () => void;
}

function ChampionshipCard({ hasActiveTrip, activeTrip, onResume, onCreate }: ChampionshipCardProps) {
  if (hasActiveTrip && activeTrip) {
    // ACTIVE TOURNAMENT STATE
    return (
      <div className="command-card group relative overflow-hidden rounded-2xl bg-surface-card">
        {/* Subtle gold accent border */}
        <div className="absolute inset-0 rounded-2xl border border-gold/20" />

        {/* Ambient glow - understated */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-masters-green/10 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gold/5 rounded-full blur-3xl" />

        <div className="relative p-8 lg:p-10">
          {/* Status - elegant overline */}
          <div className="flex items-center gap-3 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-masters-green opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-masters-green" />
            </span>
            <span className="text-overline text-masters-green-light">
              Tournament in Progress
            </span>
          </div>

          {/* Tournament name - Serif, elegant */}
          <h1 className="font-serif text-3xl lg:text-4xl text-magnolia mb-3 tracking-tight">
            {activeTrip.name}
          </h1>

          {/* Location */}
          {activeTrip.location && (
            <div className="flex items-center gap-2 text-text-secondary mb-4">
              <MapPin className="h-4 w-4 text-gold" />
              <span className="text-body">{activeTrip.location}</span>
            </div>
          )}

          {/* Date range */}
          <div className="flex items-center gap-2 text-text-tertiary mb-10">
            <Calendar className="h-4 w-4" />
            <span className="text-footnote">
              {formatDate(activeTrip.startDate, 'short')} – {formatDate(activeTrip.endDate, 'short')}
            </span>
          </div>

          {/* Primary CTA - Gold accent */}
          <button
            onClick={onResume}
            className={cn(
              'group/btn relative inline-flex items-center gap-3',
              'px-8 py-4 rounded-xl',
              'bg-gradient-to-r from-masters-green to-masters-green-dark',
              'text-white font-semibold text-headline',
              'shadow-lg shadow-masters-green/20',
              'hover:shadow-xl hover:shadow-masters-green/30',
              'hover:from-masters-green-light hover:to-masters-green',
              'active:scale-[0.98]',
              'transition-all duration-200'
            )}
          >
            <Play className="h-5 w-5" />
            <span>Continue Tournament</span>
            <ChevronRight className="h-4 w-4 opacity-60 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // EMPTY STATE - "The Course Awaits"
  return (
    <div className="command-card group relative overflow-hidden rounded-2xl bg-surface-card">
      {/* Elegant border */}
      <div className="absolute inset-0 rounded-2xl border border-surface-border" />

      {/* Subtle ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl opacity-50" />

      <div className="relative p-8 lg:p-10 text-center lg:text-left">
        {/* Icon - Flag, subtle */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-elevated mb-6">
          <Flag className="h-7 w-7 text-gold" />
        </div>

        {/* Headline - Serif elegance */}
        <h1 className="font-serif text-3xl lg:text-4xl text-magnolia mb-3">
          The Course Awaits
        </h1>

        {/* Subhead */}
        <p className="text-body-lg text-text-secondary mb-10 max-w-md">
          Create your championship and invite your competitors.
        </p>

        {/* Primary CTA - Gold gradient for premium feel */}
        <button
          onClick={onCreate}
          className={cn(
            'group/btn relative inline-flex items-center gap-3',
            'px-8 py-4 rounded-xl',
            'bg-gradient-to-r from-gold to-gold-dark',
            'text-surface-base font-semibold text-headline',
            'shadow-lg shadow-gold/20',
            'hover:shadow-xl hover:shadow-gold/30 hover:shadow-glow-gold',
            'active:scale-[0.98]',
            'transition-all duration-200'
          )}
        >
          <Plus className="h-5 w-5" />
          <span>Create Tournament</span>
          <ChevronRight className="h-4 w-4 opacity-60 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// RECENT TRIP CARD - Understated elegance
// ============================================
interface RecentTripCardProps {
  trip: {
    id: string;
    name: string;
    location?: string;
    startDate: Date | string;
    endDate: Date | string;
    teamAName?: string;
    teamBName?: string;
  };
  onSelect: (id: string) => void;
}

function RecentTripCard({ trip, onSelect }: RecentTripCardProps) {
  return (
    <button
      onClick={() => onSelect(trip.id)}
      className={cn(
        'group w-full text-left',
        'p-5 rounded-xl',
        'bg-surface-card border border-surface-border',
        'hover:border-gold/30 hover:shadow-card-md',
        'active:scale-[0.99]',
        'transition-all duration-200'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-magnolia truncate mb-1">
            {trip.name}
          </h3>
          {trip.location && (
            <div className="flex items-center gap-1.5 text-text-tertiary">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-footnote truncate">{trip.location}</span>
            </div>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-text-tertiary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
      </div>

      <div className="flex items-center gap-4 text-caption text-text-tertiary">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(trip.startDate, 'short')}</span>
        </div>
        {trip.teamAName && trip.teamBName && (
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span className="truncate">{trip.teamAName} vs {trip.teamBName}</span>
          </div>
        )}
      </div>
    </button>
  );
}

// ============================================
// DEVELOPER TOOLS - Hidden accordion
// ============================================
interface DevToolsProps {
  onLoadDemo: () => void;
  onClearDemo: () => void;
  isLoading: boolean;
}

function DevTools({ onLoadDemo, onClearDemo, isLoading }: DevToolsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-12 border-t border-surface-border pt-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 text-text-tertiary hover:text-text-secondary',
          'text-caption transition-colors'
        )}
      >
        <Settings className="h-3.5 w-3.5" />
        <span>Developer Tools</span>
        <ChevronDown className={cn(
          'h-3.5 w-3.5 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className="mt-4 p-4 rounded-lg bg-surface-elevated animate-fade-in-up">
          <p className="text-caption text-text-tertiary mb-4">
            Development utilities for testing
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onLoadDemo}
              disabled={isLoading}
              className={cn(
                'px-4 py-2 rounded-lg text-footnote font-medium',
                'bg-masters-green/10 text-masters-green-light border border-masters-green/20',
                'hover:bg-masters-green/20',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              {isLoading ? 'Loading...' : 'Load Demo Data'}
            </button>
            <button
              onClick={onClearDemo}
              disabled={isLoading}
              className={cn(
                'px-4 py-2 rounded-lg text-footnote font-medium',
                'bg-azalea/10 text-azalea border border-azalea/20',
                'hover:bg-azalea/20',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              Clear All Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN HOME PAGE COMPONENT
// ============================================
export default function HomePage() {
  const router = useRouter();
  const { loadTrip } = useTripStore();
  const { showToast } = useUIStore();

  // Loading states
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Query trips from database
  const trips = useLiveQuery(
    () => db.trips.orderBy('startDate').reverse().toArray(),
    []
  );

  // Find active trip (in-progress or most recent)
  const activeTrip = trips?.find(t => {
    const now = new Date();
    const start = new Date(t.startDate);
    const end = new Date(t.endDate);
    return now >= start && now <= end;
  }) || trips?.[0];

  const recentTrips = trips?.filter(t => t.id !== activeTrip?.id).slice(0, 3);

  // Handlers
  const handleResumeTrip = async () => {
    if (activeTrip) {
      await loadTrip(activeTrip.id);
      router.push('/standings');
    }
  };

  const handleCreateTrip = () => {
    router.push('/trip/new');
  };

  const handleSelectTrip = async (tripId: string) => {
    await loadTrip(tripId);
    router.push('/standings');
  };

  const handleLoadDemo = async () => {
    setIsDemoLoading(true);
    try {
      await seedDemoData();
      showToast('success', 'Demo tournament loaded');
    } catch (error) {
      showToast('error', 'Failed to load demo data');
      console.error(error);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleClearDemo = async () => {
    setIsDemoLoading(true);
    try {
      await clearDemoData();
      showToast('info', 'All data cleared');
    } catch (error) {
      showToast('error', 'Failed to clear data');
      console.error(error);
    } finally {
      setIsDemoLoading(false);
      setShowClearConfirm(false);
    }
  };

  return (
    <AppShellNew>
      <div className="min-h-screen bg-surface-base">
        {/* Hero Section */}
        <div className="relative">
          {/* Ambient background effects - very subtle */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-masters-green/5 rounded-full blur-3xl" />
            <div className="absolute -top-32 right-0 w-[400px] h-[400px] bg-gold/3 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
            {/* Page header */}
            <header className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-masters-green to-masters-green-dark flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-overline text-text-tertiary">Ryder Cup Tracker</h2>
                </div>
              </div>
            </header>

            {/* Championship Card - Primary focal point */}
            <ChampionshipCard
              hasActiveTrip={!!activeTrip}
              activeTrip={activeTrip}
              onResume={handleResumeTrip}
              onCreate={handleCreateTrip}
            />

            {/* Recent Trips Section */}
            {recentTrips && recentTrips.length > 0 && (
              <section className="mt-12">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-serif text-xl text-magnolia">Previous Tournaments</h2>
                </div>
                <div className="space-y-3 stagger-children">
                  {recentTrips.map((trip) => (
                    <RecentTripCard
                      key={trip.id}
                      trip={trip}
                      onSelect={handleSelectTrip}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Quick Actions */}
            {activeTrip && (
              <section className="mt-10">
                <h2 className="font-serif text-xl text-magnolia mb-5">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={async () => {
                      await loadTrip(activeTrip.id);
                      router.push('/standings');
                    }}
                    className={cn(
                      'p-4 rounded-xl text-left',
                      'bg-surface-card border border-surface-border',
                      'hover:border-gold/20 hover:shadow-card',
                      'transition-all duration-200'
                    )}
                  >
                    <Trophy className="h-5 w-5 text-gold mb-2" />
                    <span className="text-footnote font-medium text-magnolia">Standings</span>
                  </button>
                  <button
                    onClick={async () => {
                      await loadTrip(activeTrip.id);
                      router.push('/matchups');
                    }}
                    className={cn(
                      'p-4 rounded-xl text-left',
                      'bg-surface-card border border-surface-border',
                      'hover:border-gold/20 hover:shadow-card',
                      'transition-all duration-200'
                    )}
                  >
                    <Users className="h-5 w-5 text-masters-green-light mb-2" />
                    <span className="text-footnote font-medium text-magnolia">Matchups</span>
                  </button>
                </div>
              </section>
            )}

            {/* Developer Tools - Hidden by default */}
            <DevTools
              onLoadDemo={handleLoadDemo}
              onClearDemo={() => setShowClearConfirm(true)}
              isLoading={isDemoLoading}
            />
          </div>
        </div>

        {/* Clear Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          onConfirm={handleClearDemo}
          title="Clear All Data"
          description="This will permanently delete all tournaments, players, and scores. This action cannot be undone."
          confirmLabel="Clear Everything"
          variant="danger"
        />
      </div>
    </AppShellNew>
  );
}
