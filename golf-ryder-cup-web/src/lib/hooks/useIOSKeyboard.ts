/**
 * useIOSKeyboard Hook — iPhone Keyboard Optimization
 *
 * Handles iOS Safari's quirky keyboard behavior:
 * - Viewport resize on keyboard open
 * - Input scrolling into view
 * - Keyboard dismissal
 * - Visual viewport tracking for fixed elements
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

interface IOSKeyboardState {
  isKeyboardOpen: boolean;
  keyboardHeight: number;
  visualViewportHeight: number;
}

/**
 * Detect if running on iOS Safari
 */
function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const webkit = /WebKit/.test(ua);
  const notCriOS = !/CriOS/.test(ua); // Not Chrome on iOS

  return iOS && webkit && notCriOS;
}

/**
 * Hook for managing iOS keyboard behavior
 */
export function useIOSKeyboard() {
  const [state, setState] = useState<IOSKeyboardState>({
    isKeyboardOpen: false,
    keyboardHeight: 0,
    visualViewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !isIOSSafari()) return;

    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    let initialHeight = visualViewport.height;

    const handleResize = () => {
      const currentHeight = visualViewport?.height ?? window.innerHeight;
      const keyboardHeight = initialHeight - currentHeight;
      const isKeyboardOpen = keyboardHeight > 150; // Threshold for keyboard detection

      setState({
        isKeyboardOpen,
        keyboardHeight: isKeyboardOpen ? keyboardHeight : 0,
        visualViewportHeight: currentHeight,
      });

      // Update CSS custom property for dynamic positioning
      document.documentElement.style.setProperty(
        '--ios-keyboard-height',
        `${isKeyboardOpen ? keyboardHeight : 0}px`
      );
      document.documentElement.style.setProperty(
        '--ios-visual-viewport-height',
        `${currentHeight}px`
      );
    };

    const handleScroll = () => {
      // Keep fixed elements in view during keyboard scroll
      if (visualViewport) {
        document.documentElement.style.setProperty(
          '--ios-viewport-offset',
          `${visualViewport.offsetTop}px`
        );
      }
    };

    // Initial measurement after DOM is ready
    requestAnimationFrame(() => {
      initialHeight = visualViewport.height;
    });

    visualViewport.addEventListener('resize', handleResize);
    visualViewport.addEventListener('scroll', handleScroll);

    return () => {
      visualViewport.removeEventListener('resize', handleResize);
      visualViewport.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /**
   * Dismiss iOS keyboard by blurring active element
   */
  const dismissKeyboard = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  /**
   * Scroll input into view accounting for keyboard
   */
  const scrollInputIntoView = useCallback((element: HTMLElement) => {
    if (!isIOSSafari()) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // iOS needs a delay after focus for keyboard to appear
    setTimeout(() => {
      const rect = element.getBoundingClientRect();
      const visualViewport = window.visualViewport;

      if (visualViewport) {
        const viewportHeight = visualViewport.height;
        const elementBottom = rect.bottom;

        // If element is below visible area, scroll it up
        if (elementBottom > viewportHeight - 20) {
          const scrollAmount = elementBottom - viewportHeight + 100; // 100px padding
          window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 350); // Wait for keyboard animation
  }, []);

  return {
    ...state,
    isIOS: typeof window !== 'undefined' && isIOSSafari(),
    dismissKeyboard,
    scrollInputIntoView,
  };
}

/**
 * Hook for preventing iOS zoom on input focus
 * Ensures inputs have 16px+ font size
 */
export function useIOSInputZoomPrevention() {
  useEffect(() => {
    if (typeof window === 'undefined' || !isIOSSafari()) return;

    // Apply to all inputs that might zoom
    const style = document.createElement('style');
    style.textContent = `
      /* Prevent iOS zoom on focus - ensure minimum 16px font */
      @supports (-webkit-touch-callout: none) {
        input[type="text"],
        input[type="email"],
        input[type="number"],
        input[type="tel"],
        input[type="password"],
        input[type="search"],
        input[type="url"],
        textarea,
        select {
          font-size: max(16px, 1em) !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
}

export default useIOSKeyboard;
