/**
 * iOS Install Prompt — Add to Home Screen Banner
 *
 * iOS Safari doesn't support the beforeinstallprompt API,
 * so we need a custom banner with instructions.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, Share, PlusSquare, ArrowDown } from 'lucide-react';

interface IOSInstallPromptProps {
  /** Delay before showing prompt (ms) */
  delay?: number;
  /** Days to wait before showing again if dismissed */
  dismissDays?: number;
}

const STORAGE_KEY = 'ios-install-prompt-dismissed';

/**
 * Check if running in iOS Safari (not standalone PWA)
 */
function shouldShowIOSPrompt(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const webkit = /WebKit/.test(ua);
  const notCriOS = !/CriOS/.test(ua);
  const isIOSSafari = iOS && webkit && notCriOS;

  // Check if already installed as PWA
  const isStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  const isDisplayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;

  return isIOSSafari && !isStandalone && !isDisplayModeStandalone;
}

export function IOSInstallPrompt({
  delay = 30000, // Show after 30 seconds by default
  dismissDays = 7,
}: IOSInstallPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if we're on iOS Safari
    const shouldShow = shouldShowIOSPrompt();

    if (!shouldShow) {
      setIsIOS(false);
      return;
    }

    setIsIOS(true);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, dismissDays]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }, []);

  const handleInstall = useCallback(() => {
    // Can't programmatically install on iOS, just highlight the instructions
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }, []);

  if (!isIOS || !isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-masters-green to-masters-dark p-6 text-white">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden">
              <Image
                src="/icons/icon-96.png"
                alt="Golf Ryder Cup"
                width={48}
                height={48}
                className="rounded-xl"
              />
            </div>
            <div>
              <h2 id="ios-install-title" className="text-xl font-bold">
                Add to Home Screen
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Get the full app experience
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 space-y-4">
          <p className="text-ink-secondary text-sm">
            Install Golf Ryder Cup for quick access and offline scoring:
          </p>

          <ol className="space-y-4">
            <li className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-masters-subtle flex items-center justify-center">
                <span className="text-masters font-bold text-sm">1</span>
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-ink">Tap the</span>
                  <Share className="w-5 h-5 text-[#007AFF]" />
                  <span className="text-ink font-medium">Share</span>
                  <span className="text-ink">button</span>
                </div>
                <p className="text-ink-tertiary text-xs mt-1">
                  In Safari&apos;s bottom toolbar
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-masters-subtle flex items-center justify-center">
                <span className="text-masters font-bold text-sm">2</span>
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-ink">Scroll down and tap</span>
                </div>
                <div className="flex items-center gap-2 mt-2 p-2 bg-surface rounded-lg">
                  <PlusSquare className="w-5 h-5 text-[#007AFF]" />
                  <span className="text-ink font-medium">Add to Home Screen</span>
                </div>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-masters-subtle flex items-center justify-center">
                <span className="text-masters font-bold text-sm">3</span>
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-ink">Tap</span>
                  <span className="text-[#007AFF] font-medium">Add</span>
                  <span className="text-ink">in the top right</span>
                </div>
              </div>
            </li>
          </ol>

          {/* Benefits */}
          <div className="pt-4 border-t border-rule">
            <p className="text-xs text-ink-tertiary">
              ✓ Works offline &nbsp;•&nbsp; ✓ Faster loading &nbsp;•&nbsp; ✓ Full screen mode
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 py-3 px-4 rounded-xl border border-rule text-ink font-medium hover:bg-surface transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 py-3 px-4 rounded-xl bg-masters text-white font-medium hover:bg-masters-dark transition-colors flex items-center justify-center gap-2"
          >
            <ArrowDown className="w-4 h-4" />
            Got It
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}

export default IOSInstallPrompt;
