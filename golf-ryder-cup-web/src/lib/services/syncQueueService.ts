/**
 * Sync Queue Service
 *
 * Manages offline sync queue with retry/discard capabilities:
 * - Track pending changes
 * - Retry failed syncs
 * - Discard stale changes
 * - Priority-based sync ordering
 */

import { db } from '@/lib/db';
import type { ScoringEvent } from '@/lib/types/events';
import { ScoringEventType } from '@/lib/types/events';

// ============================================
// TYPES
// ============================================

export interface SyncQueueItem {
    id: string;
    type: 'score' | 'match' | 'banter' | 'player' | 'course' | 'other';
    description: string;
    timestamp: number;
    retryCount: number;
    status: 'pending' | 'syncing' | 'failed' | 'completed';
    error?: string;
    priority: number; // Lower = higher priority
}

export interface SyncQueueStats {
    total: number;
    pending: number;
    syncing: number;
    failed: number;
    oldestPending: number | null;
}

// ============================================
// SYNC QUEUE OPERATIONS
// ============================================

/**
 * Get all pending sync items with detailed status
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
    const items: SyncQueueItem[] = [];

    // Get unsynced scoring events
    const unsyncedEvents = await db.scoringEvents
        .where('synced')
        .equals(0)
        .toArray();

    for (const event of unsyncedEvents) {
        items.push({
            id: event.id,
            type: 'score',
            description: formatEventDescription(event),
            timestamp: new Date(event.timestamp).getTime(),
            retryCount: 0,
            status: 'pending',
            priority: 1, // High priority for scores
        });
    }

    // Get pending course syncs
    const pendingCourseSyncs = await db.courseSyncQueue
        .where('status')
        .anyOf(['pending', 'failed'])
        .toArray();

    for (const sync of pendingCourseSyncs) {
        const profile = await db.courseProfiles.get(sync.courseProfileId);
        items.push({
            id: sync.queueId?.toString() || sync.courseProfileId,
            type: 'course',
            description: `Course: ${profile?.name || 'Unknown'}`,
            timestamp: new Date(sync.createdAt).getTime(),
            retryCount: sync.retryCount,
            status: sync.status as 'pending' | 'failed',
            error: sync.lastError,
            priority: 3, // Lower priority than scores
        });
    }

    // Get recent banter posts (check if synced via metadata)
    const recentPosts = await db.banterPosts
        .orderBy('timestamp')
        .reverse()
        .limit(20)
        .toArray();

    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const post of recentPosts) {
        const postTime = new Date(post.timestamp).getTime();
        if (postTime > fiveMinutesAgo) {
            items.push({
                id: post.id,
                type: 'banter',
                description: post.content ? `Post: ${post.content.slice(0, 30)}...` : 'Banter post',
                timestamp: postTime,
                retryCount: 0,
                status: 'pending',
                priority: 2,
            });
        }
    }

    // Sort by priority then timestamp
    return items.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return b.timestamp - a.timestamp;
    });
}

/**
 * Get sync queue statistics
 */
export async function getSyncQueueStats(): Promise<SyncQueueStats> {
    const items = await getSyncQueue();

    const pending = items.filter(i => i.status === 'pending').length;
    const syncing = items.filter(i => i.status === 'syncing').length;
    const failed = items.filter(i => i.status === 'failed').length;

    const pendingItems = items.filter(i => i.status === 'pending');
    const oldestPending = pendingItems.length > 0
        ? Math.min(...pendingItems.map(i => i.timestamp))
        : null;

    return {
        total: items.length,
        pending,
        syncing,
        failed,
        oldestPending,
    };
}

/**
 * Retry a failed sync item
 */
