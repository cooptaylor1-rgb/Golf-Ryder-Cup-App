/**
 * iOS Spring Animations — Physics-Based Motion System
 *
 * Replicates the world-class feel of iOS animations:
 * - Spring physics with configurable tension/friction
 * - Rubber band overscroll effect
 * - Smooth deceleration curves
 * - Momentum-based scrolling
 *
 * Based on Apple's UIKit spring animations
 */

'use client';

import { useCallback, useRef, useState, useEffect } from 'react';

// ============================================
// Spring Physics Types
// ============================================

export interface SpringConfig {
  /** Spring stiffness (tension) - higher = snappier */
  tension: number;
  /** Friction coefficient - higher = more damping */
  friction: number;
  /** Mass of the object */
  mass: number;
  /** Precision threshold for stopping */
  precision: number;
}

export interface SpringValue {
  value: number;
  velocity: number;
}

export interface AnimatedValue {
  current: number;
  target: number;
  velocity: number;
  isAnimating: boolean;
}

// ============================================
// Spring Presets (iOS-inspired)
// ============================================

export const SpringPresets: Record<string, SpringConfig> = {
  // Default iOS spring - smooth and natural
  default: {
    tension: 170,
    friction: 26,
    mass: 1,
    precision: 0.01,
  },

  // Gentle spring - slower, softer
  gentle: {
    tension: 120,
    friction: 14,
    mass: 1,
    precision: 0.01,
  },

  // Wobbly spring - bouncy, playful
  wobbly: {
    tension: 180,
    friction: 12,
    mass: 1,
    precision: 0.01,
  },

  // Stiff spring - quick, snappy
  stiff: {
    tension: 210,
    friction: 20,
    mass: 1,
    precision: 0.01,
  },

  // Slow spring - relaxed, deliberate
  slow: {
    tension: 120,
    friction: 30,
    mass: 1.2,
    precision: 0.01,
  },

  // iOS keyboard spring
  keyboard: {
    tension: 500,
    friction: 30,
    mass: 0.8,
    precision: 0.1,
  },

  // iOS sheet presentation
  sheet: {
    tension: 300,
    friction: 30,
    mass: 1,
    precision: 0.1,
  },

  // Rubber band effect (for overscroll)
  rubberBand: {
    tension: 400,
    friction: 40,
    mass: 0.5,
    precision: 0.1,
  },
};

// ============================================
// Spring Physics Engine
// ============================================

/**
 * Calculate spring physics for a single step
 */
function springStep(
  current: number,
  target: number,
  velocity: number,
  config: SpringConfig,
  deltaTime: number
): SpringValue {
  const { tension, friction, mass, precision } = config;

  // Spring force: F = -k * x (Hooke's law)
  const displacement = current - target;
  const springForce = -tension * displacement;

  // Damping force: F = -c * v
  const dampingForce = -friction * velocity;

  // Total force and acceleration: F = ma, a = F/m
  const acceleration = (springForce + dampingForce) / mass;

  // Update velocity and position (Euler integration)
  const newVelocity = velocity + acceleration * deltaTime;
  const newValue = current + newVelocity * deltaTime;

  // Check if we've settled
  const isSettled =
    Math.abs(newVelocity) < precision &&
    Math.abs(newValue - target) < precision;

  return {
    value: isSettled ? target : newValue,
    velocity: isSettled ? 0 : newVelocity,
  };
}

// ============================================
// useSpring Hook
// ============================================

export interface UseSpringOptions {
  /** Initial value */
  initialValue?: number;
  /** Spring configuration or preset name */
  config?: SpringConfig | keyof typeof SpringPresets;
  /** Callback on animation complete */
  onComplete?: () => void;
  /** Callback on value change */
  onChange?: (value: number) => void;
}

export interface UseSpringReturn {
  /** Current animated value */
  value: number;
  /** Current velocity */
  velocity: number;
  /** Is animation in progress */
  isAnimating: boolean;
  /** Set target value to animate to */
  set: (target: number, velocity?: number) => void;
  /** Immediately set value without animation */
  jump: (value: number) => void;
  /** Stop animation at current position */
  stop: () => void;
}

