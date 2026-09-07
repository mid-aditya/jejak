import React, { useMemo, useCallback, useState } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import MapboxGL, {
  LineLayerStyle,
} from "@react-native-mapbox-gl/maps";
import { MAPBOX_STYLE_URL } from "../../config/env";
import { Colors, Typography, Spacing } from "../../config/theme";
import type { Location } from "../store/slices/emergencySlice";

// CartoDB free tiles don't need a Mapbox token. If token is needed later,
// set MAPBOX_TOKEN in env.ts. Empty token works with CartoDB.
MapboxGL.setAccessToken('');

// ── Types ─────────────────────────────────────────────────────────────────────
// Accept either a GeoJSON position tuple [lng, lat] or a {latitude, longitude}
// object so callers don't need to remember the lng/lat ordering.
export type Coordinate = [number, number] | { latitude: number; longitude: number };

const toGeoPosition = (coord: Coordinate): [number, number] =>
  Array.isArray(coord) ? coord : [coord.longitude, coord.latitude];

export interface MapMarker {
  id: string;
  coordinate: Coordinate; // [longitude, latitude] tuple or { latitude, longitude }
  title?: string;
  description?: string;
  type?: "mountain" | "danger" | "water" | "restpost" | "user" | "custom";
  icon?: string;
  color?: string;
  isSOS?: boolean;
  onPress?: () => void;
}

export interface DangerZone {
  id: string;
  coordinates: [number, number][];
  name: string;
  severity: "high" | "medium" | "low";
}

export interface OfflineRegion {
  bounds: [[number, number], [number, number]]; // [sw, ne]
  metadata: Record<string, any>;
}

export interface MapViewProps {
  style?: ViewStyle;
  centerCoordinate?: Coordinate; // [longitude, latitude] tuple or { latitude, longitude }
  zoomLevel?: number;
  showUserLocation?: boolean;
  showBreadcrumb?: boolean;
  breadcrumbTrail?: Location[];
  offlineRegion?: OfflineRegion | null;
  markers?: MapMarker[];
  dangerZones?: DangerZone[];
  onLongPress?: (coordinate: [number, number]) => void;
  onMarkerPress?: (markerId: string) => void;
  onUserLocationUpdate?: (location: Location) => void;
  children?: React.ReactNode;
}

