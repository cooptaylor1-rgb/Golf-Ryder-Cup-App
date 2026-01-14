/**
 * Micro Interactions Component Library
 *
 * Reusable micro-interaction patterns including:
 * - Pressable components with feedback
 * - Animated reveals
 * - Skeleton loaders with stagger
 * - Success/error indicators
 * - Ripple effects
 *
 * Features:
 * - Touch-optimized feedback
 * - Reduced motion support
 * - Customizable timing
 * - Haptic integration
 */

'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  type ReactNode,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

// ============================================
// PRESSABLE
// ============================================

interface PressableProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  effect?: 'scale' | 'lift' | 'glow' | 'ripple' | 'none';
  haptic?: boolean;
  className?: string;
}

export const Pressable = forwardRef<HTMLButtonElement, PressableProps>(
  ({ children, effect = 'scale', haptic = true, className, onClick, ...props }, ref) => {
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (haptic && 'vibrate' in navigator) {
          navigator.vibrate(10);
        }

        if (effect === 'ripple') {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setRipples((prev) => [...prev, { x, y, id: Date.now() }]);
          setTimeout(() => {
            setRipples((prev) => prev.slice(1));
          }, 600);
        }

        onClick?.(e);
      },
      [effect, haptic, onClick]
    );

    const effectClasses = {
      scale: 'active:scale-[0.98] transition-transform',
      lift: 'active:translate-y-[-2px] active:shadow-lg transition-all',
      glow: 'active:ring-2 active:ring-masters/50 transition-all',
      ripple: 'relative overflow-hidden',
      none: '',
    };

    return (
      <button
        ref={ref}
        className={cn(effectClasses[effect], className)}
        onClick={handleClick}
        {...props}
      >
        {children}
        {effect === 'ripple' && ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </button>
    );
  }
);

Pressable.displayName = 'Pressable';

// ============================================
// ANIMATED REVEAL
// ============================================

interface AnimatedRevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'blur';
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
}

export function AnimatedReveal({
  children,
  animation = 'fade',
  delay = 0,
  duration = 500,
  threshold = 0.1,
  once = true,
  className,
  ...props
}: AnimatedRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, once]);

  const animationStyles = {
    fade: {
      initial: 'opacity-0',
      visible: 'opacity-100',
    },
    'slide-up': {
      initial: 'opacity-0 translate-y-8',
      visible: 'opacity-100 translate-y-0',
    },
    'slide-down': {
      initial: 'opacity-0 -translate-y-8',
      visible: 'opacity-100 translate-y-0',
    },
    scale: {
      initial: 'opacity-0 scale-95',
      visible: 'opacity-100 scale-100',
    },
    blur: {
      initial: 'opacity-0 blur-sm',
      visible: 'opacity-100 blur-0',
    },
  };

  const { initial, visible } = animationStyles[animation];

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all',
        isVisible ? visible : initial,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================
// STAGGERED LIST
// ============================================

interface StaggeredListProps {
  children: ReactNode[];
  staggerDelay?: number;
  animation?: 'fade' | 'slide-up' | 'scale';
  className?: string;
  itemClassName?: string;
}

export function StaggeredList({
  children,
  staggerDelay = 50,
  animation = 'slide-up',
  className,
  itemClassName,
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedReveal
          key={index}
          animation={animation}
          delay={index * staggerDelay}
          className={itemClassName}
        >
          {child}
        </AnimatedReveal>
      ))}
    </div>
  );
}

// ============================================
// SHIMMER SKELETON
// ============================================

interface ShimmerSkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  delay?: number;
  className?: string;
}

export function ShimmerSkeleton({
  width,
  height,
  rounded = 'md',
  delay = 0,
  className,
}: ShimmerSkeletonProps) {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'animate-shimmer',
        roundedClasses[rounded],
        className
      )}
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, var(--rule) 0%, var(--surface-raised) 50%, var(--rule) 100%)',
        backgroundSize: '200% 100%',
        animationDelay: `${delay}ms`,
      }}
    />
  );
}

// ============================================
// SUCCESS CHECKMARK
// ============================================

interface SuccessCheckmarkProps {
  isVisible: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  onComplete?: () => void;
  className?: string;
}

export function SuccessCheckmark({
  isVisible,
  size = 'md',
  color = 'var(--success)',
  onComplete,
  className,
}: SuccessCheckmarkProps) {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 3 : 2.5;

  if (!isVisible) return null;

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <svg
        viewBox="0 0 52 52"
        className="w-full h-full"
      >
        {/* Circle */}
        <circle
          cx="26"
          cy="26"
          r="23"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          className="animate-circle-draw"
          style={{
            strokeDasharray: 166,
            strokeDashoffset: 166,
          }}
        />
        {/* Checkmark */}
        <path
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 27l8 8 16-16"
          className="animate-check-draw"
          style={{
            strokeDasharray: 48,
            strokeDashoffset: 48,
            animationDelay: '300ms',
          }}
        />
      </svg>
    </div>
  );
}

