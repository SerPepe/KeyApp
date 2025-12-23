import { Router } from 'express';
import { storeAvatar, getAvatar, deleteAvatar } from '../services/redis.js';

const router = Router();

/**
 * POST /api/profile/avatar
 * Upload/update user avatar
 * Body: { username: string, avatarBase64: string }
 */
router.post('/avatar', async (req, res) => {
    try {
        const { username, avatarBase64 } = req.body;

        if (!username || !avatarBase64) {
            return res.status(400).json({
                success: false,
                error: 'Missing username or avatarBase64',
            });
        }

        // Limit avatar size (e.g., 500KB base64 ~ 375KB actual)
        if (avatarBase64.length > 500 * 1024) {
            return res.status(400).json({
                success: false,
                error: 'Avatar too large. Max 500KB.',
            });
        }

        await storeAvatar(username, avatarBase64);

        res.json({
            success: true,
            message: 'Avatar updated',
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload avatar',
        });
    }
});

/**
 * GET /api/profile/:username/avatar
 * Get a user's avatar
 */
router.get('/:username/avatar', async (req, res) => {
    try {
        const { username } = req.params;

        const avatarBase64 = await getAvatar(username);

        if (!avatarBase64) {
            return res.status(404).json({
                success: false,
                error: 'Avatar not found',
            });
        }

        res.json({
            success: true,
            avatarBase64,
        });
    } catch (error) {
        console.error('Avatar fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch avatar',
        });
    }
});

/**
 * DELETE /api/profile/:username/avatar
 * Delete a user's avatar
 */
router.delete('/:username/avatar', async (req, res) => {
    try {
        const { username } = req.params;

        await deleteAvatar(username);

        res.json({
            success: true,
            message: 'Avatar deleted',
        });
    } catch (error) {
        console.error('Avatar delete error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete avatar',
        });
    }
});

export default router;