const MapView: React.FC<MapViewProps> = ({
  style,
  centerCoordinate = [106.8275, -6.1754], // Default: Indonesia center
  zoomLevel = 5,
  showUserLocation = false,
  showBreadcrumb = false,
  breadcrumbTrail = [],
  offlineRegion = null,
  markers = [],
  dangerZones = [],
  onLongPress,
  onMarkerPress,
  onUserLocationUpdate,
  children,
}) => {
  const cameraRef = React.useRef<MapboxGL.Camera>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const defaultStyleURL = MAPBOX_STYLE_URL;

  // Layer styles
  const breadcrumbLayerStyle: LineLayerStyle = useMemo(
    () => ({
      lineColor: Colors.breadcrumb,
      lineWidth: 3,
      lineOpacity: 0.8,
      lineCap: "round",
      lineJoin: "round",
    }),
    [],
  );

  const dangerZoneLayerStyle: LineLayerStyle = useMemo(
    () => ({
      lineColor: Colors.danger,
      lineWidth: 2,
      lineOpacity: 0.6,
      lineDashPattern: [2, 2],
    }),
    [],
  );

  const handleLongPress = useCallback(
    (event: any) => {
      const { geometry } = event;
      if (geometry?.coordinates && onLongPress) {
        onLongPress(geometry.coordinates as [number, number]);
      }
    },
    [onLongPress],
  );

  const handleUserLocationUpdate = useCallback(
    (location: any) => {
      if (onUserLocationUpdate && location.coords) {
        onUserLocationUpdate({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp,
          speed: location.coords.speed,
          heading: location.coords.heading,
        });
      }
    },
    [onUserLocationUpdate],
  );

  // Convert breadcrumb trail to GeoJSON feature collection
  const breadcrumbGeoJSON = useMemo(() => {
    if (!showBreadcrumb || breadcrumbTrail.length < 2) return null;

    return {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "LineString" as const,
            coordinates: breadcrumbTrail.map((p) => [p.longitude, p.latitude]),
          },
        },
      ],
    };
  }, [showBreadcrumb, breadcrumbTrail]);

  // Convert danger zones to GeoJSON
  const dangerGeoJSON = useMemo(() => {
    if (dangerZones.length === 0) return null;

    return {
      type: "FeatureCollection" as const,
      features: dangerZones.map((zone) => ({
        type: "Feature" as const,
        properties: { id: zone.id, name: zone.name, severity: zone.severity },
        geometry: {
          type: "Polygon" as const,
          coordinates: [zone.coordinates],
        },
      })),
    };
  }, [dangerZones]);

  return (
    <View style={[styles.container, style]}>
      {mapError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🗺️</Text>
          <Text style={styles.errorText}>Peta tidak tersedia</Text>
          <Text style={styles.errorSub}>{mapError}</Text>
        </View>
      ) : (
      <MapboxGL.MapView
        style={styles.map}
        styleURL={defaultStyleURL}
        logoEnabled={false}
        compassEnabled={true}
        attributionEnabled={false}
        onLongPress={handleLongPress}
      >
        {/* Camera */}
        <MapboxGL.Camera
          ref={cameraRef}
          centerCoordinate={toGeoPosition(centerCoordinate)}
          zoomLevel={zoomLevel}
          animationMode="flyTo"
          animationDuration={300}
        />

        {/* User Location */}
        {showUserLocation && (
          <MapboxGL.UserLocation
            onUpdate={handleUserLocationUpdate}
            renderMode="native"
            visible={true}
            showsUserHeadingIndicator={true}
          />
        )}

        {/* Markers */}
        {markers.map((marker) => {
          const markerBg =
            marker.color ||
            (marker.type === "mountain"
              ? Colors.primary
              : marker.type === "danger"
                ? Colors.danger
                : marker.type === "water"
                  ? Colors.waterSource
                  : Colors.accent);
          const emoji = marker.icon || (marker.type === "mountain" ? "🏔️" : "📍");
          return (
            // @ts-ignore - PointAnnotation children work at runtime for custom icons
            <MapboxGL.PointAnnotation
              key={marker.id}
              id={marker.id}
              coordinate={toGeoPosition(marker.coordinate)}
              title={marker.title}
              onSelected={() => onMarkerPress?.(marker.id)}
            >
              <View style={[styles.marker, { backgroundColor: markerBg }]}>
                <Text style={styles.markerIcon}>{emoji}</Text>
              </View>
            </MapboxGL.PointAnnotation>
          );
        })}

        {/* Breadcrumb Trail */}
        {breadcrumbGeoJSON && (
          <MapboxGL.ShapeSource
            id="breadcrumb-source"
            shape={breadcrumbGeoJSON}
          >
            <MapboxGL.LineLayer
              id="breadcrumb-layer"
              style={breadcrumbLayerStyle}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Danger Zones */}
        {dangerGeoJSON && (
          <MapboxGL.ShapeSource id="danger-source" shape={dangerGeoJSON}>
            <MapboxGL.LineLayer
              id="danger-layer"
              style={dangerZoneLayerStyle}
            />
            <MapboxGL.FillLayer
              id="danger-fill"
              style={{ fillColor: Colors.danger, fillOpacity: 0.1 }}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Offline Region */}
        {offlineRegion && (
          <MapboxGL.Images
            images={{
              "offline-bounds": { uri: "" },
            }}
          />
        )}

        {/* Children (Weather overlay, etc.) */}
        {children}
      </MapboxGL.MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  markerIcon: {
    fontSize: 14,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  errorText: {
    ...Typography.subtitle1,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default MapView;
