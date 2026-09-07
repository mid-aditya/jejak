import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapViewComponent from '../../shared/components/MapView';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import { Card, Button, SectionHeader } from '../../shared/components/ui';

const { width } = Dimensions.get('window');

const TRIP_DETAIL = {
  mountain: 'Gunung Gede',
  route: 'Cibodas',
  date: '15 Maret 2024',
  startTime: '07:00 WIB',
  endTime: 'Selesai',
  duration: '8 jam 30 menit',
  distance: '8.5 km',
  elevationGain: '+1.800 m',
  avgSpeed: '1.0 km/j',
  status: 'completed' as const,
};

const BREADCRUMB = [
  { latitude: -6.789, longitude: 106.822, timestamp: Date.now() - 8 * 3600000 },
  { latitude: -6.792, longitude: 106.819, timestamp: Date.now() - 7 * 3600000 },
  { latitude: -6.798, longitude: 106.815, timestamp: Date.now() - 6 * 3600000 },
  { latitude: -6.804, longitude: 106.811, timestamp: Date.now() - 5 * 3600000 },
  { latitude: -6.809, longitude: 106.806, timestamp: Date.now() - 4 * 3600000 },
  { latitude: -6.814, longitude: 106.801, timestamp: Date.now() - 3 * 3600000 },
  { latitude: -6.820, longitude: 106.795, timestamp: Date.now() - 2 * 3600000 },
  { latitude: -6.825, longitude: 106.790, timestamp: Date.now() - 1 * 3600000 },
];

const WAYPOINTS = [
  { name: 'Basecamp Cibodas', time: '07:00', elevation: 1.420 },
  { name: 'Telaga Biru', time: '08:30', elevation: 1.600 },
  { name: 'Puncak Gede', time: '12:00', elevation: 2.958 },
  { name: 'Kembali ke Basecamp', time: '15:30', elevation: 1.420 },
];

const TripDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const trip = (route.params as any)?.trip;
  const [showGPX, setShowGPX] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Saya baru saja menyelesaikan pendakian ${trip?.mountain ?? TRIP_DETAIL.mountain} via ${trip?.route ?? TRIP_DETAIL.route} menggunakan @JejakApp! 🏔️ https://jejak.id/trip/${trip?.id ?? 'demo'}`,
        title: 'Trip Pendakian',
      });
    } catch {}
  };

  const handleExportGPX = () => {
    // pon
    setShowGPX(true);
  };

  const total = TRIP_DETAIL;
  const isCompleted = total.status === 'completed';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero / Map */}
      <View style={styles.mapContainer}>
        <MapViewComponent
          centerCoordinate={{ latitude: -6.81, longitude: 106.80 }}
          zoomLevel={13}
          style={styles.map}
          markers={[
            { id: 'start', coordinate: BREADCRUMB[0], title: 'Start', icon: '🚩', type: 'custom' as const },
            { id: 'summit', coordinate: BREADCRUMB[BREADCRUMB.length - 1], title: 'Puncak', icon: '⛰️', type: 'mountain' as const },
          ]}
          showUserLocation={false}
          showBreadcrumb={showGPX}
          breadcrumbTrail={showGPX ? BREADCRUMB as any : []}
        />
        <View style={styles.mapOverlay}>
          <View style={styles.statusBadge}>
            <Icon name={isCompleted ? 'check-circle' : 'timer'} size={14} color={isCompleted ? Colors.success : Colors.warning} />
            <Text style={[styles.statusText, { color: isCompleted ? Colors.success : Colors.warning }]}>
              {isCompleted ? 'SELESAI' : 'DALAM PROGRES'}
            </Text>
          </View>
        </View>
      </View>

      {/* Trip Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Icon name="terrain" size={24} color={Colors.primary} />
          <View style={styles.headerInfo}>
            <Text style={styles.mountainName}>{trip?.mountain ?? total.mountain}</Text>
            <Text style={styles.routeName}>Via {trip?.route ?? total.route} · {trip?.date ?? total.date}</Text>
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.7}>
            <Icon name="share" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Icon name="timer" size={20} color={Colors.primary} />
          <Text style={styles.statValue}>{total.duration}</Text>
          <Text style={styles.statLabel}>Durasi</Text>
        </Card>
        <Card style={styles.statCard}>
          <Icon name="straighten" size={20} color={Colors.secondary} />
          <Text style={styles.statValue}>{total.distance}</Text>
          <Text style={styles.statLabel}>Jarak</Text>
        </Card>
        <Card style={styles.statCard}>
          <Icon name="trending-up" size={20} color={Colors.accent} />
          <Text style={styles.statValue}>{total.elevationGain}</Text>
          <Text style={styles.statLabel}>Elevasi</Text>
        </Card>
        <Card style={styles.statCard}>
          <Icon name="speed" size={20} color={Colors.info} />
          <Text style={styles.statValue}>{total.avgSpeed}</Text>
          <Text style={styles.statLabel}>Rata-rata</Text>
        </Card>
      </View>

      {/* Time toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, showGPX && styles.toggleBtnActive]}
          onPress={() => setShowGPX(false)}
          activeOpacity={0.7}
        >
          <Icon name="list" size={16} color={!showGPX ? Colors.textInverse : Colors.textSecondary} />
          <Text style={[styles.toggleText, !showGPX && styles.toggleTextActive]}>Timeline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, showGPX && styles.toggleBtnActive]}
          onPress={() => setShowGPX(true)}
          activeOpacity={0.7}
        >
          <Icon name="map" size={16} color={showGPX ? Colors.textInverse : Colors.textSecondary} />
          <Text style={[styles.toggleText, showGPX && styles.toggleTextActive]}>Peta Track</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline */}
      {!showGPX && (
        <View style={styles.section}>
          <SectionHeader title="Timeline Pendakian" />
          {WAYPOINTS.map((wp, idx) => (
            <View key={idx} style={styles.wpRow}>
              <View style={styles.wpTimeline}>
                <View style={[styles.wpDot, idx === 0 && styles.wpDotStart, idx === WAYPOINTS.length - 1 && styles.wpDotEnd]} />
                {idx < WAYPOINTS.length - 1 && <View style={styles.wpLine} />}
              </View>
              <View style={styles.wpContent}>
                <Text style={styles.wpName}>{wp.name}</Text>
                <Text style={styles.wpMeta}>{wp.time} · {wp.elevation} mdpl</Text>
              </View>
              <View style={[styles.wpElevation, { backgroundColor: Colors.primaryFaded }]}>
                <Text style={styles.wpElevationText}>{wp.elevation}mdpl</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button title="Bagikan Trip" icon="share" variant="outline" onPress={handleShare} style={styles.actionBtn} />
        <Button title="Export GPX" icon="file-download" variant="outline" onPress={handleExportGPX} style={styles.actionBtn} />
        <Button title="Lihat di Maps" icon="map" onPress={() => setShowGPX(true)} style={styles.actionBtn} />
      </View>

      {/* Weather recap */}
      <Card style={styles.weatherCard}>
        <Text style={styles.weatherTitle}>Kondisi Saat Pendakian</Text>
        <View style={styles.weatherRow}>
          {[
            { icon: 'wb-sunny', label: 'Cuaca', value: 'Berawan' },
            { icon: 'thermostat', label: 'Suhu Puncak', value: '8°C' },
            { icon: 'air', label: 'Angin', value: '15 km/j' },
          ].map((w, i) => (
            <View key={i} style={styles.weatherItem}>
              <Icon name={w.icon as any} size={20} color={Colors.textSecondary} />
              <Text style={styles.weatherLabel}>{w.label}</Text>
              <Text style={styles.weatherValue}>{w.value}</Text>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },
  mapContainer: { height: 220, position: 'relative' },
  map: { width: '100%', height: '100%' },
  mapOverlay: { position: 'absolute', top: Spacing.md, right: Spacing.md },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    gap: 4,
    ...Shadows.sm,
  },
  statusText: { fontWeight: '800', fontSize: 11, letterSpacing: 0.5 },

  header: { padding: Spacing.screenPadding },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerInfo: { flex: 1 },
  mountainName: { ...Typography.h3, color: Colors.text, fontWeight: '800' },
  routeName: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: { width: (width - Spacing.screenPadding * 2 - Spacing.sm * 3) / 4, alignItems: 'center', padding: Spacing.sm },
  statValue: { ...Typography.subtitle2, color: Colors.text, fontWeight: '800', marginTop: 4 },
  statLabel: { ...Typography.caption, color: Colors.textSecondary, fontSize: 10 },

  toggleRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.screenPadding,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 4,
    gap: 4,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  toggleBtnActive: { backgroundColor: Colors.primary },
  toggleText: { ...Typography.buttonSmall, color: Colors.textSecondary },
  toggleTextActive: { color: Colors.textInverse, fontWeight: '700' },

  section: { paddingHorizontal: Spacing.screenPadding },
  wpRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  wpTimeline: { alignItems: 'center', width: 24, marginRight: Spacing.md },
  wpDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary, borderWidth: 2, borderColor: Colors.primaryLight },
  wpDotStart: { backgroundColor: Colors.success, borderColor: Colors.successLight },
  wpDotEnd: { backgroundColor: Colors.danger, borderColor: Colors.dangerLight },
  wpLine: { flex: 1, width: 2, backgroundColor: Colors.border, marginVertical: 4 },
  wpContent: { flex: 1 },
  wpName: { ...Typography.subtitle2, color: Colors.text, fontWeight: '700' },
  wpMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  wpElevation: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.xs, alignSelf: 'flex-start' },
  wpElevationText: { fontSize: 11, color: Colors.primaryDark, fontWeight: '700' },

  actions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionBtn: { flex: 1 },

  weatherCard: { marginHorizontal: Spacing.screenPadding, marginTop: Spacing.md },
  weatherTitle: { ...Typography.subtitle2, color: Colors.text, fontWeight: '800', marginBottom: Spacing.md },
  weatherRow: { flexDirection: 'row', gap: Spacing.sm },
  weatherItem: { flex: 1, alignItems: 'center', gap: 4 },
  weatherLabel: { ...Typography.caption, color: Colors.textSecondary },
  weatherValue: { ...Typography.subtitle2, color: Colors.text, fontWeight: '700' },
});

export default TripDetailScreen;
