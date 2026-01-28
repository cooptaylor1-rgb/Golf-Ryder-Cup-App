'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Detect if running on iOS Safari
 */
function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const webkit = /WebKit/.test(ua);
  const notCriOS = !/CriOS/.test(ua);

  return iOS && webkit && notCriOS;
}

/**
 * Detect if running as installed PWA (standalone mode)
 */
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

interface UseSwipeBackProtectionOptions {
  /** Whether protection is enabled (default: true on iOS Safari) */
  enabled?: boolean;
  /** Width of the edge zone to protect in pixels (default: 30) */
  edgeWidth?: number;
  /** Callback when a swipe-back attempt is blocked */
  onBlock?: () => void;
}

/**
 * Hook to protect against accidental iOS Safari swipe-back navigation
 *
 * iOS Safari uses edge swipes (from the left/right edge) for back/forward navigation.
 * This can interfere with horizontal swipe gestures in your app.
 *
 * This hook:
 * - Detects touches that start within the edge zone
 * - Prevents horizontal panning from triggering browser navigation
 * - Only blocks when the touch appears to be horizontal (not scrolling)
 * - Does NOT prevent intentional back navigation (quick edge swipes)
 *
 * Note: In standalone PWA mode, iOS automatically disables the swipe-back
 * gesture, so this hook is less critical but still useful for Safari.
 */
export function useSwipeBackProtection(
  containerRef: React.RefObject<HTMLElement | null>,
  options: UseSwipeBackProtectionOptions = {}
) {
  const { enabled = isIOSSafari() && !isStandalone(), edgeWidth = 30, onBlock } = options;

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isBlockingRef = useRef(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;

      const touch = e.touches[0];
      const screenWidth = window.innerWidth;

      // Check if touch started near left or right edge
      const isNearLeftEdge = touch.clientX < edgeWidth;
      const isNearRightEdge = touch.clientX > screenWidth - edgeWidth;

      if (isNearLeftEdge || isNearRightEdge) {
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        isBlockingRef.current = false;
      } else {
        touchStartRef.current = null;
      }
    },
    [enabled, edgeWidth]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !touchStartRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // Check if this is a horizontal swipe (not scrolling)
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) * 1.5;

      // Only block if:
      // 1. Started near edge
      // 2. Moving horizontally
      // 3. Has moved at least 10px (to distinguish from taps)
      if (isHorizontalSwipe && Math.abs(deltaX) > 10) {
        // Prevent the default browser swipe-back behavior
        e.preventDefault();

        if (!isBlockingRef.current) {
          isBlockingRef.current = true;
          onBlock?.();
        }
      }
    },
    [enabled, onBlock]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    isBlockingRef.current = false;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    // Use capture phase to intercept before browser handles it
    // passive: false allows us to call preventDefault()
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [containerRef, enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isIOSSafari: isIOSSafari(),
    isStandalone: isStandalone(),
    isProtectionActive: enabled,
  };
}

/**
 * CSS styles to prevent overscroll/bounce navigation in Safari
 * Apply these to the container element via className
 */
export const swipeBackProtectionStyles = {
  // Prevent horizontal overscroll which can trigger browser navigation
  overscrollBehaviorX: 'contain',
  // Prevent the whole page from bouncing
  overscrollBehavior: 'contain',
  // Ensure touch events work properly
  touchAction: 'pan-y pinch-zoom',
  // Disable iOS elastic scrolling that can interfere
  WebkitOverflowScrolling: 'touch',
} as const;

/**
 * Higher-order component wrapper for swipe-back protection
 * Wraps content in a div that prevents edge swipes
 */
interface SwipeBackProtectorProps {
  children: React.ReactNode;
  className?: string;
  /** Whether to show a visual indicator when blocking */
  showBlockIndicator?: boolean;
}

export function SwipeBackProtector({
  children,
  className = '',
  showBlockIndicator = false,
}: SwipeBackProtectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isProtectionActive } = useSwipeBackProtection(containerRef);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        overscrollBehaviorX: 'contain',
        touchAction: 'pan-y pinch-zoom',
      }}
    >
      {children}

      {/* Visual edge indicators (optional) */}
      {showBlockIndicator && isProtectionActive && (
        <>
          {/* Left edge indicator */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-masters/20 to-transparent pointer-events-none"
            aria-hidden
          />
          {/* Right edge indicator */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-masters/20 to-transparent pointer-events-none"
            aria-hidden
          />
        </>
      )}
    </div>
  );
}
