// Polyfill is loaded at app entry point (index.js)
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { Transaction, Keypair } from '@solana/web3.js';

export interface KeyPair {
    publicKey: Uint8Array;
    secretKey: Uint8Array;
}

/**
 * Generate a new Ed25519 keypair for the user identity (signing)
 */
export function generateKeypair(): KeyPair {
    return nacl.sign.keyPair();
}

/**
 * Generate keypair from seed (for deterministic recovery)
 */
export function generateKeypairFromSeed(seed: Uint8Array): KeyPair {
    return nacl.sign.keyPair.fromSeed(seed);
}

/**
 * Get the X25519 encryption keypair from Ed25519 signing keypair
 * Used for box encryption (private messaging)
 */
export function getEncryptionKeypair(signingKeypair: KeyPair): {
    publicKey: Uint8Array;
    secretKey: Uint8Array;
} {
    return nacl.box.keyPair.fromSecretKey(signingKeypair.secretKey.slice(0, 32));
}

/**
 * Convert Ed25519 signing public key to X25519 encryption public key
 * This uses the seed approach - the recipient's encryption pubkey is derived
 * from their signing secret key, so we can't convert just from public key.
 * 
 * For messaging, users should exchange/store encryption public keys, not signing keys.
 */
export function getEncryptionPublicKey(signingKeypair: KeyPair): Uint8Array {
    const encKeypair = nacl.box.keyPair.fromSecretKey(signingKeypair.secretKey.slice(0, 32));
    return encKeypair.publicKey;
}

/**
 * Encrypt a message for a recipient
 * @param message - The plaintext message
 * @param recipientEncryptionKey - Recipient's X25519 encryption public key (32 bytes)
 * @param senderSecretKey - Sender's X25519 encryption secret key (32 bytes)
 * @returns Base64 encoded encrypted message with nonce
 */
export function encryptMessage(
    message: string,
    recipientEncryptionKey: Uint8Array,
    senderSecretKey: Uint8Array
): string {
    // Validate key sizes
    if (recipientEncryptionKey.length !== 32) {
        throw new Error(`bad public key size: expected 32, got ${recipientEncryptionKey.length}`);
    }
    if (senderSecretKey.length !== 32) {
        throw new Error(`bad secret key size: expected 32, got ${senderSecretKey.length}`);
    }

    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageUint8 = new TextEncoder().encode(message);

    const encrypted = nacl.box(messageUint8, nonce, recipientEncryptionKey, senderSecretKey);

    if (!encrypted) {
        throw new Error('Encryption failed');
    }

    // Combine nonce + encrypted message
    const combined = new Uint8Array(nonce.length + encrypted.length);
    combined.set(nonce);
    combined.set(encrypted, nonce.length);

    return uint8ToBase64(combined);
}

/**
 * Decrypt a message from a sender
 * @param encryptedBase64 - Base64 encoded encrypted message with nonce
 * @param senderEncryptionKey - Sender's X25519 encryption public key
 * @param recipientSecretKey - Recipient's X25519 encryption secret key
 * @returns Decrypted plaintext message
 */
export function decryptMessage(
    encryptedBase64: string,
    senderEncryptionKey: Uint8Array,
    recipientSecretKey: Uint8Array
): string {
    const combined = base64ToUint8(encryptedBase64);
    const nonce = combined.slice(0, nacl.box.nonceLength);
    const encrypted = combined.slice(nacl.box.nonceLength);

    const decrypted = nacl.box.open(encrypted, nonce, senderEncryptionKey, recipientSecretKey);

    if (!decrypted) {
        throw new Error('Decryption failed - invalid key or corrupted message');
    }

    return new TextDecoder().decode(decrypted);
}

/**
 * Sign a message with the user's signing key
 */
export function signMessage(message: Uint8Array, secretKey: Uint8Array): Uint8Array {
    return nacl.sign.detached(message, secretKey);
}

/**
 * Verify a signature
 */
export function verifySignature(
    message: Uint8Array,
    signature: Uint8Array,
    publicKey: Uint8Array
): boolean {
    return nacl.sign.detached.verify(message, signature, publicKey);
}

// Helper functions (Base64 / Hex)
export function uint8ToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export function base64ToUint8(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

export function uint8ToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

export function hexToUint8(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

/**
 * Encode bytes to base58 (Solana-compatible)
 * Uses bs58 library for reliability
 */
export function uint8ToBase58(bytes: Uint8Array): string {
    return bs58.encode(bytes);
}

/**
 * Decode base58 to bytes
 */
export function base58ToUint8(str: string): Uint8Array {
    return bs58.decode(str);
}

/**
 * Sign a Solana transaction with the user's Ed25519 keypair
 * The transaction is expected to be a base64-encoded serialized transaction
 * 
 * @param transactionBase64 - Base64 encoded unsigned transaction
 * @param secretKey - Ed25519 secret key (64 bytes)
 * @returns Base64 encoded signed transaction
 */
export function signTransaction(transactionBase64: string, secretKey: Uint8Array): string {
    // Decode the transaction
    const txBytes = base64ToUint8(transactionBase64);

    // Reconstruct transaction object
    const transaction = Transaction.from(txBytes);

    // Create signer instance
    const keypair = Keypair.fromSecretKey(secretKey);

    // partialSign adds the signature to the transaction
    transaction.partialSign(keypair);

    // Serialize back to base64
    const serialized = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
    });

    return uint8ToBase64(serialized);
}
