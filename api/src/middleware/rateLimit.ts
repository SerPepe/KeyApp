import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

// Rate limiter: 1 message per 2 seconds per user
const rateLimiter = new RateLimiterMemory({
    points: config.rateLimit.points,
    duration: config.rateLimit.duration,
});

export async function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    // Use public key from body as identifier (support both field names), fallback to IP
    const identifier = req.body?.senderPubkey || req.body?.senderPublicKey || req.ip || 'unknown';

    try {
        await rateLimiter.consume(identifier);
        next();
    } catch (rejRes) {
        res.status(429).json({
            error: 'Too many requests',
            message: 'You can send 1 message every 2 seconds',
            retryAfter: config.rateLimit.duration,
        });
    }
}
