/**
 * Redis client using Upstash for user blocking
 */
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Key prefix for blocked users
const BLOCKED_KEY_PREFIX = 'blocked:';

/**
 * Block a user
 * @param blockerPubkey - The public key of the user doing the blocking
 * @param blockedPubkey - The public key of the user being blocked
 */
export async function blockUser(blockerPubkey: string, blockedPubkey: string): Promise<void> {
    const key = `${BLOCKED_KEY_PREFIX}${blockerPubkey}`;
    await redis.sadd(key, blockedPubkey);
}

/**
 * Unblock a user
 * @param blockerPubkey - The public key of the user doing the unblocking
 * @param blockedPubkey - The public key of the user being unblocked
 */
export async function unblockUser(blockerPubkey: string, blockedPubkey: string): Promise<void> {
    const key = `${BLOCKED_KEY_PREFIX}${blockerPubkey}`;
    await redis.srem(key, blockedPubkey);
}

/**
 * Check if a user is blocked
 * @param blockerPubkey - The public key of the potential blocker
 * @param blockedPubkey - The public key of the user to check
 * @returns true if blocked, false otherwise
 */
export async function isBlocked(blockerPubkey: string, blockedPubkey: string): Promise<boolean> {
    const key = `${BLOCKED_KEY_PREFIX}${blockerPubkey}`;
    return await redis.sismember(key, blockedPubkey) === 1;
}

/**
 * Get all blocked users for a user
 * @param blockerPubkey - The public key of the user
 * @returns Array of blocked public keys
 */
export async function getBlockedUsers(blockerPubkey: string): Promise<string[]> {
    const key = `${BLOCKED_KEY_PREFIX}${blockerPubkey}`;
    return await redis.smembers(key) as string[];
}

/**
 * Test Redis connection
 */
export async function testRedisConnection(): Promise<boolean> {
    try {
        await redis.ping();
        return true;
    } catch (error) {
        console.error('Redis connection failed:', error);
        return false;
    }
}

/**
 * Key prefix for encryption keys (public; safe to persist)
 */
const ENCRYPTION_KEY_PREFIX = 'encryption:';

/**
 * Store a user's encryption key (public X25519 key)
 */
export async function storeEncryptionKey(username: string, encryptionKey: string): Promise<void> {
    const key = `${ENCRYPTION_KEY_PREFIX}${username.toLowerCase()}`;
    await redis.set(key, encryptionKey);
}

/**
 * Retrieve a user's encryption key
 */
export async function getEncryptionKey(username: string): Promise<string | null> {
    const key = `${ENCRYPTION_KEY_PREFIX}${username.toLowerCase()}`;
    return await redis.get<string>(key);
}

/**
 * Delete a user's encryption key (e.g., when username is released)
 */
export async function deleteEncryptionKey(username: string): Promise<void> {
    const key = `${ENCRYPTION_KEY_PREFIX}${username.toLowerCase()}`;
    await redis.del(key);
}

/**
 * Key prefix for message blobs
 */
const MSG_BLOB_PREFIX = 'msg:blob:';

/**
 * Store a large message blob (e.g. image)
 * @param id - Unique message ID
 * @param content - The content to store
 * @param ttlSeconds - Expiration in seconds (default 30 days)
 */
export async function storeMessageBlob(id: string, content: string, ttlSeconds: number = 30 * 24 * 60 * 60): Promise<void> {
    const key = `${MSG_BLOB_PREFIX}${id}`;
    await redis.set(key, content, { ex: ttlSeconds });
}

/**
 * Retrieve a message blob
 * @param id - Unique message ID
 */
export async function getMessageContent(id: string): Promise<string | null> {
    const key = `${MSG_BLOB_PREFIX}${id}`;
    return await redis.get<string>(key);
}

/**
 * Key prefix for user avatars
 */
const AVATAR_PREFIX = 'avatar:';

/**
 * Store a user's avatar (base64 encoded)
 * @param username - The username
 * @param avatarBase64 - Base64 encoded image data
 */
export async function storeAvatar(username: string, avatarBase64: string): Promise<void> {
    const key = `${AVATAR_PREFIX}${username}`;
    // Store avatar indefinitely (no TTL)
    await redis.set(key, avatarBase64);
}

/**
 * Retrieve a user's avatar
 * @param username - The username
 * @returns Base64 encoded image data or null
 */
export async function getAvatar(username: string): Promise<string | null> {
    const key = `${AVATAR_PREFIX}${username}`;
    return await redis.get<string>(key);
}

/**
 * Delete a user's avatar
 * @param username - The username
 */
export async function deleteAvatar(username: string): Promise<void> {
    const key = `${AVATAR_PREFIX}${username}`;
    await redis.del(key);
}

export { redis };
