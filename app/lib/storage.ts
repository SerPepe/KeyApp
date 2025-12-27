import AsyncStorage from '@react-native-async-storage/async-storage';

export type MessageType = 'text' | 'image';

export interface Message {
    id: string;
    chatId: string;
    type: MessageType;
    content: string; // Text content or base64 image data
    timestamp: number;
    isMine: boolean;
    txSignature?: string;
    status: 'sending' | 'sent' | 'confirmed' | 'failed';
    // Image-specific fields
    mimeType?: string;
    width?: number;
    height?: number;
}

export interface Chat {
    username: string;
    publicKey: string;
    lastMessage?: string;
    lastMessageTime?: number;
    unreadCount: number;
}

// Keys
const CHATS_KEY = 'key_chats';
const MESSAGES_PREFIX = 'key_messages_';

/**
 * Get all chats
 */
export async function getChats(): Promise<Chat[]> {
    try {
        const data = await AsyncStorage.getItem(CHATS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/**
 * Save a new chat or update existing
 */
export async function saveChat(chat: Chat): Promise<void> {
    const chats = await getChats();
    const existingIndex = chats.findIndex((c) => c.username === chat.username);

    if (existingIndex >= 0) {
        // Merge with existing chat, properly incrementing unread count
        const existing = chats[existingIndex];
        chats[existingIndex] = {
            ...existing,
            ...chat,
            // Increment unread count when receiving new messages (unreadCount > 0)
            unreadCount: chat.unreadCount > 0 ? existing.unreadCount + chat.unreadCount : chat.unreadCount,
        };
    } else {
        chats.unshift(chat);
    }

    await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

/**
 * Get messages for a specific chat
 */
export async function getMessages(chatId: string): Promise<Message[]> {
    try {
        const data = await AsyncStorage.getItem(`${MESSAGES_PREFIX}${chatId}`);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/**
 * Save a message
 */
export async function saveMessage(message: Message): Promise<void> {
    const messages = await getMessages(message.chatId);
    messages.push(message);
    await AsyncStorage.setItem(
        `${MESSAGES_PREFIX}${message.chatId}`,
        JSON.stringify(messages)
    );

    // Update chat's last message
    const chats = await getChats();
    const chatIndex = chats.findIndex((c) => c.username === message.chatId);
    if (chatIndex >= 0) {
        // For images, show a placeholder in last message preview
        chats[chatIndex].lastMessage = message.type === 'image' ? '📷 Photo' : message.content;
        chats[chatIndex].lastMessageTime = message.timestamp;
        await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(chats));
    }
}

/**
 * Update a message's status
 */
export async function updateMessageStatus(
    chatId: string,
    messageId: string,
    status: Message['status'],
    txSignature?: string
): Promise<void> {
    const messages = await getMessages(chatId);
    const msgIndex = messages.findIndex((m) => m.id === messageId);

    if (msgIndex >= 0) {
        messages[msgIndex].status = status;
        if (txSignature) {
            messages[msgIndex].txSignature = txSignature;
        }
        await AsyncStorage.setItem(
            `${MESSAGES_PREFIX}${chatId}`,
            JSON.stringify(messages)
        );
    }
}

/**
 * Delete a message
 */
export async function deleteMessage(chatId: string, messageId: string): Promise<void> {
    const messages = await getMessages(chatId);
    const filtered = messages.filter((m) => m.id !== messageId);
    await AsyncStorage.setItem(`${MESSAGES_PREFIX}${chatId}`, JSON.stringify(filtered));

    // Update chat's last message if the deleted message was the latest
    if (messages.length > 0 && filtered.length > 0) {
        const lastMsg = filtered[filtered.length - 1];
        const chats = await getChats();
        const chatIndex = chats.findIndex((c) => c.username === chatId);
        if (chatIndex >= 0) {
            chats[chatIndex].lastMessage = lastMsg.type === 'image' ? '📷 Photo' : lastMsg.content;
            chats[chatIndex].lastMessageTime = lastMsg.timestamp;
            await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(chats));
        }
    }
}

/**
 * Clear all data (for "burn" functionality)
 */
export async function clearAllData(): Promise<void> {
    await AsyncStorage.clear();
}

/**
 * Delete an entire chat and its messages
 */
export async function deleteChat(username: string): Promise<void> {
    const chats = await getChats();
    const updatedChats = chats.filter((c) => c.username !== username);
    await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(updatedChats));
    await AsyncStorage.removeItem(`${MESSAGES_PREFIX}${username}`);
}

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Key for processed message signatures
const PROCESSED_SIGS_KEY = 'key_processed_signatures';

/**
 * Get all processed message signatures
 */
export async function getProcessedSignatures(): Promise<Set<string>> {
    try {
        const data = await AsyncStorage.getItem(PROCESSED_SIGS_KEY);
        return data ? new Set(JSON.parse(data)) : new Set();
    } catch {
        return new Set();
    }
}

/**
 * Add a signature to processed list
 */
export async function addProcessedSignature(signature: string): Promise<void> {
    const sigs = await getProcessedSignatures();
    sigs.add(signature);
    // Keep only last 1000 signatures to prevent memory issues
    const sigArray = Array.from(sigs).slice(-1000);
    await AsyncStorage.setItem(PROCESSED_SIGS_KEY, JSON.stringify(sigArray));
}

/**
 * Check if signature was already processed
 */
export async function isSignatureProcessed(signature: string): Promise<boolean> {
    const sigs = await getProcessedSignatures();
    return sigs.has(signature);
}
