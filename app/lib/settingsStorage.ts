import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_SETTINGS_KEY = 'key_user_settings';

export interface UserSettings {
    // Chat appearance
    chatBackgroundColor?: string;
    chatBackgroundImage?: string; // base64 encoded

    // Profile
    avatarBase64?: string;

    // Theme accent color
    accentColor?: string;
}

/**
 * Get current user settings
 */
export async function getUserSettings(): Promise<UserSettings> {
    try {
        const data = await AsyncStorage.getItem(USER_SETTINGS_KEY);
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
}

/**
 * Save user settings
 */
export async function saveUserSettings(settings: UserSettings): Promise<void> {
    const current = await getUserSettings();
    const merged = { ...current, ...settings };
    await AsyncStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(merged));
}

/**
 * Update a single setting
 */
export async function updateSetting<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
): Promise<void> {
    const settings = await getUserSettings();
    settings[key] = value;
    await AsyncStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * Clear all user settings
 */
export async function clearUserSettings(): Promise<void> {
    await AsyncStorage.removeItem(USER_SETTINGS_KEY);
}

// Preset background colors (matching the dark theme)
export const CHAT_BACKGROUND_PRESETS = [
    '#050505', // Default dark
    '#0A0F1A', // Deep navy
    '#121212', // Material dark
    '#1A1A2E', // Purple tint
    '#0D1117', // GitHub dark
    '#1E1E2E', // Catppuccin dark
];

// Accent color presets
export const ACCENT_COLOR_PRESETS = [
    '#C9A962', // Gold (default)
    '#4FC3F7', // Ice blue
    '#34D399', // Mint
    '#F472B6', // Pink
    '#A78BFA', // Purple
    '#FB923C', // Orange
];
