/**
 * Social Service - Group Chat & Trash Talk
 *
 * Handles real-time messaging, reactions, mentions, and trash talk board.
 */

import { db } from '@/lib/db';
import type { UUID, ISODateString } from '@/lib/types/models';
import type {
    ChatMessage,
    ChatThread,
    MessageReaction,
    MessageType,
    TrashTalk,
    TrashTalkComment,
    TrashTalkType,
    MemeTemplate,
} from '@/lib/types/social';

// ============================================
// CHAT THREADS
// ============================================

/**
 * Create the default chat threads for a trip
 */
export async function createDefaultThreads(tripId: UUID, teamAName: string, teamBName: string): Promise<ChatThread[]> {
    const now = new Date().toISOString();

    const threads: ChatThread[] = [
        {
            id: crypto.randomUUID(),
            tripId,
            name: 'Main Chat',
            type: 'main',
            participantIds: [], // All players
            unreadCount: 0,
            createdAt: now,
        },
        {
            id: crypto.randomUUID(),
            tripId,
            name: teamAName,
            type: 'team_a',
            participantIds: [], // Team A players
            unreadCount: 0,
            createdAt: now,
        },
        {
            id: crypto.randomUUID(),
            tripId,
            name: teamBName,
            type: 'team_b',
            participantIds: [], // Team B players
            unreadCount: 0,
            createdAt: now,
        },
        {
            id: crypto.randomUUID(),
            tripId,
            name: 'Captains Only',
            type: 'captains',
            participantIds: [], // Captain IDs
            unreadCount: 0,
            createdAt: now,
        },
    ];

    await db.chatThreads.bulkAdd(threads);
    return threads;
}

/**
 * Get all threads for a trip
 */
export async function getTripThreads(tripId: UUID): Promise<ChatThread[]> {
    return db.chatThreads.where('tripId').equals(tripId).sortBy('createdAt');
}

/**
 * Create a custom chat thread
 */
export async function createCustomThread(
    tripId: UUID,
    name: string,
    participantIds: UUID[]
): Promise<ChatThread> {
    const thread: ChatThread = {
        id: crypto.randomUUID(),
        tripId,
        name,
        type: 'custom',
        participantIds,
        unreadCount: 0,
        createdAt: new Date().toISOString(),
    };

    await db.chatThreads.add(thread);
    return thread;
}

// ============================================
// CHAT MESSAGES
// ============================================

/**
 * Send a chat message
 */
export async function sendMessage(
    tripId: UUID,
    threadId: UUID | undefined,
    senderId: UUID,
    senderName: string,
    content: string,
    type: MessageType = 'text',
    options?: {
        imageUrl?: string;
        gifUrl?: string;
        pollId?: UUID;
        mentions?: UUID[];
        replyToId?: UUID;
    }
): Promise<ChatMessage> {
    const now = new Date().toISOString();

    const message: ChatMessage = {
        id: crypto.randomUUID(),
        tripId,
        threadId,
        authorId: senderId,
        senderId,
        senderName,
        type,
        content,
        imageUrl: options?.imageUrl,
        gifUrl: options?.gifUrl,
        pollId: options?.pollId,
        mentions: options?.mentions || [],
        replyToId: options?.replyToId,
        reactions: [],
        isEdited: false,
        isDeleted: false,
        timestamp: now,
        createdAt: now,
    };

    await db.chatMessages.add(message);

    // Update thread's last message time
    if (threadId) {
        await db.chatThreads.update(threadId, { lastMessageAt: now });
    }

    return message;
}

/**
 * Get messages for a trip or thread
 */
export async function getMessages(
    tripId: UUID,
    threadId?: UUID,
    limit: number = 50,
    beforeTimestamp?: ISODateString
): Promise<ChatMessage[]> {
    let query = db.chatMessages.where('tripId').equals(tripId);

    if (threadId) {
        query = db.chatMessages.where('[threadId+timestamp]').between(
            [threadId, ''],
            [threadId, beforeTimestamp || '\uffff']
        );
    }

    const messages = await query.reverse().limit(limit).toArray();
    return messages.reverse(); // Return in chronological order
}

/**
 * Add a reaction to a message
 */
export async function addReaction(
    messageId: UUID,
    emoji: string,
    playerId: UUID
): Promise<ChatMessage | undefined> {
    const message = await db.chatMessages.get(messageId);
    if (!message) return undefined;

    const existingReaction = message.reactions.find(r => r.emoji === emoji);

    if (existingReaction) {
        if (!existingReaction.playerIds.includes(playerId)) {
            existingReaction.playerIds.push(playerId);
        }
    } else {
        message.reactions.push({
            emoji,
            playerIds: [playerId],
        });
    }

    await db.chatMessages.update(messageId, { reactions: message.reactions });
    return message;
}