/**
 * Hook for spring-animated values
 */
export function useSpring(options: UseSpringOptions = {}): UseSpringReturn {
  const {
    initialValue = 0,
    config: configOption = 'default',
    onComplete,
    onChange,
  } = options;

  const config =
    typeof configOption === 'string'
      ? SpringPresets[configOption]
      : configOption;

  const [state, setState] = useState<AnimatedValue>({
    current: initialValue,
    target: initialValue,
    velocity: 0,
    isAnimating: false,
  });

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const onChangeRef = useRef(onChange);
  const onCompleteRef = useRef(onComplete);

  // Keep callbacks fresh
  useEffect(() => {
    onChangeRef.current = onChange;
    onCompleteRef.current = onComplete;
  }, [onChange, onComplete]);

  // Animation loop
  useEffect(() => {
    if (!state.isAnimating) return;

    const animate = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }

      const deltaTime = Math.min((time - lastTimeRef.current) / 1000, 0.064); // Cap at ~16fps minimum
      lastTimeRef.current = time;

      setState((prev) => {
        const result = springStep(
          prev.current,
          prev.target,
          prev.velocity,
          config,
          deltaTime
        );

        const isComplete =
          result.value === prev.target && result.velocity === 0;

        if (isComplete) {
          onCompleteRef.current?.();
        }

        if (result.value !== prev.current) {
          onChangeRef.current?.(result.value);
        }

        return {
          ...prev,
          current: result.value,
          velocity: result.velocity,
          isAnimating: !isComplete,
        };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.isAnimating, config]);

  // Set target value
  const set = useCallback((target: number, initialVelocity?: number) => {
    lastTimeRef.current = 0;
    setState((prev) => ({
      ...prev,
      target,
      velocity: initialVelocity ?? prev.velocity,
      isAnimating: true,
    }));
  }, []);

  // Jump to value without animation
  const jump = useCallback((value: number) => {
    setState({
      current: value,
      target: value,
      velocity: 0,
      isAnimating: false,
    });
    onChangeRef.current?.(value);
  }, []);

  // Stop animation
  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setState((prev) => ({
      ...prev,
      target: prev.current,
      velocity: 0,
      isAnimating: false,
    }));
  }, []);

  return {
    value: state.current,
    velocity: state.velocity,
    isAnimating: state.isAnimating,
    set,
    jump,
    stop,
  };
}

// ============================================
// useRubberBand Hook
// ============================================

export interface UseRubberBandOptions {
  /** Minimum value (bounce back point) */
  min: number;
  /** Maximum value (bounce back point) */
  max: number;
  /** Rubber band resistance (0-1, lower = more stretch) */
  resistance?: number;
  /** Spring config for bounce back */
  config?: SpringConfig | keyof typeof SpringPresets;
}

/**
 * Hook for rubber band effect (iOS overscroll)
 */
export function useRubberBand(options: UseRubberBandOptions) {
  const { min, max, resistance = 0.55, config = 'rubberBand' } = options;

  const spring = useSpring({ config });
  const isDragging = useRef(false);

  /**
   * Apply rubber band resistance to value
   */
  const applyRubberBand = useCallback(
    (value: number): number => {
      if (value >= min && value <= max) {
        return value;
      }

      const boundary = value < min ? min : max;
      const distance = value - boundary;

      // Rubber band formula: d = (1 - (1 / ((x * c / d) + 1))) * d
      const rubberBanded =
        boundary + distance * resistance * (1 - Math.abs(distance) / 1000);

      return rubberBanded;
    },
    [min, max, resistance]
  );

  /**
   * Start dragging
   */
  const startDrag = useCallback((value: number) => {
    isDragging.current = true;
    spring.jump(value);
  }, [spring]);

  /**
   * Update during drag
   */
  const updateDrag = useCallback(
    (value: number) => {
      if (!isDragging.current) return;
      const rubberBanded = applyRubberBand(value);
      spring.jump(rubberBanded);
    },
    [applyRubberBand, spring]
  );

  /**
   * End drag with optional velocity
   */
  const endDrag = useCallback(
    (velocity: number = 0) => {
      isDragging.current = false;

      // Determine target based on current position and velocity
      let target = spring.value + velocity * 0.2; // Project forward

      // Clamp to bounds
      target = Math.max(min, Math.min(max, target));

      spring.set(target, velocity);
    },
    [spring, min, max]
  );

  return {
    value: spring.value,
    velocity: spring.velocity,
    isAnimating: spring.isAnimating,
    startDrag,
    updateDrag,
    endDrag,
    set: spring.set,
    jump: spring.jump,
    stop: spring.stop,
  };
}

