import '@/lib/nativeShims';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, Platform, Text, StyleSheet } from 'react-native';

import { Colors } from '@/constants/Colors';
import { getStoredKeypair, getStoredUsername, storeUsername } from '@/lib/keychain';
import { uint8ToBase58, getEncryptionKeypair, uint8ToBase64 } from '@/lib/crypto';
import { getUsernameByOwner } from '@/lib/api';
import { startMessageListener } from '@/lib/websocket';
import { registerForPushNotifications, setupNotificationChannel, configureNotifications } from '@/lib/notifications';

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Text style={{ color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Something went wrong</Text>
      <Text style={{ color: Colors.text, marginBottom: 20, textAlign: 'center' }}>{error.message}</Text>
      <TouchableOpacity onPress={retry} style={{ backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}>
        <Text style={{ color: '#000', fontWeight: 'bold' }}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

export const unstable_settings = {
  initialRouteName: 'onboarding',
};

SplashScreen.preventAutoHideAsync();

const KeyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.primary,
  },
};

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TouchableOpacity } from 'react-native';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error('Failed to load fonts:', error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootLayoutNav />
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasIdentity, setHasIdentity] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isCheckingAuth) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!hasIdentity && !inOnboarding) {
      // User has no identity and is not on onboarding - redirect
      router.replace('/onboarding');
    } else if (hasIdentity && inOnboarding) {
      // User has identity but is on onboarding - redirect to main app
      router.replace('/(tabs)');
    }
  }, [isCheckingAuth, hasIdentity, segments]);

  // Push notification setup
  useEffect(() => {
    if (hasIdentity) {
      configureNotifications();
      setupNotificationChannel();
      registerForPushNotifications().then(token => {
        if (token) console.log('🔔 Push notifications registered:', token);
      }).catch(err => console.warn('Push setup failed:', err));
    }
  }, [hasIdentity]);

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking auth...');
      const [keypair, cachedUsername] = await Promise.all([
        getStoredKeypair(),
        getStoredUsername(),
      ]);
      console.log('🔑 Keypair found:', !!keypair);
      console.log('👤 Username found:', cachedUsername);
      let resolvedUsername = cachedUsername;

      // If keys exist but username missing, attempt recovery from API
      if (keypair && !resolvedUsername) {
        try {
          const ownerPubkey = uint8ToBase58(keypair.publicKey);
          const user = await getUsernameByOwner(ownerPubkey);
          if (user?.username) {
            resolvedUsername = user.username;
            await storeUsername(user.username);
          }
        } catch (err) {
          console.warn('Username recovery failed:', err);
        }
      }

      // Sync encryption key to API (in case server restarted and lost in-memory store)
      if (keypair && resolvedUsername) {
        // Initialize storage encryption with the user's keypair
        const { initStorageEncryption } = await import('@/lib/storage');
        initStorageEncryption(keypair.secretKey);

        try {
          // Encryption key sync removed (now stored on-chain)


          // Start WebSocket listener for incoming messages
          try {
            await startMessageListener();
          } catch (err) {
            console.warn('Failed to start message listener:', err);
          }
        }

      // Consider the user onboarded only if both key and username exist
      setHasIdentity(!!keypair && !!resolvedUsername);
      } catch (error) {
        console.error('Auth check failed:', error);
        setHasIdentity(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    // Show loading state while checking auth
    if (isCheckingAuth) {
      return (
        <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: Colors.primary, fontSize: 24 }}>⚿</Text>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        {/* Web Security Warning */}
        {Platform.OS === 'web' && (
          <View style={styles.webWarning}>
            <Text style={styles.webWarningText}>
              ⚠️ Web version stores keys in localStorage (less secure). Use the mobile app for best security.
            </Text>
          </View>
        )}

        <ThemeProvider value={KeyDarkTheme}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: Colors.background },
              headerTintColor: Colors.text,
              contentStyle: { backgroundColor: Colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen
              name="onboarding"
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="new-chat"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'New Chat',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="chat/[username]"
              options={{
                headerShown: true,
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="modal"
              options={{ presentation: 'modal' }}
            />
          </Stack>
        </ThemeProvider>
      </View>
    );
  }

  const styles = StyleSheet.create({
    webWarning: {
      backgroundColor: '#FFA726',
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    webWarningText: {
      color: '#000',
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