/**
 * Remove a reaction from a message
 */
export async function removeReaction(
    messageId: UUID,
    emoji: string,
    playerId: UUID
): Promise<ChatMessage | undefined> {
    const message = await db.chatMessages.get(messageId);
    if (!message) return undefined;

    const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
    if (reactionIndex === -1) return message;

    const reaction = message.reactions[reactionIndex];
    reaction.playerIds = reaction.playerIds.filter(id => id !== playerId);

    if (reaction.playerIds.length === 0) {
        message.reactions.splice(reactionIndex, 1);
    }

    await db.chatMessages.update(messageId, { reactions: message.reactions });
    return message;
}

/**
 * Edit a message
 */
export async function editMessage(
    messageId: UUID,
    newContent: string
): Promise<ChatMessage | undefined> {
    const message = await db.chatMessages.get(messageId);
    if (!message) return undefined;

    const updates = {
        content: newContent,
        isEdited: true,
        updatedAt: new Date().toISOString(),
    };

    await db.chatMessages.update(messageId, updates);
    return { ...message, ...updates };
}

/**
 * Delete a message (soft delete)
 */
export async function deleteMessage(messageId: UUID): Promise<void> {
    await db.chatMessages.update(messageId, {
        isDeleted: true,
        content: '[Message deleted]',
    });
}

/**
 * Search messages
 */
export async function searchMessages(
    tripId: UUID,
    searchTerm: string
): Promise<ChatMessage[]> {
    const allMessages = await db.chatMessages.where('tripId').equals(tripId).toArray();
    const lowerSearch = searchTerm.toLowerCase();

    return allMessages.filter(m =>
        !m.isDeleted &&
        (m.content.toLowerCase().includes(lowerSearch) ||
            m.senderName.toLowerCase().includes(lowerSearch))
    );
}

// ============================================
// TRASH TALK BOARD
// ============================================

/**
 * Post to the trash talk board
 */
export async function postTrashTalk(
    tripId: UUID,
    authorId: UUID,
    authorName: string,
    content: string,
    type: TrashTalkType = 'text',
    options?: {
        imageUrl?: string;
        gifUrl?: string;
        targetPlayerId?: UUID;
        targetTeam?: 'usa' | 'europe';
        memeTemplateId?: string;
    }
): Promise<TrashTalk> {
    const now = new Date().toISOString();

    const trashTalk: TrashTalk = {
        id: crypto.randomUUID(),
        tripId,
        authorId,
        authorName,
        targetId: options?.targetPlayerId,
        type,
        content,
        imageUrl: options?.imageUrl,
        gifUrl: options?.gifUrl,
        targetPlayerId: options?.targetPlayerId,
        targetTeam: options?.targetTeam,
        memeTemplateId: options?.memeTemplateId,
        likes: [],
        comments: [],
        isPinned: false,
        timestamp: now,
        createdAt: now,
    };

    await db.trashTalks.add(trashTalk);
    return trashTalk;
}

/**
 * Get trash talk posts for a trip
 */
export async function getTrashTalkPosts(
    tripId: UUID,
    limit: number = 20
): Promise<TrashTalk[]> {
    // Get pinned posts first, then recent posts
    const allPosts = await db.trashTalks
        .where('tripId')
        .equals(tripId)
        .reverse()
        .sortBy('timestamp');

    const pinnedPosts = allPosts.filter(p => p.isPinned);
    const regularPosts = allPosts.filter(p => !p.isPinned).slice(0, limit);

    return [...pinnedPosts, ...regularPosts];
}

/**
 * Like a trash talk post
 */
export async function likeTrashTalk(postId: UUID, playerId: UUID): Promise<TrashTalk | undefined> {
    const post = await db.trashTalks.get(postId);
    if (!post) return undefined;

    if (!post.likes.includes(playerId)) {
        post.likes.push(playerId);
        await db.trashTalks.update(postId, { likes: post.likes });
    }

    return post;
}

/**
 * Unlike a trash talk post
 */
export async function unlikeTrashTalk(postId: UUID, playerId: UUID): Promise<TrashTalk | undefined> {
    const post = await db.trashTalks.get(postId);
    if (!post) return undefined;

    post.likes = post.likes.filter(id => id !== playerId);
    await db.trashTalks.update(postId, { likes: post.likes });

    return post;
}

/**
 * Add a comment to a trash talk post
 */
