import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Pressable,
    ActionSheetIOS,
    Platform,
    Alert,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { pickImage, takePhoto, requestMediaPermissions, type CompressedImage } from '@/lib/imageUtils';

interface ChatInputProps {
    onSend: (message: string) => void;
    onSendImage: (image: CompressedImage) => void;
    onEmojiPress?: () => void;
    pendingEmoji?: string | null;
    onEmojiInserted?: () => void;
    disabled?: boolean;
}

export function ChatInput({ onSend, onSendImage, onEmojiPress, pendingEmoji, onEmojiInserted, disabled }: ChatInputProps) {
    const [text, setText] = useState('');
    const [selectedImage, setSelectedImage] = useState<CompressedImage | null>(null);
    const inputRef = useRef<TextInput>(null);

    // Handle emoji insertion from picker
    React.useEffect(() => {
        if (pendingEmoji) {
            setText(prev => prev + pendingEmoji);
            onEmojiInserted?.();
        }
    }, [pendingEmoji, onEmojiInserted]);

    const handleSend = () => {
        const trimmedText = text.trim();
        if ((!trimmedText && !selectedImage) || disabled) return;

        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Send text if present
        if (trimmedText) {
            onSend(trimmedText);
        }

        // Send image if present
        if (selectedImage) {
            onSendImage(selectedImage);
        }

        setText('');
        setSelectedImage(null);
    };

    const handleAttachment = async () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        const hasPermission = await requestMediaPermissions();
        if (!hasPermission) {
            Alert.alert(
                'Permission Required',
                'Please grant camera and photo library access to send images.',
                [{ text: 'OK' }]
            );
            return;
        }

        const processImage = (image: CompressedImage | null) => {
            if (image) setSelectedImage(image);
        };

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Take Photo', 'Choose from Library'],
                    cancelButtonIndex: 0,
                },
                async (buttonIndex) => {
                    if (buttonIndex === 1) {
                        const image = await takePhoto();
                        processImage(image);
                    } else if (buttonIndex === 2) {
                        const image = await pickImage();
                        processImage(image);
                    }
                }
            );
        } else {
            // Android and Web - just open gallery
            const image = await pickImage();
            processImage(image);
        }
    };

    const handleRemoveImage = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setSelectedImage(null);
    };

    const handleKeyPress = (e: any) => {
        // On web, send message on Enter (without Shift)
        if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const hasContent = text.trim().length > 0 || selectedImage !== null;

    return (
        <View style={styles.container}>
            {/* Image Preview */}
            {selectedImage && (
                <View style={styles.previewContainer}>
                    <View style={styles.previewWrapper}>
                        <Image
                            source={{ uri: `data:${selectedImage.mimeType};base64,${selectedImage.base64}` }}
                            style={styles.previewImage}
                        />
                        <Pressable
                            style={styles.removeImageButton}
                            onPress={handleRemoveImage}
                        >
                            <Ionicons name="close" size={16} color="white" />
                        </Pressable>
                    </View>
                </View>
            )}

            <View style={styles.innerContainer}>
                {/* Attachment button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.iconButton,
                        pressed && styles.iconButtonPressed,
                    ]}
                    onPress={handleAttachment}
                    disabled={disabled}
                >
                    <Ionicons name="add" size={24} color={Colors.primary} />
                </Pressable>

                {/* Input field */}
                <View style={styles.inputWrapper}>
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        value={text}
                        onChangeText={setText}
                        onKeyPress={handleKeyPress}
                        placeholder="Message"
                        placeholderTextColor={Colors.textMuted}
                        multiline
                        maxLength={1000}
                        editable={!disabled}
                    />

                    {/* Emoji button inside input */}
                    <Pressable
                        style={styles.emojiButton}
                        onPress={() => {
                            if (Platform.OS !== 'web') {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }
                            onEmojiPress?.();
                        }}
                    >
                        <Ionicons name="happy-outline" size={22} color={Colors.textMuted} />
                    </Pressable>
                </View>

                {/* Send button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.sendButton,
                        hasContent ? styles.sendButtonActive : null,
                        pressed && styles.sendButtonPressed,
                    ]}
                    onPress={handleSend}
                    disabled={!hasContent || disabled}
                >
                    <Ionicons
                        name="arrow-up"
                        size={22}
                        color={hasContent ? Colors.background : Colors.textMuted}
                    />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingHorizontal: 8,
        paddingVertical: 8,
        paddingBottom: Platform.OS === 'web' ? 16 : 24,
        alignItems: 'center',
    },
    previewContainer: {
        width: '100%',
        paddingHorizontal: 8,
        paddingBottom: 8,
        alignItems: 'flex-start',
    },
    previewWrapper: {
        position: 'relative',
    },
    previewImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: Colors.surface,
    },
    removeImageButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 6,
        width: '100%',
        maxWidth: Platform.OS === 'web' ? 800 : undefined,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButtonPressed: {
        opacity: 0.7,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: Colors.surface,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 44,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
        maxHeight: 120,
        lineHeight: 22,
        paddingTop: 0,
        paddingBottom: 0,
        // Web-specific: remove focus outline
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as any,
    },
    emojiButton: {
        marginLeft: 8,
        marginBottom: 2,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
        ...(Platform.OS === 'web' && {
            cursor: 'pointer',
        }),
    },
    sendButtonActive: {
        backgroundColor: Colors.primary,
    },
    sendButtonPressed: {
        transform: [{ scale: 0.92 }],
    },
});
