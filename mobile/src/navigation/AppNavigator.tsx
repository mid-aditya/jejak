import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAppSelector, useAppDispatch } from '../shared/store';
import { selectIsAuthenticated } from '../shared/store/slices/authSlice';
import { startNetworkMonitoring } from '../shared/store/slices/offlineSlice';
import { Colors, Typography, Spacing, Shadows } from '../config/theme';
import { featureFlags } from '../config/env';
import OfflineIndicator from '../shared/components/OfflineIndicator';

// Auth
import LoginScreen from '../features/auth/LoginScreen';
import RegisterScreen from '../features/auth/RegisterScreen';
import VerifyEmailScreen from '../features/auth/VerifyEmailScreen';
import ForgotPasswordScreen from '../features/auth/ForgotPasswordScreen';
import SettingsScreen from '../features/auth/SettingsScreen';
import VerifyIdentityScreen from '../features/auth/VerifyIdentityScreen';
import ProfileScreen from '../features/auth/ProfileScreen';

// Dashboard
import DashboardScreen from '../features/dashboard/DashboardScreen';

// Maps
import MapsScreen from '../features/maps/MapsScreen';
import MountainDetailScreen from '../features/maps/MountainDetailScreen';
import OfflineMapManagerScreen from '../features/maps/OfflineMapManager';
import GPSTrackerScreen from '../features/maps/GPSTrackerScreen';
import TripDetailScreen from '../features/maps/TripDetailScreen';

// Community
import ForumScreen from '../features/community/ForumScreen';
import ThreadDetailScreen from '../features/community/ThreadDetailScreen';
import FindTeamScreen from '../features/community/FindTeamScreen';
import ChatScreen from '../features/community/ChatScreen';
import CreateThreadScreen from '../features/community/CreateThreadScreen';

// Marketplace
import MarketplaceScreen from '../features/marketplace/MarketplaceScreen';
import GearDetailScreen from '../features/marketplace/GearDetailScreen';
import CreateListingScreen from '../features/marketplace/CreateListingScreen';

// Emergency
import EmergencyScreen from '../features/emergency/EmergencyScreen';
import CheckInOutScreen from '../features/emergency/CheckInOutScreen';

// Types
import type { AuthStackParamList, MainTabParamList, RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const CommunityStack = createStackNavigator();
const MarketplaceStack = createStackNavigator();

// ── Tab Icons ─────────────────────────────────────────────────────────────────
const getTabIcon = (routeName: string, focused: boolean): string => {
  const icons: Record<string, [string, string]> = {
    Home: ['home', 'home-outline'],
    Maps: ['map', 'map-outline'],
    Community: ['people', 'people-outline'],
    Marketplace: ['cart', 'cart-outline'],
    Profile: ['person', 'person-outline'],
  };
  return icons[routeName]?.[focused ? 0 : 1] ?? 'help-circle';
};

// ── Auth Stack ────────────────────────────────────────────────────────────────
const AuthNavigator: React.FC = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: Colors.background },
      animationEnabled: true,
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} options={{ title: 'Verifikasi Email' }} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Lupa Password' }} />
  </AuthStack.Navigator>
);

// ── Community Stack ───────────────────────────────────────────────────────────
const CommunityNavigator: React.FC = () => (
  <CommunityStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.surface, elevation: 0, shadowOpacity: 0 },
      headerTitleStyle: { color: Colors.text, fontWeight: '700' },
      cardStyle: { backgroundColor: Colors.background },
    }}
  >
    <CommunityStack.Screen name="Forum" component={ForumScreen} options={{ title: 'Forum' }} />
    <CommunityStack.Screen name="CreateThread" component={CreateThreadScreen} options={{ title: 'Buat Thread' }} />
    <CommunityStack.Screen name="ThreadDetail" component={ThreadDetailScreen} options={{ title: 'Thread' }} />
    <CommunityStack.Screen name="FindTeam" component={FindTeamScreen} options={{ title: 'Cari Tim' }} />
  </CommunityStack.Navigator>
);

// ── Marketplace Stack ─────────────────────────────────────────────────────────
const MarketplaceNavigator: React.FC = () => (
  <MarketplaceStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.surface, elevation: 0, shadowOpacity: 0 },
      headerTitleStyle: { color: Colors.text, fontWeight: '700' },
      cardStyle: { backgroundColor: Colors.background },
    }}
  >
    <MarketplaceStack.Screen name="MarketplaceMain" component={MarketplaceScreen} options={{ title: 'Jual Beli' }} />
    <MarketplaceStack.Screen name="GearDetail" component={GearDetailScreen} options={{ title: 'Detail Gear' }} />
    <MarketplaceStack.Screen name="CreateListing" component={CreateListingScreen} options={{ title: 'Jual Gear' }} />
  </MarketplaceStack.Navigator>
);

// ── Main Tab Navigator ────────────────────────────────────────────────────────
const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => (
        <Icon name={getTabIcon(route.name, focused)} size={size} color={color} />
      ),
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textTertiary,
      tabBarStyle: {
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        height: Spacing.tabBarHeight,
        ...Shadows.sm,
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      headerShown: true,
      headerStyle: {
        backgroundColor: Colors.surface,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      },
      headerTitleStyle: { ...Typography.subtitle1, color: Colors.text, fontWeight: '700' },
    })}
  >
    <Tab.Screen name="Home" component={DashboardScreen} options={{ title: 'Beranda' }} />
    <Tab.Screen name="Maps" component={MapsScreen} options={{ title: 'Peta' }} />
    {featureFlags.enableForum && (
      <Tab.Screen name="Community" component={CommunityNavigator} options={{ title: 'Komunitas', headerShown: false }} />
    )}
    {featureFlags.enableMarketplace && (
      <Tab.Screen name="Marketplace" component={MarketplaceNavigator} options={{ title: 'Jual Beli', headerShown: false }} />
    )}
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
  </Tab.Navigator>
);

// ── Root Navigator ────────────────────────────────────────────────────────────
const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isRehydrating = useAppSelector((s) => s.auth.isRehydrating);

  useEffect(() => {
    dispatch(startNetworkMonitoring());
  }, [dispatch]);

  if (isRehydrating) return null;

  return (
    <>
      <OfflineIndicator />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: Colors.background },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="SOS" component={EmergencyScreen} options={{ presentation: 'modal', cardStyle: { backgroundColor: Colors.dangerFaded } }} />
            <Stack.Screen name="Emergency" component={EmergencyScreen} options={{ title: 'Darurat' }} />
            <Stack.Screen name="MountainDetail" component={MountainDetailScreen} options={{ title: 'Detail Gunung' }} />
            <Stack.Screen name="OfflineMapManager" component={OfflineMapManagerScreen} options={{ title: 'Peta Offline' }} />
            <Stack.Screen name="GPSTracker" component={GPSTrackerScreen} options={{ title: 'GPS Tracker' }} />
            <Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: 'Detail Trip' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Pengaturan' }} />
            <Stack.Screen name="CheckInOut" component={CheckInOutScreen} options={{ title: 'Check-in/Out' }} />
            <Stack.Screen name="VerifyIdentity" component={VerifyIdentityScreen} options={{ title: 'Verifikasi Identitas' }} />
          </>
        )}
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
