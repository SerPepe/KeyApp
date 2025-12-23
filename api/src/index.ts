import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { initFeePayer, getFeePayerBalance, connection } from './services/solana.js';
import relayRouter from './routes/relay.js';
import usernameRouter from './routes/username.js';
import configRouter from './routes/config.js';
import messageRouter from './routes/message.js';
import blockRouter from './routes/block.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', async (_req, res) => {
    try {
        const balance = await getFeePayerBalance();
        const slot = await connection.getSlot();

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            feePayerBalance: `${balance.toFixed(4)} SOL`,
            solanaSlot: slot,
            rateLimit: `${config.rateLimit.points} msg per ${config.rateLimit.duration}s`,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// API Routes
app.use('/api/relay', relayRouter);
app.use('/api/username', usernameRouter);
app.use('/api/config', configRouter);
app.use('/api/message', messageRouter);
app.use('/api/block', blockRouter);

// Start server
async function start() {
    console.log('🔑 Key Fee Payer API');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 Network: ${config.network}`);
    console.log(`📦 Version: ${config.appVersion} (${config.gitCommit.slice(0, 7)})`);

    // Initialize fee payer
    initFeePayer();

    // Check balance
    try {
        const balance = await getFeePayerBalance();
        console.log(`💰 Fee Payer Balance: ${balance.toFixed(4)} SOL`);

        if (balance < 0.01) {
            console.warn('⚠️  Low balance! Please fund the fee payer wallet');
        }
    } catch (error) {
        console.warn('⚠️  Could not check balance:', error);
    }

    // Start listening - bind to 0.0.0.0 for VPS/Railway
    app.listen(config.port, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${config.port}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Endpoints:');
        console.log(`  GET  /health`);
        console.log(`  GET  /api/config`);
        console.log(`  POST /api/relay`);
        console.log(`  GET  /api/username/:name/check`);
        console.log(`  POST /api/username/register`);
        console.log(`  POST /api/message/send`);
    });
}

start().catch(console.error);