// ============================================
// useMomentum Hook
// ============================================

export interface UseMomentumOptions {
  /** Deceleration rate (0-1, higher = faster stop) */
  deceleration?: number;
  /** Minimum velocity threshold */
  minVelocity?: number;
  /** Optional bounds */
  bounds?: { min: number; max: number };
  /** Enable rubber band at bounds */
  rubberBand?: boolean;
}

/**
 * Hook for momentum-based scrolling (iOS-style)
 */
export function useMomentum(options: UseMomentumOptions = {}) {
  const {
    deceleration = 0.998,
    minVelocity = 0.1,
    bounds,
    rubberBand = true,
  } = options;

  const [value, setValue] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  // Animation loop for momentum
  useEffect(() => {
    if (!isAnimating) return;

    const animate = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }

      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      setVelocity((v) => {
        const newVelocity = v * Math.pow(deceleration, deltaTime * 60);

        // Apply bounds with rubber band
        setValue((current) => {
          let newValue = current + newVelocity * deltaTime * 60;

          if (bounds) {
            if (newValue < bounds.min) {
              if (rubberBand) {
                const over = bounds.min - newValue;
                newValue = bounds.min - over * 0.3;
              } else {
                newValue = bounds.min;
              }
            } else if (newValue > bounds.max) {
              if (rubberBand) {
                const over = newValue - bounds.max;
                newValue = bounds.max + over * 0.3;
              } else {
                newValue = bounds.max;
              }
            }
          }

          return newValue;
        });

        // Stop if velocity is too low
        if (Math.abs(newVelocity) < minVelocity) {
          setIsAnimating(false);
          return 0;
        }

        return newVelocity;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, deceleration, minVelocity, bounds, rubberBand]);

  const start = useCallback((initialValue: number, initialVelocity: number) => {
    lastTimeRef.current = 0;
    setValue(initialValue);
    setVelocity(initialVelocity);
    setIsAnimating(true);
  }, []);

  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsAnimating(false);
    setVelocity(0);
  }, []);

  const jump = useCallback((newValue: number) => {
    stop();
    setValue(newValue);
  }, [stop]);

  return {
    value,
    velocity,
    isAnimating,
    start,
    stop,
    jump,
  };
}

// ============================================
// CSS Spring Animation Generator
// ============================================

/**
 * Generate CSS keyframes for spring animation
 * Useful for CSS-based animations
 */
export function generateSpringKeyframes(
  from: number,
  to: number,
  config: SpringConfig | keyof typeof SpringPresets = 'default',
  property: string = 'transform'
): string {
  const springConfig =
    typeof config === 'string' ? SpringPresets[config] : config;

  const frames: string[] = [];
  let current = from;
  let velocity = 0;
  const deltaTime = 1 / 60;
  let frame = 0;
  const maxFrames = 120; // 2 seconds max

  while (frame < maxFrames) {
    const result = springStep(current, to, velocity, springConfig, deltaTime);
    current = result.value;
    velocity = result.velocity;

    const percent = Math.round((frame / maxFrames) * 100);
    frames.push(`${percent}% { ${property}: ${current}; }`);

    if (result.value === to && result.velocity === 0) {
      frames.push(`100% { ${property}: ${to}; }`);
      break;
    }

    frame++;
  }

  return `@keyframes spring {\n  ${frames.join('\n  ')}\n}`;
}

export default useSpring;
