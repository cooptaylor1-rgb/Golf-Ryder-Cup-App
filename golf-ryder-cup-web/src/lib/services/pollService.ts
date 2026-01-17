/**
 * Poll Service
 *
 * Handles group polls for trip decisions - where to eat, tee times, etc.
 */

import { db } from '@/lib/db';
import type { UUID, ISODateString } from '@/lib/types/models';
import type {
    Poll,
    PollOption,
    PollType,
    PollStatus,
    PollCategory,
} from '@/lib/types/social';

// ============================================
// POLL CREATION
// ============================================

/**
 * Create a new poll
 */
export async function createPoll(
    tripId: UUID,
    creatorId: UUID,
    creatorName: string,
    question: string,
    options: string[],
    pollType: PollType = 'single',
    category: PollCategory = 'other',
    settings?: {
        description?: string;
        closesAt?: ISODateString;
        allowAddOptions?: boolean;
        isAnonymous?: boolean;
        optionEmojis?: string[];
    }
): Promise<Poll> {
    const now = new Date().toISOString();

    const pollOptions: PollOption[] = options.map((text, index) => ({
        id: crypto.randomUUID(),
        text,
        emoji: settings?.optionEmojis?.[index],
        votes: [],
    }));

    const poll: Poll = {
        id: crypto.randomUUID(),
        tripId,
        createdById: creatorId,
        creatorId,
        creatorName,
        question,
        description: settings?.description,
        type: pollType,
        category,
        options: pollOptions,
        status: 'active',
        allowAddOptions: settings?.allowAddOptions ?? false,
        isAnonymous: settings?.isAnonymous ?? false,
        expiresAt: settings?.closesAt,
        closesAt: settings?.closesAt,
        createdAt: now,
    };

    await db.polls.add(poll);
    return poll;
}

/**
 * Quick poll templates for common decisions
 */
export const POLL_TEMPLATES: {
    question: string;
    options: string[];
    category: PollCategory;
    emoji?: string[];
}[] = [
        {
            question: 'Where should we eat tonight?',
            options: ['Steakhouse', 'Italian', 'Mexican', 'Seafood', 'Whatever everyone else wants'],
            category: 'dinner',
            emoji: ['🥩', '🍝', '🌮', '🦞', '🤷'],
        },
        {
            question: 'What time should we tee off tomorrow?',
            options: ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM'],
            category: 'schedule',
            emoji: ['🌅', '☀️', '🌤️', '⛅'],
        },
        {
            question: 'What format for tomorrow?',
            options: ['Best Ball', 'Alternate Shot', 'Scramble', 'Singles'],
            category: 'rules',
            emoji: ['🏆', '🔄', '🤝', '🎯'],
        },
        {
            question: 'Post-round activity?',
            options: ['Pool', 'Bar', 'Poker night', 'Early dinner', 'Rest'],
            category: 'activity',
            emoji: ['🏊', '🍺', '🎰', '🍽️', '😴'],
        },
        {
            question: "Who's buying the first round?",
            options: [], // Fill with player names
            category: 'fun',
            emoji: ['🍺'],
        },
        {
            question: 'MVP of the day?',
            options: [], // Fill with player names
            category: 'fun',
            emoji: ['🏆'],
        },
        {
            question: 'Best shot of the day?',
            options: [], // Fill dynamically
            category: 'fun',
            emoji: ['⛳'],
        },
    ];

/**
 * Create a poll from a template
 */
export async function createFromTemplate(
    tripId: UUID,
    creatorId: UUID,
    creatorName: string,
    templateIndex: number,
    customOptions?: string[],
    closesAt?: ISODateString
): Promise<Poll> {
    const template = POLL_TEMPLATES[templateIndex];
    if (!template) {
        throw new Error('Invalid template index');
    }

    const options = customOptions?.length ? customOptions : template.options;

    return createPoll(
        tripId,
        creatorId,
        creatorName,
        template.question,
        options,
        'single',
        template.category,
        {
            closesAt,
            optionEmojis: template.emoji,
        }
    );
}

// ============================================
// POLL MANAGEMENT
// ============================================

/**
 * Get all polls for a trip
 */
