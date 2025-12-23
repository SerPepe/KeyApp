/**
 * Block routes - manage user blocking/unblocking
 */
import { Router, Request, Response } from 'express';
import { blockUser, unblockUser, isBlocked, getBlockedUsers } from '../services/redis';

const router = Router();

/**
 * POST /api/block - Block a user
 * Body: { blockerPubkey, blockedPubkey }
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { blockerPubkey, blockedPubkey } = req.body;

        if (!blockerPubkey || !blockedPubkey) {
            return res.status(400).json({ error: 'Missing blockerPubkey or blockedPubkey' });
        }

        if (blockerPubkey === blockedPubkey) {
            return res.status(400).json({ error: 'Cannot block yourself' });
        }

        await blockUser(blockerPubkey, blockedPubkey);
        console.log(`🚫 User ${blockerPubkey.slice(0, 8)}... blocked ${blockedPubkey.slice(0, 8)}...`);

        res.json({ success: true, message: 'User blocked successfully' });
    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ error: 'Failed to block user' });
    }
});

/**
 * DELETE /api/block - Unblock a user
 * Body: { blockerPubkey, blockedPubkey }
 */
router.delete('/', async (req: Request, res: Response) => {
    try {
        const { blockerPubkey, blockedPubkey } = req.body;

        if (!blockerPubkey || !blockedPubkey) {
            return res.status(400).json({ error: 'Missing blockerPubkey or blockedPubkey' });
        }

        await unblockUser(blockerPubkey, blockedPubkey);
        console.log(`✅ User ${blockerPubkey.slice(0, 8)}... unblocked ${blockedPubkey.slice(0, 8)}...`);

        res.json({ success: true, message: 'User unblocked successfully' });
    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({ error: 'Failed to unblock user' });
    }
});

/**
 * GET /api/block/check - Check if a user is blocked
 * Query: ?blocker=<pubkey>&blocked=<pubkey>
 */
router.get('/check', async (req: Request, res: Response) => {
    try {
        const { blocker, blocked } = req.query;

        if (!blocker || !blocked) {
            return res.status(400).json({ error: 'Missing blocker or blocked query params' });
        }

        const blocked_status = await isBlocked(blocker as string, blocked as string);
        res.json({ isBlocked: blocked_status });
    } catch (error) {
        console.error('Check block status error:', error);
        res.status(500).json({ error: 'Failed to check block status' });
    }
});

/**
 * GET /api/block/list/:pubkey - Get all blocked users for a pubkey
 */
router.get('/list/:pubkey', async (req: Request, res: Response) => {
    try {
        const { pubkey } = req.params;

        if (!pubkey) {
            return res.status(400).json({ error: 'Missing pubkey parameter' });
        }

        const blockedUsers = await getBlockedUsers(pubkey);
        res.json({ blockedUsers });
    } catch (error) {
        console.error('Get blocked users error:', error);
        res.status(500).json({ error: 'Failed to get blocked users' });
    }
});

export default router;
