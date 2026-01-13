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
  Database,
  Trash2,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

/**
 * MASTERS-INSPIRED HOME PAGE
 * Premium, polished, tournament-quality design
 */

// ============================================
// HERO SECTION - Grand entrance
// ============================================
function HeroSection() {
  return (
    <div className="text-center py-12 px-4">
      {/* Trophy Icon - Gold accent */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C4A747] to-[#A38B2D] mb-6 shadow-lg shadow-[#C4A747]/30">
        <Trophy className="h-10 w-10 text-white" />
      </div>

      {/* Title - Serif elegance */}
      <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#F5F1E8] mb-3">
        Ryder Cup Tracker
      </h1>

      {/* Subtitle */}
      <p className="text-[#B8B0A0] text-lg max-w-md mx-auto">
        Score your matches, track standings, manage your tournament
      </p>
    </div>
  );
}

// ============================================
// TRIP CARD - Premium card styling
// ============================================
interface TripCardProps {
  trip: {
    id: string;
    name: string;
    location?: string;
    startDate: Date | string;
    endDate: Date | string;
  };
  onSelect: (id: string) => void;
}

function TripCard({ trip, onSelect }: TripCardProps) {
  return (
    <button
      onClick={() => onSelect(trip.id)}
      className={cn(
        'group w-full text-left',
        'p-5 rounded-xl',
        // Visible card background
        'bg-[#1E1C18]',
        // Gold left border accent
        'border-l-4 border-l-[#C4A747] border border-[#3A3530]',
        // Hover effects
        'hover:bg-[#252320] hover:border-[#C4A747]/50',
        'active:scale-[0.99]',
        'transition-all duration-200'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#F5F1E8] text-lg truncate">
            {trip.name}
          </h3>
          {trip.location && (
            <div className="flex items-center gap-1.5 text-[#807868] mt-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-sm truncate">{trip.location}</span>
            </div>
          )}
        </div>
        {/* Date badge */}
        <div className="flex items-center gap-2 ml-4">
          <span className="text-[#C4A747] text-sm font-medium">
            {formatDate(trip.startDate, 'short')}
          </span>
          <ChevronRight className="h-5 w-5 text-[#807868] group-hover:text-[#C4A747] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </button>
  );
}

// ============================================
// DEVELOPER TOOLS SECTION
// ============================================
interface DevToolsProps {
  onLoadDemo: () => void;
  onClearData: () => void;
  isLoading: boolean;
}

function DevToolsSection({ onLoadDemo, onClearData, isLoading }: DevToolsProps) {
  return (
    <div className="mt-12 pt-8 border-t border-[#3A3530]">
      <h3 className="text-[#807868] text-sm font-medium mb-4">Developer Tools</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onLoadDemo}
          disabled={isLoading}
          className={cn(
            'flex items-center justify-center gap-2',
            'p-4 rounded-xl',
            'bg-[#1E1C18] border border-[#3A3530]',
            'text-[#B8B0A0] hover:text-[#F5F1E8]',
            'hover:bg-[#252320] hover:border-[#006747]',
            'disabled:opacity-50',
            'transition-all duration-200'
          )}
        >
          <Database className="h-4 w-4" />
          <span className="text-sm font-medium">Load Demo</span>
        </button>
        <button
          onClick={onClearData}
          disabled={isLoading}
          className={cn(
            'flex items-center justify-center gap-2',
            'p-4 rounded-xl',
            'bg-[#D84C6F]/10 border border-[#D84C6F]/30',
            'text-[#D84C6F]',
            'hover:bg-[#D84C6F]/20',
            'disabled:opacity-50',
            'transition-all duration-200'
          )}
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-sm font-medium">Clear Data</span>
        </button>
      </div>
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

  const handleSelectTrip = async (tripId: string) => {
    await loadTrip(tripId);
    router.push('/standings');
  };

  const handleCreateTrip = () => {
    router.push('/trip/new');
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

  const handleClearData = async () => {
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
      <div className="min-h-screen bg-[#0F0D0A]">
        <div className="max-w-2xl mx-auto px-4 pb-24">
          {/* Hero Section */}
          <HeroSection />

          {/* Trips Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-[#F5F1E8]">Your Trips</h2>
              <button
                onClick={handleCreateTrip}
                className="flex items-center gap-1.5 text-[#C4A747] text-sm font-medium hover:text-[#D4BC6A] transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Trip</span>
              </button>
            </div>

            {trips && trips.length > 0 ? (
              <div className="space-y-3">
                {trips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onSelect={handleSelectTrip}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-6 rounded-2xl bg-[#1A1814] border border-dashed border-[#3A3530]">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#252320] mb-4">
                  <Flag className="h-7 w-7 text-[#807868]" />
                </div>
                <h3 className="font-serif text-lg text-[#F5F1E8] mb-2">No tournaments yet</h3>
                <p className="text-[#807868] text-sm mb-6">Create your first tournament to get started</p>
                <button
                  onClick={handleCreateTrip}
                  className={cn(
                    'inline-flex items-center gap-2',
                    'px-6 py-3 rounded-xl',
                    'bg-gradient-to-r from-[#C4A747] to-[#A38B2D]',
                    'text-[#0F0D0A] font-semibold',
                    'shadow-lg shadow-[#C4A747]/20',
                    'hover:shadow-xl hover:shadow-[#C4A747]/30',
                    'active:scale-[0.98]',
                    'transition-all duration-200'
                  )}
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Tournament</span>
                </button>
              </div>
            )}
          </section>

          {/* Developer Tools */}
          <DevToolsSection
            onLoadDemo={handleLoadDemo}
            onClearData={() => setShowClearConfirm(true)}
            isLoading={isDemoLoading}
          />
        </div>

        {/* Clear Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          onConfirm={handleClearData}
          title="Clear All Data"
          description="This will permanently delete all tournaments, players, and scores. This action cannot be undone."
          confirmLabel="Clear Everything"
          variant="danger"
        />
      </div>
    </AppShellNew>
  );
}
