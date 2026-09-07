import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// ── Auth Stack ────────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
  ForgotPassword: { email?: string };
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = StackScreenProps<
  AuthStackParamList,
  T
>;

// ── Main Tabs ─────────────────────────────────────────────────────────────────
export type MainTabParamList = {
  Home: undefined;
  Maps: undefined;
  Community: undefined;
  Marketplace: undefined;
  Profile: undefined;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

// ── Root Stack ────────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  SOS: undefined;
  TripDetail: { trip?: Record<string, any> };
  Chat: { team?: { title?: string; host?: string }; threadId?: string };
  FindTeam: { teamId?: string };
  Settings: undefined;
  MountainDetail: { mountain: Record<string, any> };
  ThreadDetail: { thread: Record<string, any> };
  GearDetail: { item: Record<string, any> };
  CreateListing: undefined;
  CreateThread: undefined;
  OfflineMapManager: undefined;
  GPSTracker: undefined;
  Emergency: undefined;
  CheckInOut: { mode?: 'checkin' | 'checkout' };
  VerifyIdentity: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<
  RootStackParamList,
  T
>;

// ── Common Navigation Types ───────────────────────────────────────────────────
export type ScreenNavigationProp<T extends keyof RootStackParamList> =
  RootStackScreenProps<T>['navigation'];

export type ScreenRouteProp<T extends keyof RootStackParamList> =
  RootStackScreenProps<T>['route'];
