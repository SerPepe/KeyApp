import { Router, Request, Response } from 'express';
import { redis } from '../services/redis.js';
import { verifySignature } from '../middleware/auth.js';
import nacl from 'tweetnacl';

const router = Router();

const GROUPS_PREFIX = 'group:';
const GROUP_MEMBERS_PREFIX = 'group:members:';
const USER_GROUPS_PREFIX = 'user:groups:';

interface CreateGroupRequest {
    name: string;
    ownerPubkey: string;
    signature: string;
    timestamp: number;
}

interface GroupMemberRequest {
    groupId: string;
    memberPubkey: string;
    ownerPubkey: string;
    signature: string;
    timestamp: number;
}

/**
 * Generate a unique group ID
 */
function generateGroupId(): string {
    const bytes = nacl.randomBytes(16);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * POST /api/groups/create
 * Create a new group
 */
router.post('/create', async (req: Request, res: Response) => {
    try {
        const { name, ownerPubkey, signature, timestamp } = req.body as CreateGroupRequest;

        if (!name || !ownerPubkey) {
            return res.status(400).json({ error: 'Missing name or ownerPubkey' });
        }

        // Verify signature
        if (!signature || !timestamp) {
            return res.status(401).json({ error: 'Request must be signed' });
        }

        const expectedMessage = `group:create:${name}:${timestamp}`;
        const isValid = verifySignature(signature, timestamp, expectedMessage, ownerPubkey);

        if (!isValid) {
            return res.status(403).json({ error: 'Invalid signature' });
        }

        const groupId = generateGroupId();

        // Store group metadata
        await redis.hset(`${GROUPS_PREFIX}${groupId}`, {
            name,
            owner: ownerPubkey,
            createdAt: Date.now().toString(),
        });

        // Add owner as first member
        await redis.sadd(`${GROUP_MEMBERS_PREFIX}${groupId}`, ownerPubkey);

        // Add group to owner's group list
        await redis.sadd(`${USER_GROUPS_PREFIX}${ownerPubkey}`, groupId);

        console.log(`👥 Group created: ${groupId} "${name}" by ${ownerPubkey.slice(0, 8)}...`);

        return res.json({ success: true, groupId, name });
    } catch (error) {
        console.error('Create group error:', error);
        return res.status(500).json({ error: 'Failed to create group' });
    }
});

/**
 * POST /api/groups/invite
 * Add a member to a group (owner only)
 */
router.post('/invite', async (req: Request, res: Response) => {
    try {
        const { groupId, memberPubkey, ownerPubkey, signature, timestamp } = req.body as GroupMemberRequest;

        if (!groupId || !memberPubkey || !ownerPubkey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify owner
        const group = await redis.hgetall(`${GROUPS_PREFIX}${groupId}`) as Record<string, string>;
        if (!group || group.owner !== ownerPubkey) {
            return res.status(403).json({ error: 'Only group owner can invite' });
        }

        // Verify signature
        const expectedMessage = `group:invite:${groupId}:${memberPubkey}:${timestamp}`;
        const isValid = verifySignature(signature, timestamp, expectedMessage, ownerPubkey);

        if (!isValid) {
            return res.status(403).json({ error: 'Invalid signature' });
        }

        // Add member
        await redis.sadd(`${GROUP_MEMBERS_PREFIX}${groupId}`, memberPubkey);
        await redis.sadd(`${USER_GROUPS_PREFIX}${memberPubkey}`, groupId);

        console.log(`👥 Member added to ${groupId}: ${memberPubkey.slice(0, 8)}...`);

        return res.json({ success: true });
    } catch (error) {
        console.error('Invite error:', error);
        return res.status(500).json({ error: 'Failed to invite member' });
    }
});

/**
 * POST /api/groups/leave
 * Leave a group
 */
router.post('/leave', async (req: Request, res: Response) => {
    try {
        const { groupId, ownerPubkey: userPubkey, signature, timestamp } = req.body;

        if (!groupId || !userPubkey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify signature
        const expectedMessage = `group:leave:${groupId}:${timestamp}`;
        const isValid = verifySignature(signature, timestamp, expectedMessage, userPubkey);

        if (!isValid) {
            return res.status(403).json({ error: 'Invalid signature' });
        }

        // Remove member
        await redis.srem(`${GROUP_MEMBERS_PREFIX}${groupId}`, userPubkey);
        await redis.srem(`${USER_GROUPS_PREFIX}${userPubkey}`, groupId);

        console.log(`👥 Member left ${groupId}: ${userPubkey.slice(0, 8)}...`);

        return res.json({ success: true });
    } catch (error) {
        console.error('Leave error:', error);
        return res.status(500).json({ error: 'Failed to leave group' });
    }
});

/**
 * GET /api/groups/:groupId
 * Get group info and members
 */
router.get('/:groupId', async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;

        const group = await redis.hgetall(`${GROUPS_PREFIX}${groupId}`) as Record<string, string>;
        if (!group || !group.name) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const members = await redis.smembers(`${GROUP_MEMBERS_PREFIX}${groupId}`) as string[];

        return res.json({
            groupId,
            name: group.name,
            owner: group.owner,
            createdAt: parseInt(group.createdAt),
            members
        });
    } catch (error) {
        console.error('Get group error:', error);
        return res.status(500).json({ error: 'Failed to get group' });
    }
});

/**
 * GET /api/groups/user/:pubkey
 * Get all groups for a user
 */
router.get('/user/:pubkey', async (req: Request, res: Response) => {
    try {
        const { pubkey } = req.params;

        const groupIds = await redis.smembers(`${USER_GROUPS_PREFIX}${pubkey}`) as string[];

        const groups = await Promise.all(
            groupIds.map(async (groupId) => {
                const group = await redis.hgetall(`${GROUPS_PREFIX}${groupId}`) as Record<string, string>;
                return {
                    groupId,
                    name: group?.name || 'Unknown',
                    owner: group?.owner,
                };
            })
        );

        return res.json({ groups });
    } catch (error) {
        console.error('Get user groups error:', error);
        return res.status(500).json({ error: 'Failed to get groups' });
    }
});

export default router;