export async function getTripPolls(
    tripId: UUID,
    status?: PollStatus
): Promise<Poll[]> {
    let polls: Poll[];

    if (status) {
        polls = await db.polls
            .where('[tripId+status]')
            .equals([tripId, status])
            .toArray();
    } else {
        polls = await db.polls.where('tripId').equals(tripId).toArray();
    }

    // Sort: active first, then by creation date (newest first)
    return polls.sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

/**
 * Get a single poll
 */
export async function getPoll(pollId: UUID): Promise<Poll | undefined> {
    return db.polls.get(pollId);
}

/**
 * Add an option to a poll (if allowed)
 */
export async function addPollOption(
    pollId: UUID,
    text: string,
    addedBy: UUID,
    emoji?: string
): Promise<Poll | undefined> {
    const poll = await db.polls.get(pollId);
    if (!poll || !poll.allowAddOptions || poll.status !== 'active') {
        return undefined;
    }

    const newOption: PollOption = {
        id: crypto.randomUUID(),
        text,
        emoji,
        addedBy,
        votes: [],
    };

    poll.options.push(newOption);
    await db.polls.update(pollId, { options: poll.options });

    return poll;
}

/**
 * Close a poll
 */
export async function closePoll(pollId: UUID): Promise<Poll | undefined> {
    const poll = await db.polls.get(pollId);
    if (!poll) return undefined;

    const updates = {
        status: 'closed' as PollStatus,
        closedAt: new Date().toISOString(),
    };

    await db.polls.update(pollId, updates);
    return { ...poll, ...updates };
}

/**
 * Cancel a poll
 */
export async function cancelPoll(pollId: UUID): Promise<Poll | undefined> {
    const poll = await db.polls.get(pollId);
    if (!poll) return undefined;

    await db.polls.update(pollId, { status: 'cancelled' });
    return { ...poll, status: 'cancelled' };
}

/**
 * Delete a poll
 */
export async function deletePoll(pollId: UUID): Promise<void> {
    await db.polls.delete(pollId);
}

/**
 * Check and close expired polls
 */
export async function closeExpiredPolls(tripId: UUID): Promise<number> {
    const now = new Date().toISOString();
    const polls = await db.polls
        .where('[tripId+status]')
        .equals([tripId, 'active'])
        .toArray();

    let closedCount = 0;
    for (const poll of polls) {
        if (poll.expiresAt && poll.expiresAt <= now) {
            await closePoll(poll.id);
            closedCount++;
        }
    }

    return closedCount;
}

// ============================================
// VOTING
// ============================================

/**
 * Cast a vote on a poll
 */
export async function vote(
    pollId: UUID,
    playerId: UUID,
    optionIds: UUID[]
): Promise<Poll | undefined> {
    const poll = await db.polls.get(pollId);
    if (!poll || poll.status !== 'active') {
        return undefined;
    }

    // Validate vote based on poll type
    if (poll.type === 'single' && optionIds.length > 1) {
        throw new Error('Single choice poll allows only one selection');
    }

    // Remove any existing votes from this player
    for (const option of poll.options) {
        option.votes = option.votes.filter(id => id !== playerId);
    }

    // Add new votes
    for (const optionId of optionIds) {
        const option = poll.options.find(o => o.id === optionId);
        if (option) {
            option.votes.push(playerId);
        }
    }

    await db.polls.update(pollId, { options: poll.options });
    return poll;
}

/**
 * Cast a ranked vote
 */
export async function voteRanked(
    pollId: UUID,
    playerId: UUID,
    rankings: { optionId: UUID; rank: number }[]
): Promise<Poll | undefined> {
    const poll = await db.polls.get(pollId);
    if (!poll || poll.status !== 'active' || poll.type !== 'ranked') {
        return undefined;
    }

    // For ranked voting, we store the vote with rank in a simple way
    // Clear existing votes
    for (const option of poll.options) {
        option.votes = option.votes.filter(id => id !== playerId);
        option.rank = undefined;
    }

    // Add votes with rankings (we'll calculate winner differently)
    for (const { optionId, rank: _rank } of rankings) {
        const option = poll.options.find(o => o.id === optionId);
        if (option) {
            option.votes.push(playerId);
            // Store rank info (simplified - in production would use separate table)
        }
    }

    await db.polls.update(pollId, { options: poll.options });
    return poll;
}

/**
 * Remove vote
 */
export async function removeVote(
    pollId: UUID,
    playerId: UUID
): Promise<Poll | undefined> {
    const poll = await db.polls.get(pollId);
    if (!poll || poll.status !== 'active') {
        return undefined;
    }

    for (const option of poll.options) {
        option.votes = option.votes.filter(id => id !== playerId);
    }

    await db.polls.update(pollId, { options: poll.options });
    return poll;
}

/**
 * Get vote by player
 */
export function getPlayerVote(poll: Poll, playerId: UUID): UUID[] {
    return poll.options
        .filter(o => o.votes.includes(playerId))
        .map(o => o.id);
}

/**
 * Check if player has voted
 */
export function hasPlayerVoted(poll: Poll, playerId: UUID): boolean {
    return poll.options.some(o => o.votes.includes(playerId));
}

// ============================================
// RESULTS
// ============================================

/**
 * Get poll results
 */
export function getPollResults(poll: Poll): {
    winner?: PollOption;
    isTie: boolean;
    results: { option: PollOption; voteCount: number; percentage: number }[];
    totalVotes: number;
    totalVoters: number;
} {
    const voterSet = new Set<UUID>();
    for (const option of poll.options) {
        for (const voterId of option.votes) {
            voterSet.add(voterId);
        }
    }

    const totalVoters = voterSet.size;
    const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);

    const results = poll.options
        .map(option => ({
            option,
            voteCount: option.votes.length,
            percentage: totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0,
        }))
        .sort((a, b) => b.voteCount - a.voteCount);

    const maxVotes = results[0]?.voteCount || 0;
    const topOptions = results.filter(r => r.voteCount === maxVotes);
    const isTie = topOptions.length > 1 && maxVotes > 0;

    return {
        winner: isTie ? undefined : results[0]?.option,
        isTie,
        results,
        totalVotes,
        totalVoters,
    };
}

