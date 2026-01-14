/**
 * Score Celebration Component
 *
 * Visual feedback for scoring moments including:
 * - Hole win celebrations
 * - Match status changes (dormie, all square)
 * - Match completion celebrations
 * - Birdie/eagle special effects
 *
 * Features:
 * - Contextual celebration intensity
 * - Team-colored effects
 * - Haptic feedback integration
 * - Sound effect triggers (optional)
 */

'use client';

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CelebrationParticles } from './ConfettiCannon';

// ============================================
// TYPES
// ============================================

export type CelebrationType =
  | 'hole_win'
  | 'hole_halved'
  | 'birdie'
  | 'eagle'
  | 'ace'
  | 'dormie'
  | 'all_square'
  | 'match_win'
  | 'comeback';

export interface CelebrationEvent {
  type: CelebrationType;
  team?: 'A' | 'B';
  message?: string;
  intensity?: 'low' | 'medium' | 'high';
}

interface CelebrationContextValue {
  celebrate: (event: CelebrationEvent) => void;
  isActive: boolean;
}

// ============================================
// CONTEXT
// ============================================

const CelebrationContext = createContext<CelebrationContextValue | null>(null);

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebration must be used within CelebrationProvider');
  }
  return context;
}

// ============================================
// CELEBRATION PROVIDER
// ============================================

interface CelebrationProviderProps {
  children: ReactNode;
  enableHaptics?: boolean;
  enableSounds?: boolean;
}

export function CelebrationProvider({
  children,
  enableHaptics = true,
}: CelebrationProviderProps) {
  const [activeEvent, setActiveEvent] = useState<CelebrationEvent | null>(null);
  const [isActive, setIsActive] = useState(false);

  const celebrate = useCallback((event: CelebrationEvent) => {
    setActiveEvent(event);
    setIsActive(true);

    // Trigger haptic feedback
    if (enableHaptics && 'vibrate' in navigator) {
      const pattern = getHapticPattern(event.type, event.intensity);
      navigator.vibrate(pattern);
    }

    // Auto-dismiss
    const duration = getCelebrationDuration(event.type);
    setTimeout(() => {
      setIsActive(false);
      setTimeout(() => setActiveEvent(null), 300);
    }, duration);
  }, [enableHaptics]);

  return (
    <CelebrationContext.Provider value={{ celebrate, isActive }}>
      {children}
      {activeEvent && (
        <CelebrationOverlay
          event={activeEvent}
          isActive={isActive}
        />
      )}
    </CelebrationContext.Provider>
  );
}

// ============================================
// CELEBRATION OVERLAY
// ============================================

interface CelebrationOverlayProps {
  event: CelebrationEvent;
  isActive: boolean;
}

