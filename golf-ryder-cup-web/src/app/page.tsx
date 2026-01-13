'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { seedDemoData, clearDemoData } from '@/lib/db/seed';
import { useTripStore, useUIStore } from '@/lib/stores';
import { ConfirmDialog } from '@/components/ui';
import { Trophy, Plus, ChevronRight, MapPin, Flag, Database, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

/**
 * HOME PAGE - Clean Slate
 * Minimal, functional starting point for new UI
 */
export default function HomePage() {
  const router = useRouter();
  const { loadTrip } = useTripStore();
  const { showToast } = useUIStore();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const trips = useLiveQuery(
    () => db.trips.orderBy('startDate').reverse().toArray(),
    []
  );

  const handleSelectTrip = async (tripId: string) => {
    await loadTrip(tripId);
    router.push('/standings');
  };

  const handleCreateTrip = () => router.push('/trip/new');

  const handleLoadDemo = async () => {
    setIsDemoLoading(true);
    try {
      await seedDemoData();
      showToast('success', 'Demo tournament loaded');
    } catch (error) {
      showToast('error', 'Failed to load demo data');
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
    } finally {
      setIsDemoLoading(false);
      setShowClearConfirm(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Simple Header */}
      <header style={{
        padding: '16px 20px',
        borderBottom: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
          Ryder Cup Tracker
        </h1>
        <Trophy style={{ width: 24, height: 24, color: '#888' }} />
      </header>

      {/* Main Content */}
      <main style={{ padding: '24px 20px', maxWidth: '600px', margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            backgroundColor: '#222',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Trophy style={{ width: 40, height: 40, color: '#666' }} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: 8 }}>
            Ryder Cup Tracker
          </h2>
          <p style={{ color: '#888', fontSize: '16px' }}>
            Score matches, track standings, manage tournaments
          </p>
        </div>

        {/* Trips Section */}
        <section>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Your Trips</h3>
            <button
              onClick={handleCreateTrip}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Plus style={{ width: 16, height: 16 }} />
              New Trip
            </button>
          </div>

          {trips && trips.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => handleSelectTrip(trip.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '16px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>
                      {trip.name}
                    </div>
                    {trip.location && (
                      <div style={{
                        fontSize: '14px',
                        color: '#888',
                        marginTop: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        <MapPin style={{ width: 14, height: 14 }} />
                        {trip.location}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '14px', color: '#888' }}>
                      {formatDate(trip.startDate, 'short')}
                    </span>
                    <ChevronRight style={{ width: 20, height: 20, color: '#666' }} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              backgroundColor: '#111',
              borderRadius: 12,
              border: '1px dashed #333',
            }}>
              <Flag style={{ width: 32, height: 32, color: '#666', marginBottom: 16 }} />
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 8 }}>
                No tournaments yet
              </h4>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: 20 }}>
                Create your first tournament to get started
              </p>
              <button
                onClick={handleCreateTrip}
                style={{
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Plus style={{ width: 18, height: 18 }} />
                Create Tournament
              </button>
            </div>
          )}
        </section>

        {/* Dev Tools */}
        <section style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #222' }}>
          <h4 style={{ fontSize: '14px', color: '#666', marginBottom: 16 }}>Developer Tools</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              onClick={handleLoadDemo}
              disabled={isDemoLoading}
              style={{
                padding: '16px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: 8,
                color: '#888',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: isDemoLoading ? 0.5 : 1,
              }}
            >
              <Database style={{ width: 16, height: 16 }} />
              Load Demo
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={isDemoLoading}
              style={{
                padding: '16px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 8,
                color: '#ef4444',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: isDemoLoading ? 0.5 : 1,
              }}
            >
              <Trash2 style={{ width: 16, height: 16 }} />
              Clear Data
            </button>
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        backgroundColor: '#0a0a0a',
        borderTop: '1px solid #222',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 16px',
      }}>
        {['Home', 'Score', 'Matchups', 'Standings', 'More'].map((label, i) => (
          <button
            key={label}
            onClick={() => {
              if (label === 'Home') router.push('/');
              else if (label === 'Score') router.push('/score');
              else if (label === 'Matchups') router.push('/matchups');
              else if (label === 'Standings') router.push('/standings');
              else if (label === 'More') router.push('/more');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: i === 0 ? '#3b82f6' : '#666',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <div style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              backgroundColor: i === 0 ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            }} />
            {label}
          </button>
        ))}
      </nav>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearData}
        title="Clear All Data"
        description="This will permanently delete all tournaments, players, and scores."
        confirmLabel="Clear Everything"
        variant="danger"
      />
    </div>
  );
}
