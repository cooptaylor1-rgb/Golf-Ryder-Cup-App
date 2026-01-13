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
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

// ============================================
// PREMIUM COMMAND CARD
// The dominant focal point of the entry experience
// ============================================
interface CommandCardProps {
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

function CommandCard({ hasActiveTrip, activeTrip, onResume, onCreate }: CommandCardProps) {
  if (hasActiveTrip && activeTrip) {
    // ACTIVE TOURNAMENT STATE
    return (
      <div className="command-card group relative overflow-hidden rounded-2xl">
        {/* Layered background with depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated via-surface-raised to-surface-base" />
        <div className="absolute inset-0 bg-gradient-to-tr from-augusta-green/8 via-transparent to-transparent" />

        {/* Subtle animated glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-augusta-green/20 rounded-full blur-3xl animate-pulse-slow" />

        {/* Inner border for depth */}
        <div className="absolute inset-[1px] rounded-2xl border border-white/5" />

        <div className="relative p-6 lg:p-8">
          {/* Status indicator */}
          <div className="flex items-center gap-2 mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-augusta-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-augusta-green" />
            </span>
            <span className="text-xs font-medium text-augusta-green uppercase tracking-wider">
              Tournament Active
            </span>
          </div>

          {/* Tournament name - DOMINANT */}
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 tracking-tight">
            {activeTrip.name}
          </h1>

          {/* Location */}
          {activeTrip.location && (
            <div className="flex items-center gap-2 text-text-secondary mb-6">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{activeTrip.location}</span>
            </div>
          )}

          {/* Date range - subtle metadata */}
          <div className="flex items-center gap-2 text-text-tertiary text-xs mb-8">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {formatDate(activeTrip.startDate, 'short')} – {formatDate(activeTrip.endDate, 'short')}
            </span>
          </div>

          {/* Primary action - BOLD */}
          <button
            onClick={onResume}
            className={cn(
              'group/btn relative inline-flex items-center gap-3',
              'px-6 py-3.5 rounded-xl',
              'bg-augusta-green text-white font-semibold',
              'shadow-lg shadow-augusta-green/25',
              'hover:shadow-xl hover:shadow-augusta-green/30',
              'hover:bg-augusta-light',
              'active:scale-[0.98]',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-augusta-green focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base'
            )}
          >
            <Play className="h-5 w-5" />
            <span>Continue Scoring</span>
            <ChevronRight className="h-4 w-4 opacity-60 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // EMPTY STATE - "Ready to compete"
  return (
    <div className="command-card group relative overflow-hidden rounded-2xl">
      {/* Layered background */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated via-surface-raised to-surface-base" />
      <div className="absolute inset-0 bg-gradient-to-br from-augusta-green/5 via-transparent to-transparent" />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-augusta-green/10 to-transparent rounded-bl-full" />

      {/* Inner border */}
      <div className="absolute inset-[1px] rounded-2xl border border-white/5" />

      <div className="relative p-6 lg:p-8">
        {/* Trophy icon - refined */}
        <div className={cn(
          'inline-flex items-center justify-center',
          'h-14 w-14 rounded-xl mb-6',
          'bg-augusta-green/10 border border-augusta-green/20',
          'group-hover:bg-augusta-green/15 transition-colors duration-300'
        )}>
          <Trophy className="h-7 w-7 text-augusta-green" />
        </div>

        {/* Headline - confident, not instructional */}
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3 tracking-tight">
          The course awaits
        </h1>

        {/* Supporting text - one line, motivating */}
        <p className="text-text-secondary text-base mb-8 max-w-sm">
          Create your Ryder Cup tournament and start tracking every hole.
        </p>

        {/* Primary CTA - breathing glow effect */}
        <button
          onClick={onCreate}
          className={cn(
            'group/btn relative inline-flex items-center gap-3',
            'px-6 py-3.5 rounded-xl',
            'bg-augusta-green text-white font-semibold',
            'shadow-lg shadow-augusta-green/25',
            'hover:shadow-xl hover:shadow-augusta-green/30',
            'hover:bg-augusta-light',
            'active:scale-[0.98]',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-augusta-green focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
            // Breathing glow animation
            'before:absolute before:inset-0 before:rounded-xl before:bg-augusta-green/50 before:blur-xl before:animate-pulse-slow before:-z-10'
          )}
        >
          <Plus className="h-5 w-5" />
          <span>Start Tournament</span>
        </button>
      </div>
    </div>
  );
}

// ============================================
// SECONDARY TRIP CARD
// Quiet, recedes visually
// ============================================
interface RecentTripCardProps {
  trip: {
    id: string;
    name: string;
    location?: string;
    startDate: Date | string;
    endDate: Date | string;
  };
  onSelect: () => void;
}

function RecentTripCard({ trip, onSelect }: RecentTripCardProps) {
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const now = new Date();

  let status: 'active' | 'upcoming' | 'completed' = 'upcoming';
  if (now > endDate) status = 'completed';
  else if (now >= startDate) status = 'active';

  return (
    <button
      onClick={onSelect}
      className={cn(
        'group w-full text-left',
        'p-4 rounded-xl',
        'bg-surface-raised/50 hover:bg-surface-raised',
        'border border-surface-border/50 hover:border-surface-border',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-augusta-green'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-text-primary truncate text-sm">
              {trip.name}
            </h3>
            {status === 'active' && (
              <Badge variant="success" size="sm" dot pulse>Live</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-text-tertiary text-xs">
            {trip.location && (
              <span className="truncate">{trip.location}</span>
            )}
            <span>{formatDate(trip.startDate, 'short')}</span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-text-tertiary group-hover:text-text-secondary transition-colors flex-shrink-0" />
      </div>
    </button>
  );
}

// ============================================
// DEVELOPER TOOLS SECTION
// Hidden by default, whisper-quiet when shown
// ============================================
interface DevToolsProps {
  onLoadDemo: () => void;
  onClearData: () => void;
  isLoading: boolean;
}

function DevTools({ onLoadDemo, onClearData, isLoading }: DevToolsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-t border-surface-border/30 pt-4 mt-auto">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex items-center gap-2 text-text-tertiary hover:text-text-secondary',
          'text-xs transition-colors w-full justify-center'
        )}
      >
        <Settings className="h-3.5 w-3.5" />
        <span>Developer Tools</span>
        <ChevronDown className={cn(
          'h-3 w-3 transition-transform',
          isExpanded && 'rotate-180'
        )} />
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <button
            onClick={onLoadDemo}
            disabled={isLoading}
            className={cn(
              'w-full px-3 py-2 rounded-lg text-xs',
              'bg-surface-raised/50 hover:bg-surface-raised',
              'text-text-secondary hover:text-text-primary',
              'border border-surface-border/50',
              'transition-all duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-2'
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            {isLoading ? 'Loading...' : 'Load Demo Data'}
          </button>
          <button
            onClick={onClearData}
            className={cn(
              'w-full px-3 py-2 rounded-lg text-xs',
              'bg-transparent hover:bg-error/5',
              'text-text-tertiary hover:text-error/70',
              'border border-transparent hover:border-error/20',
              'transition-all duration-150',
              'flex items-center justify-center gap-2'
            )}
          >
            Clear All Data
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function HomePage() {
  const router = useRouter();
  const { loadTrip } = useTripStore();
  const { showToast } = useUIStore();
  const [isSeeding, setIsSeeding] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Get all trips
  const trips = useLiveQuery(
    () => db.trips.orderBy('startDate').reverse().toArray(),
    []
  );

  const handleTripSelect = async (tripId: string) => {
    await loadTrip(tripId);
    router.push('/score');
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const tripId = await seedDemoData();
      await loadTrip(tripId);
      showToast('success', 'Demo data loaded');
      router.push('/score');
    } catch (error) {
      showToast('error', 'Failed to load demo data');
      console.error(error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    try {
      await clearDemoData();
      showToast('info', 'All data cleared');
      setShowClearConfirm(false);
    } catch (error) {
      showToast('error', 'Failed to clear data');
      console.error(error);
    }
  };

  const isLoading = trips === undefined;
  const hasTrips = trips && trips.length > 0;

  // Find the most recent active trip, or the most recent trip
  const activeTrip = trips?.find(t => {
    const now = new Date();
    const start = new Date(t.startDate);
    const end = new Date(t.endDate);
    return now >= start && now <= end;
  }) || trips?.[0];

  const otherTrips = trips?.filter(t => t.id !== activeTrip?.id) || [];

  return (
    <AppShellNew headerTitle="Ryder Cup" showNav={true}>
      {/*
        ASYMMETRIC LAYOUT
        Desktop: Primary command card dominates left, secondary content right
        Mobile: Stack with clear primary/secondary distinction
      */}
      <div className="min-h-[calc(100vh-3.5rem-5rem)] lg:min-h-[calc(100vh-3.5rem)] flex flex-col">
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Desktop: Two-column asymmetric layout */}
            <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">

              {/* PRIMARY AREA - Left (spans 3 columns) */}
              <div className="lg:col-span-3 flex flex-col">
                {/* Loading skeleton */}
                {isLoading && (
                  <div className="command-card relative overflow-hidden rounded-2xl bg-surface-raised animate-pulse">
                    <div className="p-6 lg:p-8 space-y-4">
                      <div className="h-3 w-24 bg-surface-highlight rounded" />
                      <div className="h-8 w-64 bg-surface-highlight rounded" />
                      <div className="h-4 w-48 bg-surface-highlight rounded" />
                      <div className="h-12 w-40 bg-surface-highlight rounded-xl mt-6" />
                    </div>
                  </div>
                )}

                {/* Command Card */}
                {!isLoading && (
                  <CommandCard
                    hasActiveTrip={hasTrips ?? false}
                    activeTrip={activeTrip}
                    onResume={() => activeTrip && handleTripSelect(activeTrip.id)}
                    onCreate={() => router.push('/trip/new')}
                  />
                )}

                {/* Mobile: Show other trips below command card */}
                {!isLoading && otherTrips.length > 0 && (
                  <div className="mt-6 lg:hidden">
                    <h2 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3 px-1">
                      Recent Tournaments
                    </h2>
                    <div className="space-y-2">
                      {otherTrips.slice(0, 3).map(trip => (
                        <RecentTripCard
                          key={trip.id}
                          trip={trip}
                          onSelect={() => handleTripSelect(trip.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECONDARY AREA - Right (spans 2 columns) */}
              <div className="hidden lg:flex lg:col-span-2 flex-col">
                {/* Recent Trips Panel */}
                <div className={cn(
                  'flex-1 rounded-xl p-5',
                  'bg-surface-raised/30 border border-surface-border/30'
                )}>
                  {!isLoading && otherTrips.length > 0 ? (
                    <>
                      <h2 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-4">
                        Recent Tournaments
                      </h2>
                      <div className="space-y-2">
                        {otherTrips.slice(0, 4).map(trip => (
                          <RecentTripCard
                            key={trip.id}
                            trip={trip}
                            onSelect={() => handleTripSelect(trip.id)}
                          />
                        ))}
                      </div>
                    </>
                  ) : !isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                      <div className="h-10 w-10 rounded-lg bg-surface-highlight/50 flex items-center justify-center mb-3">
                        <Trophy className="h-5 w-5 text-text-tertiary" />
                      </div>
                      <p className="text-text-tertiary text-sm">
                        Your tournament history will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="animate-pulse space-y-3">
                      <div className="h-3 w-32 bg-surface-highlight rounded" />
                      <div className="h-16 bg-surface-highlight/50 rounded-xl" />
                      <div className="h-16 bg-surface-highlight/50 rounded-xl" />
                    </div>
                  )}

                  {/* Dev Tools - Desktop only, at bottom of secondary panel */}
                  <DevTools
                    onLoadDemo={handleSeedData}
                    onClearData={() => setShowClearConfirm(true)}
                    isLoading={isSeeding}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Dev Tools - Footer */}
        <div className="lg:hidden px-4 pb-4">
          <DevTools
            onLoadDemo={handleSeedData}
            onClearData={() => setShowClearConfirm(true)}
            isLoading={isSeeding}
          />
        </div>
      </div>

      {/* Confirm Clear Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearData}
        title="Clear all data?"
        description="This will permanently delete all trips, players, matches, and scores. This action cannot be undone."
        confirmLabel="Clear everything"
        cancelLabel="Cancel"
        variant="danger"
        confirmText="DELETE"
      />
    </AppShellNew>
  );
}
