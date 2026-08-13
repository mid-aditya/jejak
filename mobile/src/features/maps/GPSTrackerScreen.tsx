import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import MapViewComponent from '../../shared/components/MapView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import { Button } from '../../shared/components/ui';

const { width, height } = Dimensions.get('window');

const GPSTrackerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [isTracking, setIsTracking] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState('02:15:32');
  const [distance, setDistance] = useState('3.2');
  const [elevationGain] = useState('450');
  const [currentSpeed, setCurrentSpeed] = useState('1.2');
  const [checkInTime] = useState('08:00');
  const [estimatedReturn] = useState('16:00');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTracking && !isPaused) {
      interval = setInterval(() => {
        setDuration(prev => {
          const [h, m, s] = prev.split(':').map(Number);
          const total = h * 3600 + m * 60 + s + 1;
          const nh = Math.floor(total / 3600);
          const nm = Math.floor((total % 3600) / 60);
          const ns = total % 60;
          return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}:${String(ns).padStart(2, '0')}`;
        });
        setDistance(prev => (parseFloat(prev) + 0.001).toFixed(3));
        setCurrentSpeed(prev => (Math.random() * 2 + 0.5).toFixed(1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, isPaused]);

  const handlePause = () => setIsPaused(!isPaused);

  const handleFinish = () => {
    Alert.alert('Selesaikan Pendakian', 'Yakin ingin menyelesaikan pendakian?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Selesaikan', onPress: () => navigation.navigate('CheckInOut', { mode: 'checkout' }) },
    ]);
  };

  const handleExport = () => {
    Alert.alert('Export GPX', 'File GPX akan di-export dan disimpan ke perangkat.');
  };

  const stats = [
    { icon: 'timer', value: duration, label: 'Durasi' },
    { icon: 'straighten', value: `${distance} km`, label: 'Jarak' },
    { icon: 'trending-up', value: `+${elevationGain}m`, label: 'Elevasi' },
    { icon: 'speed', value: currentSpeed, label: 'km/j' },
  ];

  return (
    <View style={styles.container}>
      <MapViewComponent
        centerCoordinate={{ latitude: -6.789, longitude: 106.822 }}
        zoomLevel={15}
        style={{ width, height: height * 0.5 }}
        markers={[]}
        showUserLocation
        showBreadcrumb
      />

      <View style={styles.statsOverlay}>
        {stats.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <View style={styles.statDivider} />}
            <View style={styles.statItem}>
              <Icon name={s.icon} size={16} color={Colors.textInverse} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      <View style={styles.bottomPanel}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Check-in</Text>
            <Text style={styles.infoValue}>{checkInTime} WIB</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Estimasi Pulang</Text>
            <Text style={styles.infoValue}>{estimatedReturn} WIB</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isPaused ? Colors.warning : Colors.success }]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{isPaused ? 'DIISTIRAHATKAN' : 'MEREKAM'}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.roundBtn} onPress={handlePause} activeOpacity={0.8}>
            <Icon name={isPaused ? 'play-arrow' : 'pause'} size={28} color={Colors.primary} />
          </TouchableOpacity>
          <Button
            title="SELESAI"
            icon="flag"
            onPress={handleFinish}
            style={styles.finishBtn}
          />
          <TouchableOpacity style={[styles.roundBtn, styles.exportBtn]} onPress={handleExport} activeOpacity={0.8}>
            <Icon name="file-download" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsOverlay: {
    position: 'absolute',
    top: 60,
    left: Spacing.screenPadding,
    right: Spacing.screenPadding,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  statValue: { ...Typography.subtitle2, fontWeight: '800', color: Colors.textInverse, marginTop: 2 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm },
  infoItem: { flex: 1 },
  infoLabel: { ...Typography.caption, color: Colors.textSecondary },
  infoValue: { ...Typography.subtitle2, color: Colors.text, fontWeight: '700' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textInverse },
  statusText: { fontSize: 10, color: Colors.textInverse, fontWeight: '800', letterSpacing: 0.5 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  roundBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportBtn: { borderWidth: 1.5, borderColor: Colors.primary },
  finishBtn: { paddingHorizontal: Spacing.lg },
});

export default GPSTrackerScreen;
