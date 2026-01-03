# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KeyApp is a privacy-first messaging app built on Solana with end-to-end encryption. The app abstracts blockchain complexity from users—they don't see wallets, SOL, or gas fees. Users generate a local Ed25519 keypair, register a username on-chain, and exchange encrypted messages.

## Monorepo Structure

- **`/app`** - Expo React Native client (iOS, Android, Web) using Expo Router
- **`/web`** - Next.js marketing site
- **`/api`** - Express.js + TypeScript fee-payer backend
- **`/programs/key-registry`** - Anchor/Solana on-chain program (Rust)

## Build & Development Commands

### App (Expo)
```bash
cd app
npm install
npm start              # Expo bundler
npm run ios            # iOS simulator
npm run android        # Android emulator
npm run web            # Browser
```

### Web (Next.js)
```bash
cd web
npm install
npm run dev            # Development server
npm run build          # Production build
npm run lint           # ESLint check
```

### API (Express)
```bash
cd api
npm install
npm run dev            # Watch mode with tsx
npm run build          # Compile TypeScript → dist/
npm start              # Run compiled server
npm test               # Run tests with Vitest
```

### On-Chain Programs
```bash
anchor build           # Compile Rust program
anchor test            # Run ts-mocha tests
cargo fmt && cargo clippy  # Format & lint Rust
```

## Architecture

### Authentication & Key Management
- Users generate Ed25519 keypair locally (Solana-compatible)
- Keypair stored in Expo SecureStore (encrypted local storage)
- Username registered on-chain via Anchor program
- Public key base58 used for identification

### Encryption Model
- **Signing**: Ed25519 for transaction signing
- **Messaging**: X25519 Diffie-Hellman key exchange derived from signing keys
- **Message format**: Base64 encoded (nonce + encrypted payload)
- Uses TweetNaCl library for all cryptographic operations

### Transaction Flow (Gasless)
1. Client builds unsigned Solana transaction
2. Client signs with own keypair
3. Client sends to API with signature
4. API verifies signature (replay protection: 5-min window)
5. API adds fee payer signature
6. API submits to Solana via RPC

### Real-Time Messaging
- WebSocket listener in `app/lib/websocket.ts` for incoming messages
- Push notifications via Expo Notifications
- Message deduplication and unread count tracking

## Key Files

- `app/lib/crypto.ts` - Ed25519 & X25519 encryption/signing
- `app/lib/keychain.ts` - Secure key storage abstraction
- `app/lib/api.ts` - API client with signature generation
- `api/src/middleware/auth.ts` - Signature verification
- `api/src/routes/message.ts` - Message sending endpoint
- `programs/key-registry/src/lib.rs` - Username registry program

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check + fee payer balance |
| GET | `/api/config` | App config & version |
| POST | `/api/username/register` | Register new username |
| POST | `/api/message/send` | Send encrypted message |
| POST | `/api/relay` | Relay signed transaction |
| POST | `/api/block` | Block/unblock user |

## Environment Variables

### App
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### API
```
SOLANA_RPC_URL=https://api.devnet.solana.com
FEE_PAYER_PRIVATE_KEY=<base58-encoded-key>
NETWORK=devnet|mainnet-beta
UPSTASH_REDIS_REST_URL=<url>
UPSTASH_REDIS_REST_TOKEN=<token>
```

## Coding Conventions

- TypeScript/TSX throughout; 2-space indentation
- React components: PascalCase filenames; hooks/utilities in camelCase
- Co-locate components with feature folders
- Run `cargo fmt && cargo clippy` before pushing Rust changes
- Keep diffs isolated per domain (app/web/api/programs)

## Testing

- **API**: Vitest for unit/integration tests; mock RPC calls for determinism
- **Programs**: `anchor test` with deterministic keypairs
- **Frontend**: React Testing Library for component tests