export async function retrySyncItem(itemId: string, type: SyncQueueItem['type']): Promise<boolean> {
    try {
        switch (type) {
            case 'course': {
                // Find and reset the course sync queue entry
                const entry = await db.courseSyncQueue
                    .where('courseProfileId')
                    .equals(itemId)
                    .first();

                if (entry && entry.queueId) {
                    await db.courseSyncQueue.update(entry.queueId, {
                        status: 'pending',
                        retryCount: entry.retryCount + 1,
                        lastAttemptAt: new Date().toISOString(),
                    });
                    return true;
                }
                break;
            }

            case 'score': {
                // Scores will be retried automatically on next sync
                return true;
            }

            default:
                return false;
        }
        return false;
    } catch (error) {
        console.error('Failed to retry sync item:', error);
        return false;
    }
}

/**
 * Discard a pending sync item
 */
export async function discardSyncItem(itemId: string, type: SyncQueueItem['type']): Promise<boolean> {
    try {
        switch (type) {
            case 'course': {
                // Remove from course sync queue
                const entry = await db.courseSyncQueue
                    .where('courseProfileId')
                    .equals(itemId)
                    .first();

                if (entry && entry.queueId) {
                    await db.courseSyncQueue.delete(entry.queueId);
                    return true;
                }
                break;
            }

            case 'score': {
                // Mark scoring event as synced (effectively discarding)
                const event = await db.scoringEvents
                    .where('id')
                    .equals(itemId)
                    .first();

                if (event && event.localId) {
                    await db.scoringEvents.update(event.localId, { synced: true });
                    return true;
                }
                break;
            }

            case 'banter': {
                // Remove banter post
                await db.banterPosts.delete(itemId);
                return true;
            }

            default:
                return false;
        }
        return false;
    } catch (error) {
        console.error('Failed to discard sync item:', error);
        return false;
    }
}

/**
 * Discard all pending sync items
 */
export async function discardAllPending(): Promise<number> {
    let discarded = 0;

    try {
        // Clear course sync queue
        const courseCount = await db.courseSyncQueue
            .where('status')
            .anyOf(['pending', 'failed'])
            .delete();
        discarded += courseCount;

        // Mark all unsynced scoring events as synced
        const unsyncedEvents = await db.scoringEvents
            .where('synced')
            .equals(0)
            .toArray();

        for (const event of unsyncedEvents) {
            if (event.localId) {
                await db.scoringEvents.update(event.localId, { synced: true });
                discarded++;
            }
        }

        return discarded;
    } catch (error) {
        console.error('Failed to discard all pending items:', error);
        return discarded;
    }
}

/**
 * Retry all failed sync items
 */
export async function retryAllFailed(): Promise<number> {
    let retried = 0;

    try {
        // Reset failed course syncs
        const failedCourses = await db.courseSyncQueue
            .where('status')
            .equals('failed')
            .toArray();

        for (const entry of failedCourses) {
            if (entry.queueId) {
                await db.courseSyncQueue.update(entry.queueId, {
                    status: 'pending',
                    retryCount: entry.retryCount + 1,
                    lastAttemptAt: new Date().toISOString(),
                });
                retried++;
            }
        }

        return retried;
    } catch (error) {
        console.error('Failed to retry all failed items:', error);
        return retried;
    }
}

// ============================================
// HELPERS
// ============================================

function formatEventDescription(event: ScoringEvent): string {
    switch (event.eventType) {
        case ScoringEventType.HoleScored:
            return `Hole ${(event.payload as { holeNumber?: number })?.holeNumber || '?'} scored`;
        case ScoringEventType.HoleEdited:
            return `Hole ${(event.payload as { holeNumber?: number })?.holeNumber || '?'} edited`;
        case ScoringEventType.HoleUndone:
            return `Hole ${(event.payload as { holeNumber?: number })?.holeNumber || '?'} undone`;
        case ScoringEventType.MatchStarted:
            return 'Match started';
        case ScoringEventType.MatchFinalized:
            return 'Match completed';
        case ScoringEventType.MatchCancelled:
            return 'Match cancelled';
        default:
            return 'Score update';
    }
}
