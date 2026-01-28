'use client';

import { Home, Target, Users, Trophy, MoreHorizontal } from 'lucide-react';

/**
 * Standard Page Loading Skeleton
 *
 * Provides consistent loading states across all pages.
 * Matches the premium design system aesthetic.
 */

interface PageLoadingSkeletonProps {
  /** Title shown in the skeleton header */
  title?: string;
  /** Whether to show the back button */
  showBackButton?: boolean;
  /** Number of content cards to show */
  cardCount?: number;
  /** Variant for different page layouts */
  variant?: 'default' | 'list' | 'grid' | 'detail' | 'form';
}

export function PageLoadingSkeleton({
  title = 'Loading...',
  showBackButton = true,
  cardCount = 4,
  variant = 'default',
}: PageLoadingSkeletonProps) {
  return (
    <div
      className="min-h-screen pb-nav page-premium-enter texture-grain"
      style={{ background: 'var(--canvas)' }}
      role="progressbar"
      aria-busy="true"
      aria-label={title}
    >
      {/* Header Skeleton */}
      <header className="header-premium">
        <div className="container-editorial flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && <div className="w-8 h-8 rounded-lg skeleton-pulse" aria-hidden />}
            <div>
              <div className="w-24 h-4 rounded skeleton-pulse mb-1" aria-hidden />
              <div className="w-16 h-3 rounded skeleton-pulse" aria-hidden />
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg skeleton-pulse" aria-hidden />
        </div>
      </header>

      {/* Content Skeleton */}
      <main className="container-editorial" style={{ paddingTop: 'var(--space-4)' }}>
        {variant === 'default' && <DefaultSkeleton cardCount={cardCount} />}
        {variant === 'list' && <ListSkeleton cardCount={cardCount} />}
        {variant === 'grid' && <GridSkeleton cardCount={cardCount} />}
        {variant === 'detail' && <DetailSkeleton />}
        {variant === 'form' && <FormSkeleton />}
      </main>

      {/* Bottom Navigation Skeleton */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg"
        style={{
          background: 'rgba(253, 252, 250, 0.85)',
          borderTop: '1px solid var(--divider)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex justify-around items-center h-16">
          {[Home, Target, Users, Trophy, MoreHorizontal].map((Icon, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5 p-2 opacity-40">
              <Icon size={22} style={{ color: 'var(--ink-secondary)' }} />
              <div className="w-8 h-2 rounded skeleton-pulse" aria-hidden />
            </div>
          ))}
        </div>
      </nav>

      {/* Screen reader text */}
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
}

function DefaultSkeleton({ cardCount }: { cardCount: number }) {
  return (
    <>
      {/* Hero card */}
      <div className="card-luxury p-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="w-24 h-6 rounded skeleton-pulse" aria-hidden />
          <div className="w-16 h-6 rounded skeleton-pulse" aria-hidden />
        </div>
        <div className="w-full h-4 rounded-full skeleton-pulse mb-3" aria-hidden />
        <div className="w-3/4 h-3 rounded skeleton-pulse" aria-hidden />
      </div>

      {/* Content cards */}
      <div className="space-y-3">
        {Array.from({ length: cardCount }).map((_, i) => (
          <div key={i} className="card-luxury p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl skeleton-pulse" aria-hidden />
            <div className="flex-1">
              <div className="w-32 h-4 rounded skeleton-pulse mb-2" aria-hidden />
              <div className="w-20 h-3 rounded skeleton-pulse" aria-hidden />
            </div>
            <div className="w-8 h-8 rounded-lg skeleton-pulse" aria-hidden />
          </div>
        ))}
      </div>
    </>
  );
}

function ListSkeleton({ cardCount }: { cardCount: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: cardCount }).map((_, i) => (
        <div key={i} className="card-luxury p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full skeleton-pulse" aria-hidden />
            <div className="flex-1">
              <div className="w-40 h-4 rounded skeleton-pulse mb-2" aria-hidden />
              <div className="w-24 h-3 rounded skeleton-pulse" aria-hidden />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GridSkeleton({ cardCount }: { cardCount: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: cardCount }).map((_, i) => (
        <div key={i} className="card-luxury aspect-square skeleton-pulse" aria-hidden />
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <>
      {/* Hero section */}
      <div className="card-luxury p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl skeleton-pulse" aria-hidden />
          <div>
            <div className="w-40 h-5 rounded skeleton-pulse mb-2" aria-hidden />
            <div className="w-24 h-3 rounded skeleton-pulse" aria-hidden />
          </div>
        </div>
        <div className="w-full h-20 rounded-xl skeleton-pulse" aria-hidden />
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-luxury p-4 text-center">
            <div className="w-12 h-6 rounded skeleton-pulse mx-auto mb-2" aria-hidden />
            <div className="w-16 h-3 rounded skeleton-pulse mx-auto" aria-hidden />
          </div>
        ))}
      </div>

      {/* Content section */}
      <div className="card-luxury p-4">
        <div className="w-24 h-4 rounded skeleton-pulse mb-4" aria-hidden />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full h-3 rounded skeleton-pulse" aria-hidden />
          ))}
        </div>
      </div>
    </>
  );
}

function FormSkeleton() {
  return (
    <div className="card-luxury p-6">
      <div className="w-32 h-5 rounded skeleton-pulse mb-6" aria-hidden />

      {/* Form fields */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="w-20 h-3 rounded skeleton-pulse mb-2" aria-hidden />
            <div className="w-full h-12 rounded-xl skeleton-pulse" aria-hidden />
          </div>
        ))}
      </div>

      {/* Submit button */}
      <div className="w-full h-12 rounded-xl skeleton-pulse mt-6" aria-hidden />
    </div>
  );
}

/**
 * Inline loading state for smaller sections
 */
const LINE_WIDTHS = ['100%', '80%', '90%', '75%', '85%', '95%', '70%', '88%'];

export function InlineLoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse" role="progressbar" aria-busy="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded skeleton-pulse mb-2"
          style={{ width: LINE_WIDTHS[i % LINE_WIDTHS.length] }}
          aria-hidden
        />
      ))}
    </div>
  );
}

/**
 * Card loading skeleton
 */
export function CardLoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`card-luxury p-4 ${className}`} role="progressbar" aria-busy="true">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl skeleton-pulse" aria-hidden />
        <div className="flex-1">
          <div className="w-32 h-4 rounded skeleton-pulse mb-2" aria-hidden />
          <div className="w-20 h-3 rounded skeleton-pulse" aria-hidden />
        </div>
      </div>
    </div>
  );
}
