// Environment configuration for Jejak mobile app
// Switch values based on __DEV__ (React Native's built-in dev flag)

// Dev API points at the local backend (port 4000). On emulator/physical device
// run `adb reverse tcp:4000 tcp:4000` so `localhost` reaches this machine.
// MAPBOX_STYLE_URL uses Carto's tokenless GL basemap (OSM-based, covers Indonesia)
// because the project has no real Mapbox token: `mapbox://styles/...` URLs return
// 403 with a placeholder token. Swap back to mapbox://styles/... once a valid
// MAPBOX_TOKEN is configured.
const DevConfig = {
  API_BASE_URL: 'http://localhost:4000/api/v1',
  MAPBOX_TOKEN: 'pk.mapbox-dev-token-placeholder',
  SOCKET_URL: 'https://dev-socket.jejak.id',
  MAPBOX_STYLE_URL: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  featureFlags: {
    enableMarketplace: true,
    enableForum: true,
    enableFindTeam: true,
    enableSOS: true,
    enableOfflineMaps: true,
    enableWeatherOverlay: true,
    enableBiometricAuth: true,
    enableLivenessDetection: true,
  },
};

const ProdConfig = {
  API_BASE_URL: 'https://api.jejak.id/v1',
  MAPBOX_TOKEN: 'pk.mapbox-prod-token-placeholder',
  SOCKET_URL: 'https://socket.jejak.id',
  MAPBOX_STYLE_URL: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  featureFlags: {
    enableMarketplace: true,
    enableForum: true,
    enableFindTeam: true,
    enableSOS: true,
    enableOfflineMaps: true,
    enableWeatherOverlay: true,
    enableBiometricAuth: true,
    enableLivenessDetection: false,
  },
};

export interface FeatureFlags {
  enableMarketplace: boolean;
  enableForum: boolean;
  enableFindTeam: boolean;
  enableSOS: boolean;
  enableOfflineMaps: boolean;
  enableWeatherOverlay: boolean;
  enableBiometricAuth: boolean;
  enableLivenessDetection: boolean;
}

export interface Environment {
  API_BASE_URL: string;
  MAPBOX_TOKEN: string;
  SOCKET_URL: string;
  MAPBOX_STYLE_URL: string;
  featureFlags: FeatureFlags;
}

const env: Environment = __DEV__ ? DevConfig : ProdConfig;

export const {
  API_BASE_URL,
  MAPBOX_TOKEN,
  SOCKET_URL,
  MAPBOX_STYLE_URL,
  featureFlags,
} = env;

export default env;
