import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store, persistor } from './src/shared/store';
import AppNavigator from './src/navigation/AppNavigator';
import { encryptionService } from './src/shared/services/encryption.service';

LogBox.ignoreLogs(['Reanimated', 'ViewPropTypes']);

const AppContent: React.FC = () => {
  useEffect(() => {
    const init = async () => {
      try {
        // NOTE: notificationService.initialize() is intentionally NOT called here —
        // react-native-push-notification requires Firebase (google-services.json +
        // FirebaseApp.initializeApp), and without it the native side crashes at
        // FirebaseMessaging.getInstance(). Wire it up once Firebase is configured.
        await encryptionService.getOrCreateKey();
      } catch (err) {
        console.warn('Init warning:', err);
      }
    };
    init();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FAFAFA"
          translucent={false}
        />
        {/* SOSButton & OfflineIndicator are rendered by AppNavigator (they are
            auth-aware and must live inside the navigation tree) */}
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
