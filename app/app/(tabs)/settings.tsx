import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Alert,
    ScrollView,
    Platform,
    Dimensions,
    Linking,
    Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { getStoredUsername, getStoredKeypair, deleteIdentity } from '@/lib/keychain';
import { clearAllData } from '@/lib/storage';
import { uint8ToBase58 } from '@/lib/crypto';
import { fetchConfig, releaseUsername, uploadAvatar, type AppConfig } from '@/lib/api';
import { pickImage, type CompressedImage } from '@/lib/imageUtils';
import { getUserSettings, saveUserSettings, CHAT_BACKGROUND_PRESETS, type UserSettings } from '@/lib/settingsStorage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SettingsScreen() {
    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);
    const [publicKey, setPublicKey] = useState<string | null>(null);
    const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
    const [userSettings, setUserSettings] = useState<UserSettings>({});
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    useEffect(() => {
        loadIdentity();
        loadConfig();
        loadUserSettings();
    }, []);

    const loadUserSettings = async () => {
        const settings = await getUserSettings();
        setUserSettings(settings);
        if (settings.avatarBase64) {
            setAvatarUri(`data:image/jpeg;base64,${settings.avatarBase64}`);
        }
    };

    const loadConfig = async () => {
        const config = await fetchConfig();
        setAppConfig(config);
    };

    const loadIdentity = async () => {
        const [storedUsername, keypair] = await Promise.all([
            getStoredUsername(),
            getStoredKeypair(),
        ]);
        setUsername(storedUsername);
        if (keypair) {
            setPublicKey(uint8ToBase58(keypair.publicKey));
        }
    };

    const handleAvatarPress = async () => {
        const image = await pickImage();
        if (image) {
            // Optimistic update
            setAvatarUri(`data:${image.mimeType};base64,${image.base64}`);
            await saveUserSettings({ avatarBase64: image.base64 });

            // Sync to API
            if (username) {
                try {
                    await uploadAvatar(username, image.base64);
                    console.log('✅ Avatar synced to cloud');
                } catch (error) {
                    console.error('Failed to sync avatar:', error);
                    // We don't revert local change, as it's still valid locally
                }
            }

            if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        }
    };

    const handleBackgroundSelect = async (color: string) => {
        await saveUserSettings({ chatBackgroundColor: color });
        setUserSettings(prev => ({ ...prev, chatBackgroundColor: color }));
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handleBurnIdentity = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
            'Burn Identity',
            'This will permanently delete your keys and all messages. Your username will be released for others to claim.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Burn',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Release username first (adds .XX suffix like Signal)
                            if (username) {
                                await releaseUsername(username);
                                console.log(`🔄 Username @${username} released`);
                            }
                        } catch (err) {
                            // Continue even if release fails (might be offline)
                            console.warn('Username release failed:', err);
                        }

                        await deleteIdentity();
                        await clearAllData();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        router.replace('/onboarding');
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Subtle Renaissance Background Element */}
            <View style={styles.backgroundArt}>
                <Text style={styles.watermark}>⚿</Text>
            </View>

            {/* Glass Header - Compact */}
            <BlurView intensity={20} tint="dark" style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </BlurView>

            <View style={styles.mainContent}>
                {/* Identity Card - Compacted */}
                <View style={[styles.card, styles.identityCard]}>
                    <View style={styles.cardHeader}>
                        <Pressable onPress={handleAvatarPress}>
                            <View style={styles.avatar}>
                                {avatarUri ? (
                                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                                ) : (
                                    <Text style={styles.avatarText}>
                                        {username?.slice(0, 2).toUpperCase() || '??'}
                                    </Text>
                                )}
                                <View style={styles.avatarEditBadge}>
                                    <Ionicons name="camera" size={10} color={Colors.text} />
                                </View>
                            </View>
                        </Pressable>
                        <View style={styles.identityInfo}>
                            <Text style={styles.username}>@{username || 'unknown'}</Text>
                            <View style={styles.networkBadge}>
                                <View style={[
                                    styles.networkDot,
                                    appConfig?.network === 'mainnet-beta' && { backgroundColor: Colors.primary }
                                ]} />
                                <Text style={styles.networkText}>
                                    {appConfig?.network === 'mainnet-beta' ? 'MAINNET' : 'DEVNET'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {publicKey && (
                        <View style={styles.publicKeyContainer}>
                            <Text style={styles.publicKeyLabel}>PUBLIC IDENTITY KEY</Text>
                            <View style={styles.keyBox}>
                                <Text style={styles.publicKey} numberOfLines={1}>
                                    {publicKey}
                                </Text>
                                <Ionicons name="copy-outline" size={12} color={Colors.primary} />
                            </View>
                        </View>
                    )}
                </View>

                {/* Appearance Section */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Appearance</Text>
                    <Text style={styles.settingLabel}>Chat Background</Text>
                    <View style={styles.colorRow}>
                        {CHAT_BACKGROUND_PRESETS.map((color) => (
                            <Pressable
                                key={color}
                                style={[
                                    styles.colorSwatch,
                                    { backgroundColor: color },
                                    userSettings.chatBackgroundColor === color && styles.colorSwatchSelected,
                                ]}
                                onPress={() => handleBackgroundSelect(color)}
                            />
                        ))}
                    </View>
                </View>

                {/* Combined System Sections for compactness */}
                <View style={styles.compactGrid}>
                    <View style={styles.gridHalf}>
                        <Text style={styles.sectionTitle}>Security</Text>
                        <View style={styles.cardCompact}>
                            <Pressable onPress={() => Alert.alert(
                                '🔐 End-to-End Encryption',
                                'All messages are encrypted using X25519-XSalsa20-Poly1305 (NaCl Box). Only you and your recipient can read messages.'
                            )}>
                                <SettingsRow
                                    icon="shield-checkmark-outline"
                                    title="Encrypted"
                                    showChevron={true}
                                    compact
                                />
                            </Pressable>
                            <View style={styles.divider} />
                            <Pressable onPress={() => Alert.alert(
                                '🔑 Self-Custody Keys',
                                'Your keys are stored only on your device. No one else has access - not even us. You are the sole owner of your identity.'
                            )}>
                                <SettingsRow
                                    icon="key-outline"
                                    title="Sovereign"
                                    showChevron={true}
                                    compact
                                />
                            </Pressable>
                        </View>
                    </View>

                    <View style={styles.gridHalf}>
                        <Text style={styles.sectionTitle}>Protocol</Text>
                        <View style={styles.cardCompact}>
                            <SettingsRow
                                icon="git-branch-outline"
                                title={`v${appConfig?.version || '1.0.0'}`}
                                showChevron={false}
                                compact
                            />
                            <View style={styles.divider} />
                            <Pressable onPress={() => {
                                const url = appConfig?.githubUrl || 'https://github.com/serpepe/KeyApp';
                                Linking.openURL(url);
                            }}>
                                <SettingsRow
                                    icon="logo-github"
                                    title="Source"
                                    showChevron={true}
                                    compact
                                />
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Danger Zone - More compact, higher up */}
                <View style={styles.dangerZone}>
                    <Text style={styles.dangerTitle}>Emergency Protocol</Text>
                    <Pressable
                        style={({ pressed }) => [
                            styles.burnButton,
                            pressed && styles.burnButtonPressed,
                        ]}
                        onPress={handleBurnIdentity}
                    >
                        <Ionicons name="flame" size={16} color={Colors.error} />
                        <Text style={styles.burnButtonText}>BURN IDENTITY</Text>
                    </Pressable>
                </View>
            </View>

            {/* No scroll needed as everything fits */}
        </View>
    );
}

