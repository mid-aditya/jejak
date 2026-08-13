import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapViewComponent from '../../shared/components/MapView';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import { Card, Button, StatCard, SectionHeader } from '../../shared/components/ui';

const { width } = Dimensions.get('window');
const MAP_WIDTH = width - Spacing.screenPadding * 2;

const ACTIVE_TRIPS = [
  { id: '1', mountain: 'Gunung Gede - Cibodas', date: '15 Mar 2024', duration: '8 jam' },
  { id: '2', mountain: 'Gunung Merbabu - Selo', date: '20 Mar 2024', duration: '12 jam' },
];

const CheckInOutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [mode, setMode] = useState<'checkin' | 'checkout' | 'active' | 'overdue'>('checkin');
  const [selectedTrip, setSelectedTrip] = useState(ACTIVE_TRIPS[0].id);
  const [estimatedReturn, setEstimatedReturn] = useState('16:00');
  const [trackingDuration] = useState('2j 15m');
  const [distance] = useState('3.2 km');
  const [elevationGain] = useState('450 m');
  const [avgSpeed] = useState('1.2 km/j');

  const handleCheckIn = () => {
    Alert.alert('Mulai Pendakian', 'Pastikan semua peralatan lengkap dan kontak darurat sudah terisi.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Mulai', onPress: () => setMode('active') },
    ]);
  };

  const handleCheckOut = () => {
    Alert.alert('Selesai Pendakian', 'Konfirmasi bahwa Anda telah kembali dengan selamat.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Selesai', onPress: () => {
        Alert.alert('Check-out Berhasil', 'Trip summary telah disimpan.');
        navigation.goBack();
      } },
    ]);
  };

  const renderCheckIn = () => (
    <>
      <Text style={styles.pageTitle}>Check-In Pendakian</Text>
      <Text style={styles.subtitle}>Catat awal pendakian Anda untuk keamanan</Text>

      <SectionHeader title="Pilih Trip" />
      {ACTIVE_TRIPS.map(trip => (
        <Card
          key={trip.id}
          onPress={() => setSelectedTrip(trip.id)}
          style={[styles.tripSelect, selectedTrip === trip.id && styles.tripSelected]}
        >
          <Icon
            name={selectedTrip === trip.id ? 'radio-button-checked' : 'radio-button-unchecked'}
            size={22}
            color={selectedTrip === trip.id ? Colors.primary : Colors.textTertiary}
          />
          <View style={styles.tripInfo}>
            <Text style={styles.tripName}>{trip.mountain}</Text>
            <Text style={styles.tripMeta}>{trip.date} · Est. {trip.duration}</Text>
          </View>
        </Card>
      ))}

      <SectionHeader title="Lokasi Check-In" />
      <MapViewComponent
        centerCoordinate={{ latitude: -6.789, longitude: 106.822 }}
        zoomLevel={14}
        style={styles.map}
        markers={[]}
        showUserLocation
        showBreadcrumb={false}
      />

      <SectionHeader title="Estimasi Waktu Kembali" />
      <Card style={styles.timeCard}>
        <TextInput
          style={styles.timeField}
          value={estimatedReturn}
          onChangeText={setEstimatedReturn}
          placeholder="Contoh: 16:00"
          placeholderTextColor={Colors.textTertiary}
          keyboardType="numbers-and-punctuation"
        />
        <Text style={styles.timeLabel}>WIB, {new Date().toLocaleDateString('id-ID')}</Text>
      </Card>

      <View style={styles.infoCard}>
        <Icon name="info" size={18} color={Colors.primary} />
        <Text style={styles.infoText}>
          Jika tidak check-out sesuai estimasi + 30 menit buffer, kontak darurat akan diberitahu.
        </Text>
      </View>

      <Button
        title="Mulai Pendakian"
        icon="play-arrow"
        size="lg"
        onPress={handleCheckIn}
        style={styles.primaryBtn}
      />
    </>
  );

  const renderActive = () => (
    <>
      <Text style={styles.pageTitle}>Pendakian Aktif</Text>
      <View style={styles.activeBadge}>
        <Icon name="timer" size={16} color={Colors.textInverse} />
        <Text style={styles.activeText}>SEDANG MENDAKI</Text>
      </View>

      <MapViewComponent
        centerCoordinate={{ latitude: -6.789, longitude: 106.822 }}
        zoomLevel={15}
        style={styles.mapLarge}
        markers={[]}
        showUserLocation
        showBreadcrumb
      />

      <View style={styles.statsGrid}>
        <StatCard value={trackingDuration} label="Durasi" icon="timer" style={styles.statItem} />
        <StatCard value={distance} label="Jarak" icon="straighten" style={styles.statItem} />
        <StatCard value={elevationGain} label="Elevasi" icon="trending-up" style={styles.statItem} />
        <StatCard value={avgSpeed} label="Kecepatan" icon="speed" style={styles.statItem} />
      </View>

      <Button
        title="Selesaikan Pendakian"
        icon="stop"
        size="lg"
        variant="danger"
        onPress={() => setMode('checkout')}
        style={styles.primaryBtn}
      />
    </>
  );

  const renderCheckOut = () => (
    <>
      <Text style={styles.pageTitle}>Check-Out</Text>
      <Text style={styles.subtitle}>Konfirmasi Anda telah kembali dengan selamat</Text>

      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Ringkasan Pendakian</Text>
        {[
          ['Gunung', 'Gunung Gede - Cibodas'],
          ['Durasi', '2 jam 15 menit'],
          ['Jarak', '3.2 km'],
          ['Elevasi', '+450 m'],
          ['Rata-rata', '1.2 km/j'],
        ].map(([label, value]) => (
          <View key={label} style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{label}</Text>
            <Text style={styles.summaryValue}>{value}</Text>
          </View>
        ))}
      </Card>

      <View style={styles.btnRow}>
        <Button title="Bagikan" variant="outline" icon="share" style={styles.flexBtn} />
        <Button title="Export GPX" variant="outline" icon="file-download" style={styles.flexBtn} />
      </View>

      <Button
        title="Konfirmasi Check-Out"
        icon="check-circle"
        size="lg"
        onPress={handleCheckOut}
        style={styles.primaryBtn}
      />
    </>
  );

  const renderOverdue = () => (
    <>
      <View style={styles.overdueHeader}>
        <Icon name="warning" size={40} color={Colors.danger} />
        <Text style={styles.overdueTitle}>TERLAMBAT</Text>
        <Text style={styles.overdueSub}>Sudah 45 menit dari estimasi kembali</Text>
      </View>

      <MapViewComponent
        centerCoordinate={{ latitude: -6.789, longitude: 106.822 }}
        zoomLevel={13}
        style={styles.mapLarge}
        markers={[]}
        showUserLocation
        showBreadcrumb
      />

      <Card style={styles.timelineCard}>
        <View style={styles.overdueStep}>
          <View style={[styles.overdueDot, styles.overdueDone]} />
          <Text style={styles.overdueStepText}>Kontak darurat diberitahu</Text>
          <Icon name="check" size={16} color={Colors.success} />
        </View>
        <View style={styles.overdueStep}>
          <View style={[styles.overdueDot, styles.overdueDone]} />
          <Text style={styles.overdueStepText}>Basecamp diberitahu</Text>
          <Icon name="check" size={16} color={Colors.success} />
        </View>
        <View style={styles.overdueStep}>
          <View style={[styles.overdueDot, styles.overduePending]} />
          <Text style={styles.overdueStepText}>Proses pemberitahuan SAR</Text>
          <Icon name="hourglass-top" size={16} color={Colors.warning} />
        </View>
      </Card>

      <Button
        title="Saya Aman!"
        icon="check-circle"
        size="lg"
        onPress={() => setMode('active')}
        style={styles.primaryBtn}
      />
    </>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {mode === 'checkin' && renderCheckIn()}
      {mode === 'active' && renderActive()}
      {mode === 'checkout' && renderCheckOut()}
      {mode === 'overdue' && renderOverdue()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.screenPadding, paddingBottom: Spacing.xxl },
  pageTitle: { ...Typography.h3, color: Colors.text, fontWeight: '800', marginBottom: 4 },
  subtitle: { ...Typography.body2, color: Colors.textSecondary, marginBottom: Spacing.lg },

  tripSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tripSelected: { borderColor: Colors.primary, borderWidth: 1.5 },
  tripInfo: { flex: 1 },
  tripName: { ...Typography.subtitle2, color: Colors.text, fontWeight: '700' },
  tripMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },

  map: { width: MAP_WIDTH, height: 160, borderRadius: BorderRadius.md, overflow: 'hidden' },
  mapLarge: { width: MAP_WIDTH, height: 200, borderRadius: BorderRadius.md, overflow: 'hidden', marginBottom: Spacing.md },

  timeCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  timeField: { ...Typography.subtitle1, color: Colors.text, fontWeight: '800', width: 70, paddingVertical: 0 },
  timeLabel: { ...Typography.body2, color: Colors.textSecondary },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryFaded,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  infoText: { ...Typography.body2, color: Colors.primaryDark, flex: 1, lineHeight: 20 },

  primaryBtn: { marginTop: Spacing.sm },
  activeBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    gap: 6,
    marginBottom: Spacing.md,
  },
  activeText: { color: Colors.textInverse, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statItem: { width: (MAP_WIDTH - Spacing.sm) / 2 },

  summaryCard: { marginBottom: Spacing.md },
  summaryTitle: { ...Typography.subtitle1, color: Colors.text, fontWeight: '800', marginBottom: Spacing.sm },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  summaryLabel: { ...Typography.body2, color: Colors.textSecondary },
  summaryValue: { ...Typography.body2, color: Colors.text, fontWeight: '700' },

  btnRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  flexBtn: { flex: 1 },

  overdueHeader: {
    alignItems: 'center',
    backgroundColor: Colors.dangerFaded,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  overdueTitle: { ...Typography.h3, color: Colors.danger, fontWeight: '800', marginTop: Spacing.sm },
  overdueSub: { ...Typography.body2, color: Colors.danger, marginTop: 4 },
  timelineCard: { marginBottom: Spacing.md },
  overdueStep: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.sm },
  overdueDot: { width: 10, height: 10, borderRadius: 5 },
  overdueDone: { backgroundColor: Colors.success },
  overduePending: { backgroundColor: Colors.warning },
  overdueStepText: { flex: 1, ...Typography.body2, color: Colors.text },
});

export default CheckInOutScreen;