export async function addTrashTalkComment(
    postId: UUID,
    authorId: UUID,
    authorName: string,
    content: string
): Promise<TrashTalk | undefined> {
    const post = await db.trashTalks.get(postId);
    if (!post) return undefined;

    const comment: TrashTalkComment = {
        id: crypto.randomUUID(),
        authorId,
        authorName,
        content,
        createdAt: new Date().toISOString(),
    };

    post.comments.push(comment);
    await db.trashTalks.update(postId, { comments: post.comments });

    return post;
}

/**
 * Pin/unpin a trash talk post
 */
export async function toggleTrashTalkPin(postId: UUID): Promise<TrashTalk | undefined> {
    const post = await db.trashTalks.get(postId);
    if (!post) return undefined;

    post.isPinned = !post.isPinned;
    await db.trashTalks.update(postId, { isPinned: post.isPinned });

    return post;
}

/**
 * Delete a trash talk post
 */
export async function deleteTrashTalk(postId: UUID): Promise<void> {
    await db.trashTalks.delete(postId);
}

// ============================================
// MEME TEMPLATES
// ============================================

/**
 * Golf-themed meme templates
 */
export const MEME_TEMPLATES: MemeTemplate[] = [
    {
        id: 'success-kid',
        name: 'Success Kid',
        imageUrl: '/memes/success-kid.jpg',
        topTextPlaceholder: 'Finally hit a fairway',
        bottomTextPlaceholder: 'With my putter',
        category: 'golf',
    },
    {
        id: 'disaster-girl',
        name: 'Disaster Girl',
        imageUrl: '/memes/disaster-girl.jpg',
        topTextPlaceholder: "Your partner's ball",
        bottomTextPlaceholder: 'In the water',
        category: 'golf',
    },
    {
        id: 'one-does-not',
        name: 'One Does Not Simply',
        imageUrl: '/memes/one-does-not.jpg',
        topTextPlaceholder: 'One does not simply',
        bottomTextPlaceholder: '3-putt from 4 feet',
        category: 'golf',
    },
    {
        id: 'drake',
        name: 'Drake Approves',
        imageUrl: '/memes/drake.jpg',
        topTextPlaceholder: 'Playing it safe',
        bottomTextPlaceholder: 'Going for the green',
        category: 'golf',
    },
    {
        id: 'change-my-mind',
        name: 'Change My Mind',
        imageUrl: '/memes/change-my-mind.jpg',
        topTextPlaceholder: '[Player name]',
        bottomTextPlaceholder: "Can't hit a draw. Change my mind.",
        category: 'golf',
    },
    {
        id: 'distracted-bf',
        name: 'Distracted Boyfriend',
        imageUrl: '/memes/distracted-bf.jpg',
        topTextPlaceholder: 'Me looking at the cart girl',
        bottomTextPlaceholder: 'My playing partners waiting',
        category: 'golf',
    },
    {
        id: 'expanding-brain',
        name: 'Expanding Brain',
        imageUrl: '/memes/expanding-brain.jpg',
        topTextPlaceholder: 'Playing bogey golf',
        bottomTextPlaceholder: 'Playing wolf alone',
        category: 'golf',
    },
    {
        id: 'this-is-fine',
        name: 'This Is Fine',
        imageUrl: '/memes/this-is-fine.jpg',
        topTextPlaceholder: '4 down after 5 holes',
        bottomTextPlaceholder: 'This is fine',
        category: 'golf',
    },
];

/**
 * Get meme templates by category
 */
export function getMemeTemplates(category?: MemeTemplate['category']): MemeTemplate[] {
    if (!category) return MEME_TEMPLATES;
    return MEME_TEMPLATES.filter(t => t.category === category);
}

/**
 * Create a meme post from a template
 */
export function createMemePost(
    tripId: UUID,
    authorId: UUID,
    authorName: string,
    templateId: string,
    topText: string,
    bottomText: string,
    targetPlayerId?: UUID
): Promise<TrashTalk> {
    const template = MEME_TEMPLATES.find(t => t.id === templateId);
    const content = `${topText}\n${bottomText}`;

    return postTrashTalk(tripId, authorId, authorName, content, 'meme', {
        imageUrl: template?.imageUrl,
        targetPlayerId,
        memeTemplateId: templateId,
    });
}

// ============================================
// POPULAR EMOJIS FOR REACTIONS
// ============================================

export const POPULAR_REACTIONS = ['👍', '😂', '🔥', '⛳', '👏', '😱', '💀', '🍺', '🏆', '💩'];

export const GOLF_EMOJIS = ['⛳', '🏌️', '🏌️‍♂️', '🏌️‍♀️', '🎯', '🦅', '🐦', '🦆', '⭐', '💥'];
