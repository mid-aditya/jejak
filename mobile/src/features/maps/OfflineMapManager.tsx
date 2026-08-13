import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import { Card } from '../../shared/components/ui';

const MAP_REGIONS = [
  { id: '1', name: 'Gunung Gede-Pangrango', province: 'Jawa Barat', sizeMB: 45, isDownloaded: true },
  { id: '2', name: 'Gunung Rinjani', province: 'NTB', sizeMB: 62, isDownloaded: false },
  { id: '3', name: 'Gunung Semeru', province: 'Jawa Timur', sizeMB: 38, isDownloaded: false },
  { id: '4', name: 'Gunung Merbabu', province: 'Jawa Tengah', sizeMB: 28, isDownloaded: true },
  { id: '5', name: 'Gunung Merapi', province: 'DIY', sizeMB: 22, isDownloaded: false },
  { id: '6', name: 'Gunung Bromo', province: 'Jawa Timur', sizeMB: 30, isDownloaded: false },
  { id: '7', name: 'Gunung Kerinci', province: 'Jambi', sizeMB: 55, isDownloaded: false },
  { id: '8', name: 'Gunung Latimojong', province: 'Sulawesi Selatan', sizeMB: 40, isDownloaded: false },
];

const OfflineMapManager: React.FC = () => {
  const [regions, setRegions] = useState(MAP_REGIONS);
  const [autoDownloadWifi, setAutoDownloadWifi] = useState(true);
  const [activeDownload, setActiveDownload] = useState<{ id: string; progress: number } | null>(null);

  const totalUsed = regions.filter(r => r.isDownloaded).reduce((acc, r) => acc + r.sizeMB, 0);
  const totalAvailable = 1200;

  const handleDownload = (id: string) => {
    if (activeDownload) return;
    setActiveDownload({ id, progress: 0 });
    const interval = setInterval(() => {
      setActiveDownload(prev => {
        if (!prev) return null;
        const next = prev.progress + 15;
        if (next >= 100) {
          clearInterval(interval);
          setRegions(prev => prev.map(r => r.id === id ? { ...r, isDownloaded: true } : r));
          return null;
        }
        return { ...prev, progress: next };
      });
    }, 300);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Hapus Peta', `Hapus peta offline untuk ${name}?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => setRegions(prev => prev.map(r => r.id === id ? { ...r, isDownloaded: false } : r)) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Card style={styles.storageCard}>
        <View style={styles.storageHeader}>
          <View style={styles.storageIcon}>
            <Icon name="storage" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.storageTitle}>Penyimpanan Offline</Text>
        </View>
        <View style={styles.storageBarBg}>
          <View style={[styles.storageBarFill, { width: `${Math.min((totalUsed / totalAvailable) * 100, 100)}%` }]} />
        </View>
        <View style={styles.storageLabels}>
          <Text style={styles.storageText}>Terpakai: {totalUsed}MB</Text>
          <Text style={styles.storageText}>Tersedia: {totalAvailable - totalUsed}MB</Text>
        </View>
      </Card>

      <Card style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Icon name="wifi" size={18} color={Colors.textSecondary} />
          <Text style={styles.settingLabel}>Auto-download saat WiFi</Text>
        </View>
        <Switch
          value={autoDownloadWifi}
          onValueChange={setAutoDownloadWifi}
          trackColor={{ true: Colors.primary }}
          thumbColor={Colors.surface}
        />
      </Card>

      <Text style={styles.sectionTitle}>Daftar Peta</Text>
      {regions.map(region => (
        <Card key={region.id} style={styles.regionCard}>
          <View style={styles.regionInfo}>
            <Text style={styles.regionName}>{region.name}</Text>
            <Text style={styles.regionMeta}>{region.province} · {region.sizeMB}MB</Text>
            {region.isDownloaded && (
              <Text style={styles.downloadedHint}>
                <Icon name="check-circle" size={12} color={Colors.success} /> Tersimpan
              </Text>
            )}
          </View>
          {region.isDownloaded ? (
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(region.id, region.name)} activeOpacity={0.7}>
              <Icon name="delete" size={18} color={Colors.danger} />
            </TouchableOpacity>
          ) : activeDownload?.id === region.id ? (
            <View style={styles.progressWrap}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${activeDownload.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{activeDownload.progress}%</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload(region.id)} activeOpacity={0.7}>
              <Icon name="download" size={18} color={Colors.textInverse} />
            </TouchableOpacity>
          )}
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.screenPadding, paddingBottom: 40 },
  storageCard: { marginBottom: Spacing.md, ...Shadows.md },
  storageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm },
  storageIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storageTitle: { ...Typography.subtitle1, color: Colors.text, fontWeight: '700' },
  storageBarBg: { height: 8, backgroundColor: Colors.borderLight, borderRadius: BorderRadius.xs, overflow: 'hidden' },
  storageBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: BorderRadius.xs },
  storageLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm },
  storageText: { ...Typography.caption, color: Colors.textSecondary },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  settingLabel: { ...Typography.subtitle2, color: Colors.text, fontWeight: '600' },
  sectionTitle: { ...Typography.subtitle1, color: Colors.text, fontWeight: '700', marginBottom: Spacing.sm },
  regionCard: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, ...Shadows.sm },
  regionInfo: { flex: 1 },
  regionName: { ...Typography.subtitle2, color: Colors.text, fontWeight: '600' },
  regionMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  downloadedHint: { ...Typography.caption, color: Colors.success, marginTop: 2, fontWeight: '600' },
  deleteBtn: { padding: Spacing.sm, backgroundColor: Colors.dangerFaded, borderRadius: BorderRadius.sm },
  downloadBtn: { padding: Spacing.sm, backgroundColor: Colors.primary, borderRadius: BorderRadius.sm },
  progressWrap: { width: 80, alignItems: 'flex-end' },
  progressBarBg: { height: 6, backgroundColor: Colors.borderLight, borderRadius: 3, width: 60, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  progressText: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
});

export default OfflineMapManager;
