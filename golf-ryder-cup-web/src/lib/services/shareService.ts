/**
 * Native Share Service
 *
 * Production-ready sharing functionality using the Web Share API
 * with fallback to clipboard copy for unsupported browsers.
 *
 * @example
 * await shareScore({ title: 'My Score', text: 'Shot 75 today!' });
 */

// ============================================
// TYPES
// ============================================

export interface ShareData {
  /** Title of the shared content */
  title?: string;
  /** Description/body text */
  text?: string;
  /** URL to share */
  url?: string;
  /** Files to share (images, etc.) */
  files?: File[];
}

export interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'none';
  error?: string;
}

export interface ShareOptions {
  /** Fallback to clipboard if native share fails */
  fallbackToClipboard?: boolean;
  /** Custom fallback message for clipboard */
  clipboardFallbackMessage?: string;
  /** Track share analytics */
  onShare?: (method: 'native' | 'clipboard') => void;
}

// ============================================
// CAPABILITY DETECTION
// ============================================

/**
 * Check if Web Share API is supported
 */
export function isShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Check if sharing files is supported
 */
export function isFileShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'canShare' in navigator;
}

/**
 * Check if specific files can be shared
 */
export function canShareFiles(files: File[]): boolean {
  if (!isFileShareSupported()) return false;
  try {
    return navigator.canShare({ files });
  } catch {
    return false;
  }
}

// ============================================
// SHARE FUNCTIONS
// ============================================

/**
 * Share content using native Share API with fallback
 */
export async function share(
  data: ShareData,
  options: ShareOptions = {}
): Promise<ShareResult> {
  const {
    fallbackToClipboard = true,
    clipboardFallbackMessage,
    onShare,
  } = options;

  // Try native share first
  if (isShareSupported()) {
    try {
      // Check if files can be shared
      if (data.files && data.files.length > 0) {
        if (!canShareFiles(data.files)) {
          // Remove files and try without them
          const { files: _files, ...dataWithoutFiles } = data;
          await navigator.share(dataWithoutFiles);
        } else {
          await navigator.share(data);
        }
      } else {
        await navigator.share(data);
      }

      onShare?.('native');
      return { success: true, method: 'native' };
    } catch (error) {
      // User cancelled or share failed
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, method: 'none', error: 'Share cancelled' };
      }
      // Fall through to clipboard fallback
    }
  }

  // Fallback to clipboard
  if (fallbackToClipboard) {
    const textToCopy = clipboardFallbackMessage || buildShareText(data);

    try {
      await navigator.clipboard.writeText(textToCopy);
      onShare?.('clipboard');
      return { success: true, method: 'clipboard' };
    } catch (error) {
      return {
        success: false,
        method: 'none',
        error: error instanceof Error ? error.message : 'Clipboard failed',
      };
    }
  }

  return { success: false, method: 'none', error: 'Share not supported' };
}

/**
 * Build share text from data
 */
function buildShareText(data: ShareData): string {
  const parts: string[] = [];

  if (data.title) parts.push(data.title);
  if (data.text) parts.push(data.text);
  if (data.url) parts.push(data.url);

  return parts.join('\n\n');
}

// ============================================
// PRE-BUILT SHARE FUNCTIONS
// ============================================

/**
 * Share a match score
 */
export async function shareScore(options: {
  playerName: string;
  score: number;
  courseName?: string;
  matchResult?: 'won' | 'lost' | 'tied';
  url?: string;
}): Promise<ShareResult> {
  const { playerName, score, courseName, matchResult, url } = options;

  let text = `${playerName} shot ${score}`;
  if (courseName) text += ` at ${courseName}`;
  if (matchResult) {
    text += matchResult === 'won' ? ' and won!' : matchResult === 'lost' ? ' and lost.' : ' - it was a tie!';
  }

  return share({
    title: '⛳ Golf Score',
    text,
    url: url || (typeof window !== 'undefined' ? window.location.href : undefined),
  });
}

