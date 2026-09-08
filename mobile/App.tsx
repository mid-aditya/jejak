import React, { useEffect } from 'react';
import { StatusBar, LogBox, Linking, Alert } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store, persistor } from './src/shared/store';
import AppNavigator from './src/navigation/AppNavigator';
import { encryptionService } from './src/shared/services/encryption.service';
import { apiClient } from './src/shared/services/api-client';

LogBox.ignoreLogs(['Reanimated', 'ViewPropTypes']);

// ── Deep Link Handler ───────────────────────────────────────────────────────────
/**
 * Handles jejak://confirm-email?token=xxx deep links.
 * Called when the app is opened via a confirmation email link.
 */
const handleDeepLink = async (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'jejak:') return;

    const path = parsed.pathname.replace(/^\/+/, ''); // remove leading slashes
    if (path === 'confirm-email') {
      const token = parsed.searchParams.get('token');
      if (!token) return;

      // Call backend to confirm email
      const response = await apiClient.post<{ message: string }>('/auth/confirm-email', { token });
      Alert.alert(
        'Email Diverifikasi! 🎉',
        response.data.message + '\n\nSilakan masuk dengan akun Anda.',
        [{ text: 'OK' }],
      );
    }
  } catch (err) {
    // Silently ignore URL parse errors
  }
};

const AppContent: React.FC = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const init = async () => {
      try {
        await encryptionService.getOrCreateKey();
      } catch (err) {
        console.warn('Init warning:', err);
      }
    };
    init();
  }, []);

  // Handle deep links when app is already open
  useEffect(() => {
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Check if app was opened via deep link (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, [navigation]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FAFAFA"
          translucent={false}
        />
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <AppContent />
    </PersistGate>
  </Provider>
);

export default App;
