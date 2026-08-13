import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Dimensions, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapViewComponent from '../../shared/components/MapView';
import { RootState, AppDispatch } from '../../shared/store';
import { resolveSOS } from '../../shared/store/slices/emergencySlice';
import { Colors, Typography, Spacing, BorderRadius } from '../../config/theme';
import { Card, Button } from '../../shared/components/ui';

const { width } = Dimensions.get('window');

const EmergencyScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentSOS } = useSelector((state: RootState) => state.emergency);
  const [currentStep, setCurrentStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = [
    { label: 'SOS Terkirim', icon: 'check-circle', status: 'completed' },
    { label: 'Kontak Darurat Diberitahu', icon: 'people', status: currentStep >= 1 ? 'completed' : 'pending' },
    { label: 'Basecamp Diberitahu', icon: 'home', status: currentStep >= 2 ? 'completed' : 'pending' },
    { label: 'SAR Dihubungi', icon: 'local-hospital', status: currentStep >= 3 ? 'completed' : 'pending' },
  ];

  const emergencyContacts = [
    { name: 'Ibu Sari', phone: '081234567890', relationship: 'Ibu' },
    { name: 'Bapak Hendra', phone: '089876543210', relationship: 'Saudara' },
  ];

  const sarContacts = [
    { name: 'BNPB', phone: '021-29827999' },
    { name: 'Basarnas', phone: '021-65701116' },
    { name: 'Basecamp Gede', phone: '0263221234' },
  ];

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return prev;
      });
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleSafe = () => {
    if (!currentSOS) return;
    Alert.alert('Konfirmasi', 'Pastikan Anda dalam kondisi aman sebelum menyelesaikan SOS.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Saya Aman', style: 'destructive', onPress: () => dispatch(resolveSOS(currentSOS.id)) },
    ]);
  };

  const handleCancel = () => {
    if (!currentSOS) return;
    Alert.alert('Batalkan SOS', 'Pastikan ini adalah alarm palsu. Status akan dicatat.', [
      { text: 'Tetap SOS', style: 'cancel' },
      { text: 'Batalkan', onPress: () => dispatch(resolveSOS(currentSOS.id)) },
    ]);
  };

  const callNumber = (phone: string) => Linking.openURL(`tel:${phone}`);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.sosBadge}>
          <View style={styles.sosPulse} />
          <Text style={styles.sosText}>SOS AKTIF</Text>
        </View>
        <Text style={styles.subtitle}>Status darurat sedang diproses</Text>
      </View>

      <MapViewComponent
        centerCoordinate={{ latitude: -6.789, longitude: 106.822 }}
        zoomLevel={13}
        style={{ width, height: 200 }}
        markers={[{ id: '1', coordinate: { latitude: -6.789, longitude: 106.822 }, title: 'Lokasi Anda', isSOS: true }]}
        showUserLocation
        showBreadcrumb={false}
      />

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Status Notifikasi</Text>
        <Card style={styles.stepsCard}>
          {steps.map((step, idx) => {
            const done = idx <= currentStep;
            return (
              <View key={idx} style={styles.stepRow}>
                <View style={[styles.stepIcon, { backgroundColor: done ? Colors.success : Colors.border }]}>
                  <Icon name={step.icon as any} size={16} color={done ? Colors.textInverse : Colors.textSecondary} />
                </View>
                <Text style={[styles.stepLabel, done ? styles.stepActive : styles.stepPending]}>{step.label}</Text>
                {done ? (
                  <Icon name="check" size={18} color={Colors.success} />
                ) : (
                  <View style={styles.stepDot} />
                )}
              </View>
            );
          })}
        </Card>

        <Text style={styles.sectionTitle}>Kontak Darurat</Text>
        {emergencyContacts.map((contact, idx) => (
          <Card key={idx} style={styles.contactRow}>
            <View style={styles.contactAvatar}>
              <Icon name="person" size={18} color={Colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactMeta}>{contact.relationship}</Text>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => callNumber(contact.phone)}
              activeOpacity={0.8}
            >
              <Icon name="call" size={16} color={Colors.textInverse} />
            </TouchableOpacity>
          </Card>
        ))}

        <Text style={styles.sectionTitle}>Kontak SAR</Text>
        <View style={styles.sarGrid}>
          {sarContacts.map((sar, idx) => (
            <Card key={idx} style={styles.sarCard} onPress={() => callNumber(sar.phone)}>
              <View style={styles.sarIcon}>
                <Icon name="local-hospital" size={22} color={Colors.danger} />
              </View>
              <Text style={styles.sarName}>{sar.name}</Text>
              <Text style={styles.sarPhone}>{sar.phone}</Text>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.bottomActions}>
        <Button title="Saya Aman" icon="check-circle" onPress={handleSafe} style={styles.safeBtn} />
        <Button title="Batalkan SOS" variant="outline" onPress={handleCancel} style={styles.cancelBtn} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.lg },
  header: { backgroundColor: Colors.sos, padding: Spacing.lg, alignItems: 'center' },
  sosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    gap: Spacing.sm,
  },
  sosPulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.sos },
  sosText: { color: Colors.sos, fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  subtitle: { color: 'rgba(255,255,255,0.85)', marginTop: Spacing.sm, fontSize: 13 },

  body: { padding: Spacing.screenPadding },
  sectionTitle: { ...Typography.subtitle1, color: Colors.text, fontWeight: '800', marginTop: Spacing.md, marginBottom: Spacing.sm },
  stepsCard: { marginBottom: Spacing.xs },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.md },
  stepIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  stepLabel: { flex: 1, ...Typography.body2 },
  stepActive: { color: Colors.text, fontWeight: '600' },
  stepPending: { color: Colors.textTertiary },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },

  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.md },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: { flex: 1 },
  contactName: { ...Typography.subtitle2, color: Colors.text, fontWeight: '700' },
  contactMeta: { ...Typography.caption, color: Colors.textSecondary },
  callBtn: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: BorderRadius.round,
  },

  sarGrid: { flexDirection: 'row', gap: Spacing.sm },
  sarCard: { flex: 1, alignItems: 'center', padding: Spacing.md },
  sarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dangerFaded,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sarName: { ...Typography.caption, color: Colors.text, fontWeight: '800', marginTop: 4 },
  sarPhone: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2, fontSize: 10 },

  bottomActions: {
    flexDirection: 'row',
    padding: Spacing.screenPadding,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  safeBtn: { flex: 1 },
  cancelBtn: { flex: 1 },
});

export default EmergencyScreen;
