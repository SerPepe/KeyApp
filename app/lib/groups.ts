import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredKeypair } from './keychain';
import { signMessage, uint8ToBase58, uint8ToBase64 } from './crypto';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
const GROUPS_STORAGE_KEY = 'key_groups';

export interface Group {
    groupId: string;
    name: string;
    owner: string;
    members?: string[];
    createdAt?: number;
}

/**
 * Get locally cached groups
 */
export async function getLocalGroups(): Promise<Group[]> {
    try {
        const data = await AsyncStorage.getItem(GROUPS_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/**
 * Save groups locally
 */
async function saveLocalGroups(groups: Group[]): Promise<void> {
    await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
}

/**
 * Create a new group
 */
export async function createGroup(name: string): Promise<Group | null> {
    try {
        const keypair = await getStoredKeypair();
        if (!keypair) return null;

        const timestamp = Date.now();
        const ownerPubkey = uint8ToBase58(keypair.publicKey);
        const messageToSign = `group:create:${name}:${timestamp}`;
        const signatureBytes = signMessage(new TextEncoder().encode(messageToSign), keypair.secretKey);
        const signature = uint8ToBase64(signatureBytes);

        const response = await fetch(`${API_URL}/groups/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, ownerPubkey, signature, timestamp })
        });

        if (!response.ok) {
            throw new Error('Failed to create group');
        }

        const { groupId } = await response.json();
        const newGroup: Group = { groupId, name, owner: ownerPubkey };

        // Cache locally
        const groups = await getLocalGroups();
        groups.push(newGroup);
        await saveLocalGroups(groups);

        return newGroup;
    } catch (error) {
        console.error('Failed to create group:', error);
        return null;
    }
}

/**
 * Invite a member to a group
 */
export async function inviteMember(groupId: string, memberPubkey: string): Promise<boolean> {
    try {
        const keypair = await getStoredKeypair();
        if (!keypair) return false;

        const timestamp = Date.now();
        const ownerPubkey = uint8ToBase58(keypair.publicKey);
        const messageToSign = `group:invite:${groupId}:${memberPubkey}:${timestamp}`;
        const signatureBytes = signMessage(new TextEncoder().encode(messageToSign), keypair.secretKey);
        const signature = uint8ToBase64(signatureBytes);

        const response = await fetch(`${API_URL}/groups/invite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId, memberPubkey, ownerPubkey, signature, timestamp })
        });

        return response.ok;
    } catch (error) {
        console.error('Failed to invite member:', error);
        return false;
    }
}

/**
 * Leave a group
 */
export async function leaveGroup(groupId: string): Promise<boolean> {
    try {
        const keypair = await getStoredKeypair();
        if (!keypair) return false;

        const timestamp = Date.now();
        const ownerPubkey = uint8ToBase58(keypair.publicKey);
        const messageToSign = `group:leave:${groupId}:${timestamp}`;
        const signatureBytes = signMessage(new TextEncoder().encode(messageToSign), keypair.secretKey);
        const signature = uint8ToBase64(signatureBytes);

        const response = await fetch(`${API_URL}/groups/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId, ownerPubkey, signature, timestamp })
        });

        if (response.ok) {
            // Remove from local cache
            const groups = await getLocalGroups();
            const filtered = groups.filter(g => g.groupId !== groupId);
            await saveLocalGroups(filtered);
        }

        return response.ok;
    } catch (error) {
        console.error('Failed to leave group:', error);
        return false;
    }
}

/**
 * Get group details
 */
export async function getGroup(groupId: string): Promise<Group | null> {
    try {
        const response = await fetch(`${API_URL}/groups/${groupId}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Failed to get group:', error);
        return null;
    }
}

/**
 * Sync groups from server
 */
export async function syncGroups(): Promise<void> {
    try {
        const keypair = await getStoredKeypair();
        if (!keypair) return;

        const pubkey = uint8ToBase58(keypair.publicKey);
        const response = await fetch(`${API_URL}/groups/user/${pubkey}`);

        if (response.ok) {
            const { groups } = await response.json();
            await saveLocalGroups(groups);
        }
    } catch (error) {
        console.error('Failed to sync groups:', error);
    }
}
