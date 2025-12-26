import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { generateKeypair, uint8ToBase64, base64ToUint8, type KeyPair } from './crypto';

const PRIVATE_KEY_STORAGE_KEY = 'key_private_key';
const PUBLIC_KEY_STORAGE_KEY = 'key_public_key';
const USERNAME_STORAGE_KEY = 'key_username';

// Web fallback using localStorage (less secure, but works)
const webStorage = {
    async getItemAsync(key: string): Promise<string | null> {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(key);
        }
        return null;
    },
    async setItemAsync(key: string, value: string): Promise<void> {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value);
        }
    },
    async deleteItemAsync(key: string): Promise<void> {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
        }
    },
};

// Use SecureStore on native, localStorage on web
const storage = Platform.OS === 'web' ? webStorage : SecureStore;

/**
 * Store a keypair securely in the device keychain
 */
export async function storeKeypair(keypair: KeyPair): Promise<void> {
    if (Platform.OS === 'web') {
        await storage.setItemAsync(PRIVATE_KEY_STORAGE_KEY, uint8ToBase64(keypair.secretKey));
        await storage.setItemAsync(PUBLIC_KEY_STORAGE_KEY, uint8ToBase64(keypair.publicKey));
    } else {
        // Use AFTER_FIRST_UNLOCK to persist across app reinstalls/updates
        // Keys will survive app deletion and reinstall, and can be restored from iCloud backup
        await SecureStore.setItemAsync(
            PRIVATE_KEY_STORAGE_KEY,
            uint8ToBase64(keypair.secretKey),
            { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK }
        );
        await SecureStore.setItemAsync(
            PUBLIC_KEY_STORAGE_KEY,
            uint8ToBase64(keypair.publicKey),
            { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK }
        );
    }
}

/**
 * Retrieve the stored keypair from device keychain
 */
export async function getStoredKeypair(): Promise<KeyPair | null> {
    try {
        const secretKeyBase64 = await storage.getItemAsync(PRIVATE_KEY_STORAGE_KEY);
        const publicKeyBase64 = await storage.getItemAsync(PUBLIC_KEY_STORAGE_KEY);

        if (!secretKeyBase64 || !publicKeyBase64) {
            return null;
        }

        return {
            secretKey: base64ToUint8(secretKeyBase64),
            publicKey: base64ToUint8(publicKeyBase64),
        };
    } catch (error) {
        console.warn('Keychain access failed (normal on simulator):', error);
        return null;
    }
}

/**
 * Check if user has an identity (keypair) stored
 */
export async function hasStoredIdentity(): Promise<boolean> {
    const keypair = await getStoredKeypair();
    return keypair !== null;
}

/**
 * Create a new identity (generates and stores a keypair)
 */
export async function createIdentity(): Promise<KeyPair> {
    const keypair = generateKeypair();
    await storeKeypair(keypair);
    return keypair;
}

/**
 * Delete the stored identity (for "burn" functionality)
 */
export async function deleteIdentity(): Promise<void> {
    await storage.deleteItemAsync(PRIVATE_KEY_STORAGE_KEY);
    await storage.deleteItemAsync(PUBLIC_KEY_STORAGE_KEY);
    await storage.deleteItemAsync(USERNAME_STORAGE_KEY);
}

/**
 * Store the registered username
 */
export async function storeUsername(username: string): Promise<void> {
    if (Platform.OS === 'web') {
        await storage.setItemAsync(USERNAME_STORAGE_KEY, username);
    } else {
        await SecureStore.setItemAsync(
            USERNAME_STORAGE_KEY,
            username,
            { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK }
        );
    }
}

/**
 * Get the stored username
 */
export async function getStoredUsername(): Promise<string | null> {
    try {
        return await storage.getItemAsync(USERNAME_STORAGE_KEY);
    } catch (error) {
        console.warn('Username fetch failed (normal on simulator):', error);
        return null;
    }
}