// ============================================
// ERROR SHAKE
// ============================================

interface ErrorShakeProps {
  children: ReactNode;
  trigger: boolean;
  onComplete?: () => void;
  className?: string;
}

export function ErrorShake({
  children,
  trigger,
  onComplete,
  className,
}: ErrorShakeProps) {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (trigger && !isShaking) {
      setIsShaking(true);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 50]);
      }

      const timer = setTimeout(() => {
        setIsShaking(false);
        onComplete?.();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [trigger, isShaking, onComplete]);

  return (
    <div className={cn(isShaking && 'animate-shake', className)}>
      {children}
    </div>
  );
}

// ============================================
// BOUNCE INDICATOR
// ============================================

interface BounceIndicatorProps {
  isActive: boolean;
  count?: number;
  color?: string;
  className?: string;
}

export function BounceIndicator({
  isActive,
  count,
  color = 'var(--error)',
  className,
}: BounceIndicatorProps) {
  if (!isActive && !count) return null;

  return (
    <div
      className={cn(
        'absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold text-white',
        isActive && 'animate-bounce',
        className
      )}
      style={{
        background: color,
        animationDuration: '600ms',
      }}
    >
      {count !== undefined ? (count > 99 ? '99+' : count) : ''}
    </div>
  );
}

// ============================================
// PULSE DOT
// ============================================

interface PulseDotProps {
  isActive: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PulseDot({
  isActive,
  color = 'var(--success)',
  size = 'md',
  className,
}: PulseDotProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span className={cn('relative inline-flex', sizeClasses[size], className)}>
      {isActive && (
        <span
          className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
          style={{ background: color }}
        />
      )}
      <span
        className="relative inline-flex rounded-full h-full w-full"
        style={{ background: color }}
      />
    </span>
  );
}

// ============================================
// TYPING INDICATOR
// ============================================

interface TypingIndicatorProps {
  isVisible: boolean;
  className?: string;
}

export function TypingIndicator({ isVisible, className }: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            background: 'var(--ink-tertiary)',
            animationDelay: `${i * 150}ms`,
            animationDuration: '600ms',
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// PROGRESS RING
// ============================================

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  animate?: boolean;
  className?: string;
}

export function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 4,
  color = 'var(--masters)',
  backgroundColor = 'var(--rule)',
  showValue = true,
  animate = true,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: animate ? 'stroke-dashoffset 500ms ease-out' : 'none',
          }}
        />
      </svg>
      {showValue && (
        <span
          className="absolute text-sm font-bold"
          style={{ color }}
        >
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}

// ============================================
// SWIPE HINT
// ============================================

interface SwipeHintProps {
  direction: 'left' | 'right' | 'up' | 'down';
  isVisible: boolean;
  className?: string;
}

export function SwipeHint({ direction, isVisible, className }: SwipeHintProps) {
  if (!isVisible) return null;

  const arrows = {
    left: '←',
    right: '→',
    up: '↑',
    down: '↓',
  };

  const animationClasses = {
    left: 'animate-swipe-left',
    right: 'animate-swipe-right',
    up: 'animate-swipe-up',
    down: 'animate-swipe-down',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm',
        animationClasses[direction],
        className
      )}
      style={{ color: 'var(--ink-tertiary)' }}
    >
      <span className="text-lg">{arrows[direction]}</span>
      <span>Swipe {direction}</span>
    </div>
  );
}

// ============================================
// LONG PRESS PROGRESS
// ============================================

interface LongPressProgressProps {
  isPressed: boolean;
  duration?: number;
  onComplete?: () => void;
  children: ReactNode;
  className?: string;
}

export function LongPressProgress({
  isPressed,
  duration = 1000,
  onComplete,
  children,
  className,
}: LongPressProgressProps) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPressed) {
      const step = 100 / (duration / 16);
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + step;
          if (next >= 100) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            onComplete?.();
            return 100;
          }
          return next;
        });
      }, 16);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPressed, duration, onComplete]);

  return (
    <div className={cn('relative', className)}>
      {children}
      {isPressed && (
        <div
          className="absolute inset-0 rounded-inherit overflow-hidden pointer-events-none"
          style={{ borderRadius: 'inherit' }}
        >
          <div
            className="absolute bottom-0 left-0 h-1 transition-all"
            style={{
              width: `${progress}%`,
              background: 'var(--masters)',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Pressable;
