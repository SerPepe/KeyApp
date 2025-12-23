import { Request, Response, NextFunction } from 'express';
import { redis } from '../services/redis.js';
import { config } from '../config.js';

const SPENDING_KEY_PREFIX = 'spending:day:';
const SECONDS_IN_DAY = 86400;

/**
 * Middleware to enforce daily spending limits per user
 * This prevents a single user from draining the fee payer wallet
 */
export async function spendingLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    // 1. Identify User
    // Use public key from body if available, otherwise fallback to IP (less secure but better than nothing)
    const userIdentifier = req.body?.senderPublicKey || req.body?.ownerPublicKey || req.body?.publicKey || req.ip || 'unknown';

    // 2. Estimate Cost
    // Standard transaction is ~5000 lamports (0.000005 SOL)
    // We'll use a conservative estimate for tracking
    const ESTIMATED_TX_COST_SOL = 0.000005;

    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const key = `${SPENDING_KEY_PREFIX}${today}:${userIdentifier}`;

        // Get current usage
        const currentUsageStr = await redis.get<string>(key);
        const currentUsage = currentUsageStr ? parseFloat(currentUsageStr) : 0;

        // Check if limit exceeded
        if (currentUsage >= config.spendingLimits.maxDailySolPerUser) {
            console.warn(`🛑 User ${userIdentifier} exceeded daily spending limit: ${currentUsage.toFixed(6)} SOL`);
            res.status(429).json({
                error: 'Daily limit exceeded',
                message: 'You have reached your daily transaction limit. Please try again tomorrow.',
                limit: `${config.spendingLimits.maxDailySolPerUser} SOL`,
                usage: `${currentUsage.toFixed(6)} SOL`
            });
            return;
        }

        // Increment usage (atomic incrbyfloat not supported by all Redis, so we calculate and set)
        // Upstash supports incrbyfloat but let's be safe with get/set for now or use if available
        // We'll just optimistic update for simplicity in this middleware
        const newUsage = currentUsage + ESTIMATED_TX_COST_SOL;

        // Save with expiry (24h)
        await redis.set(key, newUsage.toString(), { ex: SECONDS_IN_DAY });

        next();
    } catch (error) {
        console.error('Spending limit check failed:', error);
        // Fail open if Redis is down? Or fail closed?
        // Let's fail open to not break service, but log error
        next();
    }
}