function CelebrationOverlay({ event, isActive }: CelebrationOverlayProps) {
  const config = getCelebrationConfig(event);

  return (
    <div
      className={cn(
        'fixed inset-0 pointer-events-none z-50 flex items-center justify-center transition-opacity duration-300',
        isActive ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Background Flash */}
      {config.showFlash && (
        <div
          className="absolute inset-0 animate-flash"
          style={{
            background: `radial-gradient(circle at center, ${config.color}30 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Particles */}
      {config.showParticles && (
        <CelebrationParticles
          isActive={isActive}
          type={config.particleType}
          color={config.color}
        />
      )}

      {/* Message */}
      {config.message && (
        <div
          className={cn(
            'text-center transition-all duration-500',
            isActive
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-90 translate-y-4'
          )}
        >
          {config.icon && (
            <div
              className="text-5xl mb-2 animate-bounce"
              style={{ animationDuration: '600ms' }}
            >
              {config.icon}
            </div>
          )}
          <p
            className="text-2xl font-bold uppercase tracking-wider"
            style={{
              color: config.color,
              textShadow: `0 0 20px ${config.color}50`,
            }}
          >
            {config.message}
          </p>
          {event.message && (
            <p
              className="text-sm mt-1"
              style={{ color: 'white' }}
            >
              {event.message}
            </p>
          )}
        </div>
      )}

      {/* Side Burst for Hole Win */}
      {event.type === 'hole_win' && (
        <HoleWinBurst team={event.team} isActive={isActive} />
      )}

      {/* Special Effects */}
      {event.type === 'ace' && <AceEffect isActive={isActive} />}
      {event.type === 'eagle' && <EagleEffect isActive={isActive} />}
    </div>
  );
}

// ============================================
// HOLE WIN BURST
// ============================================

interface HoleWinBurstProps {
  team?: 'A' | 'B';
  isActive: boolean;
}

function HoleWinBurst({ team, isActive }: HoleWinBurstProps) {
  const color = team === 'A' ? 'var(--team-usa)' : 'var(--team-europe)';

  return (
    <>
      {/* Left burst */}
      <div
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 w-32 h-64 transition-all duration-500',
          isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'
        )}
        style={{
          background: `linear-gradient(90deg, ${color}50 0%, transparent 100%)`,
        }}
      />

      {/* Right burst */}
      <div
        className={cn(
          'absolute right-0 top-1/2 -translate-y-1/2 w-32 h-64 transition-all duration-500',
          isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
        )}
        style={{
          background: `linear-gradient(-90deg, ${color}50 0%, transparent 100%)`,
        }}
      />
    </>
  );
}

// ============================================
// ACE EFFECT
// ============================================

function AceEffect({ isActive }: { isActive: boolean }) {
  const rings = [0, 1, 2, 3];

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {rings.map((i) => (
        <div
          key={i}
          className={cn(
            'absolute w-32 h-32 rounded-full border-4 transition-all',
            isActive ? 'animate-ring-expand' : 'opacity-0'
          )}
          style={{
            borderColor: 'var(--warning)',
            animationDelay: `${i * 150}ms`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// EAGLE EFFECT
// ============================================

function EagleEffect({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center transition-all duration-700',
        isActive ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div
        className="text-8xl animate-eagle-swoop"
        style={{ filter: 'drop-shadow(0 0 20px rgba(196, 167, 71, 0.5))' }}
      >
        🦅
      </div>
    </div>
  );
}

// ============================================
// SCORE BADGE WITH CELEBRATION
// ============================================

interface ScoreBadgeProps {
  score: number;
  previousScore?: number;
  team: 'A' | 'B';
  isWinning?: boolean;
  showAnimation?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ScoreBadge({
  score,
  previousScore,
  team,
  isWinning = false,
  showAnimation = true,
  size = 'md',
  className,
}: ScoreBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const teamColor = team === 'A' ? 'var(--team-usa)' : 'var(--team-europe)';

  useEffect(() => {
    if (showAnimation && previousScore !== undefined && score !== previousScore) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [score, previousScore, showAnimation]);

  const sizeClasses = {
    sm: 'text-lg w-8 h-8',
    md: 'text-2xl w-12 h-12',
    lg: 'text-4xl w-16 h-16',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl flex items-center justify-center font-bold transition-all',
        sizeClasses[size],
        isAnimating && 'animate-score-pop',
        isWinning && 'ring-2 ring-warning ring-offset-2 ring-offset-canvas',
        className
      )}
      style={{
        background: isWinning ? teamColor : 'var(--surface)',
        color: isWinning ? 'white' : teamColor,
      }}
    >
      {score}

      {/* Glow effect when winning */}
      {isWinning && (
        <div
          className="absolute inset-0 rounded-xl animate-pulse"
          style={{
            boxShadow: `0 0 20px ${teamColor}50`,
          }}
        />
      )}

      {/* Particles on score change */}
      {isAnimating && (
        <CelebrationParticles
          isActive
          type="sparkle"
          color={teamColor}
        />
      )}
    </div>
  );
}

// ============================================
// MATCH STATUS INDICATOR
// ============================================

interface MatchStatusIndicatorProps {
  status: 'in_progress' | 'dormie' | 'all_square' | 'completed';
  leader?: 'A' | 'B';
  margin?: number;
  className?: string;
}

export function MatchStatusIndicator({
  status,
  leader,
  margin = 0,
  className,
}: MatchStatusIndicatorProps) {
  const config = getStatusConfig(status, leader, margin);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
        status === 'dormie' && 'animate-pulse',
        className
      )}
      style={{
        background: `${config.color}20`,
        color: config.color,
      }}
    >
      {config.icon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </div>
  );
}

// ============================================
// HOLE RESULT INDICATOR
// ============================================

interface HoleResultProps {
  result: 'win' | 'loss' | 'halved';
  team: 'A' | 'B';
  strokes?: number;
  parRelative?: number;
  animate?: boolean;
  className?: string;
}

export function HoleResult({
  result,
  team,
  strokes,
  parRelative,
  animate = true,
  className,
}: HoleResultProps) {
  const teamColor = team === 'A' ? 'var(--team-usa)' : 'var(--team-europe)';

  const config = {
    win: {
      icon: '●',
      bg: teamColor,
      text: 'white',
    },
    loss: {
      icon: '○',
      bg: 'var(--surface)',
      text: 'var(--ink-tertiary)',
    },
    halved: {
      icon: '◐',
      bg: 'var(--surface)',
      text: 'var(--ink-secondary)',
    },
  };

  const { icon, bg, text } = config[result];

  return (
    <div
      className={cn(
        'relative w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all',
        animate && result === 'win' && 'animate-score-pop',
        className
      )}
      style={{
        background: bg,
        color: text,
        border: result !== 'win' ? '1px solid var(--rule)' : undefined,
      }}
    >
      {strokes ?? icon}

      {/* Par indicator */}
      {parRelative !== undefined && parRelative !== 0 && (
        <span
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
          style={{
            background: parRelative < 0 ? 'var(--error)' : 'var(--success)',
            color: 'white',
          }}
        >
          {parRelative > 0 ? `+${parRelative}` : parRelative}
        </span>
      )}
    </div>
  );
}

// ============================================
// HELPERS
// ============================================

function getCelebrationConfig(event: CelebrationEvent) {
  const teamColor = event.team === 'A' ? 'var(--team-usa)' : 'var(--team-europe)';

  switch (event.type) {
    case 'hole_win':
      return {
        color: teamColor,
        message: 'HOLE WON!',
        icon: '⛳',
        showFlash: true,
        showParticles: true,
        particleType: 'sparkle' as const,
      };
    case 'hole_halved':
      return {
        color: 'var(--ink-secondary)',
        message: 'HALVED',
        icon: '🤝',
        showFlash: false,
        showParticles: false,
        particleType: 'sparkle' as const,
      };
    case 'birdie':
      return {
        color: 'var(--success)',
        message: 'BIRDIE!',
        icon: '🐦',
        showFlash: true,
        showParticles: true,
        particleType: 'star' as const,
      };
    case 'eagle':
      return {
        color: 'var(--warning)',
        message: 'EAGLE!',
        icon: '🦅',
        showFlash: true,
        showParticles: true,
        particleType: 'burst' as const,
      };
    case 'ace':
      return {
        color: 'var(--warning)',
        message: 'HOLE IN ONE!',
        icon: '🏆',
        showFlash: true,
        showParticles: true,
        particleType: 'burst' as const,
      };
    case 'dormie':
      return {
        color: 'var(--error)',
        message: 'DORMIE',
        icon: '⚠️',
        showFlash: true,
        showParticles: false,
        particleType: 'sparkle' as const,
      };
    case 'all_square':
      return {
        color: 'var(--masters)',
        message: 'ALL SQUARE',
        icon: '⚖️',
        showFlash: true,
        showParticles: false,
        particleType: 'sparkle' as const,
      };
    case 'match_win':
      return {
        color: teamColor,
        message: 'MATCH WON!',
        icon: '🏆',
        showFlash: true,
        showParticles: true,
        particleType: 'burst' as const,
      };
    case 'comeback':
      return {
        color: 'var(--masters)',
        message: 'COMEBACK!',
        icon: '🔥',
        showFlash: true,
        showParticles: true,
        particleType: 'star' as const,
      };
    default:
      return {
        color: 'var(--ink-secondary)',
        message: null,
        icon: null,
        showFlash: false,
        showParticles: false,
        particleType: 'sparkle' as const,
      };
  }
}

function getCelebrationDuration(type: CelebrationType): number {
  switch (type) {
    case 'ace':
      return 3000;
    case 'eagle':
    case 'match_win':
      return 2500;
    case 'birdie':
    case 'dormie':
    case 'comeback':
      return 2000;
    default:
      return 1500;
  }
}

function getHapticPattern(type: CelebrationType, intensity?: 'low' | 'medium' | 'high'): number[] {
  const base = intensity === 'high' ? 100 : intensity === 'medium' ? 50 : 25;

  switch (type) {
    case 'ace':
      return [base, 50, base, 50, base, 50, base * 2];
    case 'eagle':
    case 'match_win':
      return [base, 50, base, 50, base * 1.5];
    case 'birdie':
      return [base, 50, base * 1.5];
    default:
      return [base];
  }
}

function getStatusConfig(
  status: string,
  leader?: 'A' | 'B',
  margin?: number
) {
  switch (status) {
    case 'dormie':
      return {
        label: 'DORMIE',
        color: 'var(--error)',
        icon: '⚠️',
      };
    case 'all_square':
      return {
        label: 'ALL SQUARE',
        color: 'var(--masters)',
        icon: '⚖️',
      };
    case 'completed':
      return {
        label: leader ? `${leader === 'A' ? 'USA' : 'EUR'} wins` : 'Complete',
        color: leader === 'A' ? 'var(--team-usa)' : 'var(--team-europe)',
        icon: '🏆',
      };
    default:
      if (leader && margin) {
        return {
          label: `${leader === 'A' ? 'USA' : 'EUR'} ${margin} UP`,
          color: leader === 'A' ? 'var(--team-usa)' : 'var(--team-europe)',
          icon: null,
        };
      }
      return {
        label: 'In Progress',
        color: 'var(--ink-secondary)',
        icon: null,
      };
  }
}

export default CelebrationProvider;
