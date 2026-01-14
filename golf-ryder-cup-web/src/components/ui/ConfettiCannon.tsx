/**
 * Confetti Cannon Component
 *
 * Celebratory particle effects for victory moments including:
 * - Match wins
 * - Tournament victories
 * - Achievement unlocks
 * - Milestone celebrations
 *
 * Features:
 * - Customizable colors (team-themed)
 * - Multiple burst patterns
 * - Performance-optimized with CSS animations
 * - Auto-cleanup after animation
 */

'use client';

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export type ConfettiTheme = 'masters' | 'usa' | 'europe' | 'gold' | 'rainbow';
export type BurstPattern = 'cannon' | 'fireworks' | 'shower' | 'explosion';

interface ConfettiPiece {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
  duration: number;
  shape: 'square' | 'circle' | 'ribbon';
}

interface ConfettiOptions {
  theme?: ConfettiTheme;
  pattern?: BurstPattern;
  particleCount?: number;
  spread?: number;
  startX?: number;
  startY?: number;
  duration?: number;
}

interface ConfettiContextValue {
  fire: (options?: ConfettiOptions) => void;
  fireVictory: () => void;
  fireAchievement: () => void;
  fireMatchWin: (team: 'usa' | 'europe') => void;
}

// ============================================
// CONTEXT
// ============================================

const ConfettiContext = createContext<ConfettiContextValue | null>(null);

export function useConfetti() {
  const context = useContext(ConfettiContext);
  if (!context) {
    throw new Error('useConfetti must be used within ConfettiProvider');
  }
  return context;
}

// ============================================
// THEME COLORS
// ============================================

const themeColors: Record<ConfettiTheme, string[]> = {
  masters: ['#006747', '#C4A747', '#FFFFFF', '#1A472A', '#FFD700'],
  usa: ['#B22234', '#FFFFFF', '#3C3B6E', '#E31B23', '#002868'],
  europe: ['#003399', '#FFD700', '#FFFFFF', '#0052B4', '#F0E68C'],
  gold: ['#FFD700', '#FFA500', '#DAA520', '#F0E68C', '#FFDF00'],
  rainbow: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
};

// ============================================
// CONFETTI PROVIDER
// ============================================

interface ConfettiProviderProps {
  children: ReactNode;
}

export function ConfettiProvider({ children }: ConfettiProviderProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  const fire = useCallback((options: ConfettiOptions = {}) => {
    const {
      theme = 'masters',
      pattern = 'cannon',
      particleCount = 50,
      spread = 70,
      startX = 50,
      startY = 50,
      duration = 3000,
    } = options;

    const colors = themeColors[theme];
    const newPieces: ConfettiPiece[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = pattern === 'explosion'
        ? Math.random() * 360
        : pattern === 'shower'
          ? 180 + (Math.random() - 0.5) * 60
          : -90 + (Math.random() - 0.5) * spread;

      const velocity = pattern === 'fireworks'
        ? 50 + Math.random() * 100
        : 30 + Math.random() * 70;

      const radians = (angle * Math.PI) / 180;
      const x = startX + Math.cos(radians) * velocity;
      const y = startY + Math.sin(radians) * velocity;

      newPieces.push({
        id: `${Date.now()}-${i}`,
        x,
        y,
        rotation: Math.random() * 720 - 360,
        scale: 0.5 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 200,
        duration: duration * (0.8 + Math.random() * 0.4),
        shape: ['square', 'circle', 'ribbon'][Math.floor(Math.random() * 3)] as ConfettiPiece['shape'],
      });
    }

    setPieces(newPieces);
    setIsActive(true);

    // Cleanup after animation
    setTimeout(() => {
      setIsActive(false);
      setPieces([]);
    }, duration + 500);
  }, []);

  const fireVictory = useCallback(() => {
    // Multi-burst celebration
    fire({ theme: 'masters', pattern: 'fireworks', particleCount: 80, startX: 30, startY: 60 });
    setTimeout(() => {
      fire({ theme: 'gold', pattern: 'fireworks', particleCount: 80, startX: 70, startY: 60 });
    }, 300);
    setTimeout(() => {
      fire({ theme: 'masters', pattern: 'shower', particleCount: 100, startX: 50, startY: 0 });
    }, 600);
  }, [fire]);

  const fireAchievement = useCallback(() => {
    fire({ theme: 'gold', pattern: 'explosion', particleCount: 40, startX: 50, startY: 50, duration: 2000 });
  }, [fire]);

  const fireMatchWin = useCallback((team: 'usa' | 'europe') => {
    const theme = team === 'usa' ? 'usa' : 'europe';
    fire({ theme, pattern: 'cannon', particleCount: 60, startX: 50, startY: 80 });
  }, [fire]);

  return (
    <ConfettiContext.Provider value={{ fire, fireVictory, fireAchievement, fireMatchWin }}>
      {children}
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {pieces.map((piece) => (
            <ConfettiPieceComponent key={piece.id} piece={piece} />
          ))}
        </div>
      )}
    </ConfettiContext.Provider>
  );
}