function SettingsRow({
    icon,
    title,
    subtitle,
    showChevron = true,
    compact = false
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    showChevron?: boolean;
    compact?: boolean;
}) {
    return (
        <View style={[styles.settingsRow, compact && { paddingVertical: 2 }]}>
            <Ionicons name={icon} size={compact ? 18 : 20} color={Colors.primary} />
            <View style={styles.settingsRowContent}>
                <Text style={[styles.settingsRowTitle, compact && { fontSize: 13 }]}>{title}</Text>
                {subtitle && !compact && (
                    <Text style={styles.settingsRowSubtitle}>{subtitle}</Text>
                )}
            </View>
            {showChevron && (
                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    backgroundArt: {
        position: 'absolute',
        top: 60,
        right: -10,
        opacity: 0.02,
    },
    watermark: {
        fontSize: 160,
        color: Colors.primary,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 54 : 40,
        paddingBottom: 15,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '300',
        color: Colors.text,
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    identityCard: {
        borderColor: 'rgba(201, 169, 98, 0.15)',
        backgroundColor: 'rgba(201, 169, 98, 0.02)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: Colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(201, 169, 98, 0.3)',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '300',
        color: Colors.primary,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    identityInfo: {
        marginLeft: 14,
    },
    username: {
        fontSize: 18,
        fontWeight: '400',
        color: Colors.text,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    networkBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    networkDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.accent,
        marginRight: 4,
    },
    networkText: {
        fontSize: 9,
        fontWeight: '700',
        color: Colors.accent,
        letterSpacing: 1,
    },
    publicKeyContainer: {
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    publicKeyLabel: {
        fontSize: 9,
        color: Colors.textMuted,
        marginBottom: 6,
        letterSpacing: 1.5,
        fontWeight: '600',
    },
    keyBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 6,
        padding: 8,
        justifyContent: 'space-between',
    },
    publicKey: {
        flex: 1,
        fontSize: 11,
        color: Colors.textSecondary,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginRight: 8,
    },
    compactGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    gridHalf: {
        flex: 1,
    },
    cardCompact: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    sectionTitle: {
        fontSize: 10,
        color: Colors.primary,
        opacity: 0.8,
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 2,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingsRowContent: {
        flex: 1,
        marginLeft: 10,
    },
    settingsRowTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
    },
    settingsRowSubtitle: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 1,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginVertical: 10,
    },
    dangerZone: {
        marginTop: 10,
        padding: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 107, 107, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.1)',
    },
    dangerTitle: {
        fontSize: 10,
        color: Colors.error,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 12,
        textAlign: 'center',
    },
    burnButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 107, 107, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.2)',
        gap: 8,
    },
    burnButtonPressed: {
        backgroundColor: 'rgba(255, 107, 107, 0.15)',
    },
    burnButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.error,
        letterSpacing: 1.5,
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarEditBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.background,
    },
    settingLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 10,
    },
    colorRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    colorSwatch: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorSwatchSelected: {
        borderColor: Colors.primary,
    },
});