/**
 * Share match standings
 */
export async function shareStandings(options: {
  tripName: string;
  usaScore: number;
  europeScore: number;
  matchesRemaining?: number;
  url?: string;
}): Promise<ShareResult> {
  const { tripName, usaScore, europeScore, matchesRemaining, url } = options;

  let text = `${tripName} Standings:\n🇺🇸 USA: ${usaScore}\n🇪🇺 Europe: ${europeScore}`;

  if (matchesRemaining !== undefined) {
    text += `\n${matchesRemaining} matches remaining`;
  }

  return share({
    title: '🏆 Ryder Cup Standings',
    text,
    url: url || (typeof window !== 'undefined' ? window.location.href : undefined),
  });
}

/**
 * Share a trip invite
 */
export async function shareTripInvite(options: {
  tripName: string;
  captainName: string;
  inviteCode: string;
  url: string;
}): Promise<ShareResult> {
  const { tripName, captainName, inviteCode, url } = options;

  return share({
    title: `Join ${tripName}`,
    text: `${captainName} has invited you to join their Ryder Cup trip!\n\nInvite Code: ${inviteCode}`,
    url,
  });
}

/**
 * Share a match result
 */
export async function shareMatchResult(options: {
  player1Name: string;
  player2Name: string;
  player1Score?: number;
  player2Score?: number;
  result: string; // e.g., "3&2", "1 up", "A/S"
  format: string;
  url?: string;
}): Promise<ShareResult> {
  const { player1Name, player2Name, result, format, url } = options;

  return share({
    title: '⛳ Match Result',
    text: `${format}: ${player1Name} vs ${player2Name}\nResult: ${result}`,
    url: url || (typeof window !== 'undefined' ? window.location.href : undefined),
  });
}

/**
 * Share a photo
 */
export async function sharePhoto(options: {
  photo: File | Blob;
  caption?: string;
  tripName?: string;
}): Promise<ShareResult> {
  const { photo, caption, tripName } = options;

  // Convert Blob to File if needed
  const file = photo instanceof File
    ? photo
    : new File([photo], 'golf-photo.jpg', { type: 'image/jpeg' });

  return share({
    title: tripName ? `📸 ${tripName}` : '📸 Golf Photo',
    text: caption,
    files: [file],
  }, {
    fallbackToClipboard: false, // Can't copy file to clipboard
  });
}

// ============================================
// REACT HOOK
// ============================================

import { useState, useCallback } from 'react';

export interface UseShareReturn {
  /** Whether sharing is supported */
  isSupported: boolean;
  /** Whether file sharing is supported */
  isFileShareSupported: boolean;
  /** Share content */
  share: (data: ShareData, options?: ShareOptions) => Promise<ShareResult>;
  /** Share a score */
  shareScore: typeof shareScore;
  /** Share standings */
  shareStandings: typeof shareStandings;
  /** Share a trip invite */
  shareTripInvite: typeof shareTripInvite;
  /** Share a match result */
  shareMatchResult: typeof shareMatchResult;
  /** Whether currently sharing */
  isSharing: boolean;
  /** Last share result */
  lastResult: ShareResult | null;
}

export function useShare(): UseShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const [lastResult, setLastResult] = useState<ShareResult | null>(null);

  const wrappedShare = useCallback(async (data: ShareData, options?: ShareOptions): Promise<ShareResult> => {
    setIsSharing(true);
    try {
      const result = await share(data, options);
      setLastResult(result);
      return result;
    } finally {
      setIsSharing(false);
    }
  }, []);

  return {
    isSupported: isShareSupported(),
    isFileShareSupported: isFileShareSupported(),
    share: wrappedShare,
    shareScore,
    shareStandings,
    shareTripInvite,
    shareMatchResult,
    isSharing,
    lastResult,
  };
}

export default useShare;