// ============================================
// CONFETTI PIECE
// ============================================

function ConfettiPieceComponent({ piece }: { piece: ConfettiPiece }) {
  return (
    <div
      className="absolute animate-confetti-fall"
      style={{
        left: `${piece.x}%`,
        top: `${piece.y}%`,
        animationDelay: `${piece.delay}ms`,
        animationDuration: `${piece.duration}ms`,
        transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
      }}
    >
      {piece.shape === 'square' && (
        <div
          className="w-3 h-3"
          style={{ background: piece.color }}
        />
      )}
      {piece.shape === 'circle' && (
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: piece.color }}
        />
      )}
      {piece.shape === 'ribbon' && (
        <div
          className="w-2 h-6 rounded-sm"
          style={{ background: piece.color }}
        />
      )}
    </div>
  );
}

// ============================================
// STANDALONE CONFETTI BURST
// ============================================

interface ConfettiBurstProps {
  trigger: boolean;
  theme?: ConfettiTheme;
  pattern?: BurstPattern;
  particleCount?: number;
  onComplete?: () => void;
  className?: string;
}

export function ConfettiBurst({
  trigger,
  theme = 'masters',
  pattern = 'explosion',
  particleCount = 30,
  onComplete,
  className,
}: ConfettiBurstProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger && !isActive) {
      const colors = themeColors[theme];
      const newPieces: ConfettiPiece[] = [];

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * 360;
        const velocity = 20 + Math.random() * 40;
        const radians = (angle * Math.PI) / 180;

        newPieces.push({
          id: `${Date.now()}-${i}`,
          x: 50 + Math.cos(radians) * velocity,
          y: 50 + Math.sin(radians) * velocity,
          rotation: Math.random() * 720 - 360,
          scale: 0.4 + Math.random() * 0.4,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 100,
          duration: 1500 + Math.random() * 500,
          shape: ['square', 'circle'][Math.floor(Math.random() * 2)] as ConfettiPiece['shape'],
        });
      }

      setPieces(newPieces);
      setIsActive(true);

      setTimeout(() => {
        setIsActive(false);
        setPieces([]);
        onComplete?.();
      }, 2500);
    }
  }, [trigger, theme, pattern, particleCount, isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}>
      {pieces.map((piece) => (
        <ConfettiPieceComponent key={piece.id} piece={piece} />
      ))}
    </div>
  );
}

// ============================================
// CELEBRATION PARTICLES
// ============================================

interface CelebrationParticlesProps {
  isActive: boolean;
  type?: 'sparkle' | 'star' | 'burst';
  color?: string;
  className?: string;
}

export function CelebrationParticles({
  isActive,
  type = 'sparkle',
  color = 'var(--warning)',
  className,
}: CelebrationParticlesProps) {
  if (!isActive) return null;

  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (i * 45) + 22.5,
    delay: i * 50,
  }));

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute left-1/2 top-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 animate-particle-burst"
          style={{
            '--particle-angle': `${particle.angle}deg`,
            animationDelay: `${particle.delay}ms`,
          } as React.CSSProperties}
        >
          {type === 'sparkle' && (
            <div
              className="w-full h-full rounded-full"
              style={{ background: color }}
            />
          )}
          {type === 'star' && (
            <span style={{ color, fontSize: '12px' }}>★</span>
          )}
          {type === 'burst' && (
            <div
              className="w-full h-full"
              style={{
                background: color,
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================
// GOLD SHIMMER EFFECT
// ============================================

interface GoldShimmerProps {
  children: ReactNode;
  isActive?: boolean;
  className?: string;
}

export function GoldShimmer({ children, isActive = true, className }: GoldShimmerProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isActive && (
        <div
          className="absolute inset-0 pointer-events-none animate-shimmer"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(196, 167, 71, 0.3) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
        />
      )}
    </div>
  );
}

export default ConfettiProvider;