/**
 * Get formatted results for display
 */
export function formatPollResults(poll: Poll): string {
    const { winner, isTie, results, totalVoters } = getPollResults(poll);

    if (totalVoters === 0) {
        return 'No votes yet';
    }

    let output = `${totalVoters} ${totalVoters === 1 ? 'vote' : 'votes'}\n\n`;

    for (const result of results) {
        const bar = '█'.repeat(Math.round(result.percentage / 5));
        const emoji = result.option.emoji ? `${result.option.emoji} ` : '';
        output += `${emoji}${result.option.text}\n`;
        output += `${bar} ${result.voteCount} (${Math.round(result.percentage)}%)\n\n`;
    }

    if (poll.status === 'closed') {
        if (isTie) {
            output += `\n🤝 It's a tie!`;
        } else if (winner) {
            output += `\n🏆 Winner: ${winner.text}`;
        }
    }

    return output;
}

// ============================================
// POLL QUERIES
// ============================================

/**
 * Get active polls for a trip
 */
export async function getActivePolls(tripId: UUID): Promise<Poll[]> {
    return getTripPolls(tripId, 'active');
}

/**
 * Get polls requiring player's vote
 */
export async function getPollsAwaitingVote(
    tripId: UUID,
    playerId: UUID
): Promise<Poll[]> {
    const activePolls = await getActivePolls(tripId);
    return activePolls.filter(poll => !hasPlayerVoted(poll, playerId));
}

/**
 * Get polls created by a player
 */
export async function getMyPolls(tripId: UUID, playerId: UUID): Promise<Poll[]> {
    const polls = await db.polls.where('tripId').equals(tripId).toArray();
    return polls.filter(p => p.creatorId === playerId);
}

/**
 * Get polls by category
 */
export async function getPollsByCategory(
    tripId: UUID,
    category: PollCategory
): Promise<Poll[]> {
    const polls = await db.polls.where('tripId').equals(tripId).toArray();
    return polls.filter(p => p.category === category);
}
