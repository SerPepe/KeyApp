import { Platform } from 'react-native';

// Some dependencies still reach for deprecated React Native exports like
// Clipboard and PushNotificationIOS. When those getters run in Expo, they
// throw because the underlying native modules are missing. This shim swaps
// the getters to safe implementations before anything accesses them.
(() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ReactNative = require('react-native');

    // Map deprecated Clipboard getter to a noop implementation so it doesn't
    // try to load the removed core module.
    const clipboardDescriptor = Object.getOwnPropertyDescriptor(
      ReactNative,
      'Clipboard'
    );
    if (clipboardDescriptor?.get) {
      const clipboardStub = {
        getString: async () => '',
        setString: () => {},
        hasString: async () => false,
      };

      Object.defineProperty(ReactNative, 'Clipboard', {
        configurable: true,
        enumerable: clipboardDescriptor.enumerable,
        get: () => clipboardStub,
      });
    }

    // On iOS the legacy PushNotificationIOS getter will crash without the
    // native module. Redirect it to the community module when available, and
    // otherwise provide a harmless stub.
    const pushDescriptor = Object.getOwnPropertyDescriptor(
      ReactNative,
      'PushNotificationIOS'
    );
    if (Platform.OS === 'ios' && pushDescriptor?.get) {
      let pushModule: any;
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        pushModule = require('@react-native-community/push-notification-ios')
          .default;
      } catch {
        pushModule = {
          requestPermissions: async () => ({
            alert: false,
            badge: false,
            sound: false,
          }),
          abandonPermissions: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          removeAllDeliveredNotifications: () => {},
          setApplicationIconBadgeNumber: () => {},
          getApplicationIconBadgeNumber: async () => 0,
          getInitialNotification: async () => null,
          presentLocalNotification: () => {},
          scheduleLocalNotification: () => {},
          cancelAllLocalNotifications: () => {},
          cancelLocalNotifications: () => {},
        };
      }

      Object.defineProperty(ReactNative, 'PushNotificationIOS', {
        configurable: true,
        enumerable: pushDescriptor.enumerable,
        get: () => pushModule,
      });
    }
  } catch (error) {
    console.warn('Failed to install native shims', error);
  }
})();
