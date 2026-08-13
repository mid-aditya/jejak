import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import { Card, Button, SectionHeader } from '../../shared/components/ui';

const { width } = Dimensions.get('window');

const TABS = ['Rute', 'Cuaca', 'Perizinan', 'Review'];

const getDifficultyColor = (level: number) => {
  if (level <= 3) return Colors.success;
  if (level <= 6) return Colors.warning;
  if (level <= 8) return Colors.accent;
  return Colors.danger;
};

const MountainDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { mountain } = route.params;
  const [activeTab, setActiveTab] = useState('Rute');

  const DifficultyBar = ({ level }: { level: number }) => (
    <View style={styles.difficultyRow}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
        <View
          key={i}
          style={[
            styles.dDifficulty,
            { backgroundColor: i <= level ? getDifficultyColor(level) : Colors.border },
          ]}
        />
      ))}
    </View>
  );

  const routes = [
    { name: 'Cibodas', duration: '8-10 jam', distance: '8.5km', elevationGain: 1800, waypoints: ['Cibodas', 'Telaga Biru', 'Alun-Alun Suryakencana', 'Puncak'], dangerZones: ['Sektor 2 (tanah longsor)'] },
    { name: 'Putri', duration: '10-12 jam', distance: '12km', elevationGain: 2100, waypoints: ['Putri', 'Pondok Mentri', 'Alun-Alun', 'Puncak'], dangerZones: ['Jalur sempit di tebing'] },
  ];

  const forecast = [
    { day: 'Hari Ini', icon: 'wb-sunny', condition: 'Berawan', temp: 18, humidity: 78, wind: 12 },
    { day: 'Besok', icon: 'cloud', condition: 'Hujan Ringan', temp: 15, humidity: 85, wind: 18 },
    { day: 'H+2', icon: 'wb-cloudy', condition: 'Kabut Tebal', temp: 12, humidity: 92, wind: 8 },
    { day: 'H+3', icon: 'wb-sunny', condition: 'Cerah', temp: 20, humidity: 65, wind: 10 },
    { day: 'H+4', icon: 'cloud-queue', condition: 'Mendung', temp: 17, humidity: 75, wind: 14 },
  ];

  const permits = [
    { name: 'Simaksi Dasar', price: 'Rp 15.000', required: 'KTP/SIM', info: 'Wajib untuk semua pendaki' },
    { name: 'SIMAKSI Lengkap', price: 'Rp 50.000', required: 'KTP + Surat Keterangan Sehat', info: 'Termasuk asuransi' },
    { name: 'Izin Kelompok (10+)', price: 'Rp 200.000', required: 'Surat dari Basecamp', info: 'Pendaftaran H-7' },
  ];

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600' }}
          style={styles.heroImage}
        />
        <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Icon name="arrow-back" size={24} color={Colors.textInverse} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.heroBtn, styles.heroBtnRight]} activeOpacity={0.8}>
          <Icon name="share" size={20} color={Colors.textInverse} />
        </TouchableOpacity>
        <View style={styles.heroGradient} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.name}>{mountain.name}</Text>
            <Text style={styles.region}>{mountain.region} · {mountain.elevation} mdpl</Text>
          </View>
          <View style={styles.difficultyBlock}>
            <Text style={styles.difficultyLabel}>Difficulty {mountain.difficulty}/10</Text>
            <DifficultyBar level={mountain.difficulty} />
          </View>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Icon name="timer" size={16} color={Colors.textSecondary} />
            <Text style={styles.quickStatText}>8-12 jam</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Icon name="thermostat" size={16} color={Colors.textSecondary} />
            <Text style={styles.quickStatText}>12-22°C</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Icon name="flag" size={16} color={Colors.textSecondary} />
            <Text style={styles.quickStatText}>3 rute</Text>
          </View>
        </View>

        <View style={styles.tabBar}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'Rute' && (
          <View>
            {routes.map((rt, idx) => (
              <Card key={idx} style={styles.routeCard}>
                <View style={styles.routeHeader}>
                  <Text style={styles.routeName}>{rt.name}</Text>
                  <Text style={styles.routeDuration}>{rt.duration}</Text>
                </View>
                <View style={styles.routeMeta}>
                  <Text style={styles.routeMetaText}>Jarak: {rt.distance}</Text>
                  <Text style={styles.routeMetaText}>Elevasi: +{rt.elevationGain}m</Text>
                </View>
                <Text style={styles.routeSectionTitle}>Waypoints</Text>
                {rt.waypoints.map((wp, i) => (
                  <View key={i} style={styles.waypointRow}>
                    <View style={styles.waypointDot} />
                    <Text style={styles.waypointText}>{wp}</Text>
                  </View>
                ))}
                <View style={styles.dangerZone}>
                  <Icon name="warning" size={14} color={Colors.danger} />
                  <Text style={styles.dangerText}>{rt.dangerZones[0]}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'Cuaca' && (
          <View>
            <Card style={styles.currentWeather}>
              <Icon name="wb-cloudy" size={48} color={Colors.textSecondary} />
              <Text style={styles.currentTemp}>18°C</Text>
              <Text style={styles.currentCondition}>Berawan · Angin 12km/j · Kelembapan 78%</Text>
            </Card>
            <SectionHeader title="Peringatan Dini" eyebrow="HAZARD" />
            <Card style={styles.hazardCard}>
              <View style={styles.hazardRow}>
                <View style={[styles.hazardDot, { backgroundColor: Colors.warning }]} />
                <Text style={styles.hazardText}>Kabut tebal berpotensi terjadi (H+2)</Text>
              </View>
              <View style={styles.hazardRow}>
                <View style={[styles.hazardDot, { backgroundColor: Colors.success }]} />
                <Text style={styles.hazardText}>Kondisi aman untuk pendakian hari ini</Text>
              </View>
            </Card>
            <SectionHeader title="Prakiraan 5 Hari" />
            {forecast.map((f, i) => (
              <Card key={i} style={styles.forecastRow}>
                <Text style={styles.forecastDay}>{f.day}</Text>
                <Icon name={f.icon as any} size={20} color={Colors.textSecondary} />
                <Text style={styles.forecastTemp}>{f.temp}°C</Text>
                <Text style={styles.forecastCondition}>{f.condition}</Text>
                <Text style={styles.forecastDetail}>H:{f.humidity}% W:{f.wind}km</Text>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'Perizinan' && (
          <View>
            <Text style={styles.permitsDesc}>Persyaratan perizinan untuk {mountain.name}</Text>
            {permits.map((p, i) => (
              <Card key={i} style={styles.permitsCard}>
                <View style={styles.permitsHeader}>
                  <Text style={styles.permitsName}>{p.name}</Text>
                  <Text style={styles.permitsPrice}>{p.price}</Text>
                </View>
                <Text style={styles.permitsRequired}>Diperlukan: {p.required}</Text>
                <Text style={styles.permitsInfo}>{p.info}</Text>
              </Card>
            ))}
            <Button title="Ajukan Perizinan" size="lg" style={styles.applyBtn} />
          </View>
        )}

        {activeTab === 'Review' && (
          <View>
            {[1, 2, 3].map(i => (
              <Card key={i} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Icon name="person" size={18} color={Colors.primary} />
                  </View>
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewName}>Pendaki {i}</Text>
                    <Text style={styles.reviewDate}>12 Mar 2024</Text>
                  </View>
                  <View style={styles.stars}>
                    <Icon name="star" size={14} color={Colors.warning} />
                    <Icon name="star" size={14} color={Colors.warning} />
                    <Icon name="star" size={14} color={Colors.warning} />
                    <Icon name="star" size={14} color={Colors.warning} />
                    <Icon name="star" size={14} color={Colors.warning} />
                  </View>
                </View>
                <Text style={styles.reviewText}>
                  Pendakian luar biasa! Jalur terawat, pemandangan indah dari puncak. Pastikan bawa jaket tebal karena dingin banget.
                </Text>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heroContainer: { position: 'relative', height: 250 },
  heroImage: { width, height: 250 },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: 'transparent',
  },
  heroBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: BorderRadius.round,
    padding: 8,
  },
  heroBtnRight: { left: undefined, right: 16 },
  content: { padding: Spacing.screenPadding },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  titleBlock: { flex: 1, paddingRight: Spacing.md },
  name: { ...Typography.h3, color: Colors.text, fontWeight: '800' },
  region: { ...Typography.body2, color: Colors.textSecondary, marginTop: 2 },
  difficultyBlock: { alignItems: 'flex-end' },
  difficultyLabel: { ...Typography.caption, color: Colors.textSecondary, marginBottom: 4 },
  difficultyRow: { flexDirection: 'row', gap: 2 },
  dDifficulty: { width: 16, height: 5, borderRadius: 2.5 },

  quickStats: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.lg },
  quickStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  quickStatText: { ...Typography.body2, color: Colors.textSecondary },

  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: Spacing.md },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary, marginBottom: -1 },
  tabText: { ...Typography.subtitle2, color: Colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: Colors.primary, fontWeight: '800' },

  routeCard: { marginBottom: Spacing.md },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  routeName: { ...Typography.subtitle1, color: Colors.text, fontWeight: '800' },
  routeDuration: { ...Typography.body2, color: Colors.textSecondary },
  routeMeta: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  routeMetaText: { ...Typography.caption, color: Colors.textSecondary },
  routeSectionTitle: { ...Typography.caption, color: Colors.text, fontWeight: '800', marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  waypointRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  waypointDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginRight: Spacing.sm },
  waypointText: { ...Typography.body2, color: Colors.text },
  dangerZone: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    backgroundColor: Colors.dangerFaded,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  dangerText: { fontSize: 12, color: Colors.danger, flex: 1, fontWeight: '600' },

  currentWeather: { alignItems: 'center', padding: Spacing.lg, marginBottom: Spacing.md },
  currentTemp: { ...Typography.h1, color: Colors.text, fontWeight: '800', marginVertical: Spacing.xs },
  currentCondition: { ...Typography.body2, color: Colors.textSecondary },
  hazardCard: { marginBottom: Spacing.md },
  hazardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: Spacing.sm },
  hazardDot: { width: 10, height: 10, borderRadius: 5 },
  hazardText: { flex: 1, ...Typography.body2, color: Colors.text },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  forecastDay: { width: 56, ...Typography.caption, color: Colors.text, fontWeight: '700' },
  forecastTemp: { width: 44, ...Typography.subtitle2, color: Colors.text, fontWeight: '800' },
  forecastCondition: { flex: 1, ...Typography.caption, color: Colors.textSecondary },
  forecastDetail: { fontSize: 11, color: Colors.textTertiary },

  permitsDesc: { ...Typography.body2, color: Colors.textSecondary, marginBottom: Spacing.md },
  permitsCard: { marginBottom: Spacing.sm },
  permitsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  permitsName: { ...Typography.subtitle2, color: Colors.text, fontWeight: '800' },
  permitsPrice: { ...Typography.subtitle2, color: Colors.primary, fontWeight: '800' },
  permitsRequired: { ...Typography.body2, color: Colors.textSecondary, marginTop: 4 },
  permitsInfo: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  applyBtn: { marginTop: Spacing.sm },

  reviewCard: { marginBottom: Spacing.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewInfo: { flex: 1 },
  reviewName: { ...Typography.subtitle2, color: Colors.text, fontWeight: '700' },
  reviewDate: { ...Typography.caption, color: Colors.textSecondary },
  stars: { flexDirection: 'row', gap: 1 },
  reviewText: { ...Typography.body2, color: Colors.text, lineHeight: 20 },
});

export default MountainDetailScreen;
