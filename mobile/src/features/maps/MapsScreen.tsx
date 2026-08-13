import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import MapViewComponent from '../../shared/components/MapView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import { Card, SearchBar, Chip, Button } from '../../shared/components/ui';

const { width, height } = Dimensions.get('window');

const MOUNTAINS = [
  { id: '1', name: 'Gunung Gede', region: 'Jawa Barat', elevation: 2958, difficulty: 6, lat: -6.789, lng: 106.822, routes: 3, weather: 'Berawan', temp: 18 },
  { id: '2', name: 'Gunung Rinjani', region: 'NTB', elevation: 3726, difficulty: 8, lat: -8.41, lng: 116.46, routes: 5, weather: 'Cerah', temp: 15 },
  { id: '3', name: 'Gunung Semeru', region: 'Jawa Timur', elevation: 3676, difficulty: 9, lat: -8.108, lng: 112.92, routes: 2, weather: 'Kabut', temp: 10 },
  { id: '4', name: 'Gunung Merbabu', region: 'Jawa Tengah', elevation: 3145, difficulty: 5, lat: -7.455, lng: 110.44, routes: 4, weather: 'Cerah', temp: 14 },
  { id: '5', name: 'Gunung Merapi', region: 'DIY', elevation: 2930, difficulty: 7, lat: -7.541, lng: 110.446, routes: 3, weather: 'Hujan Ringan', temp: 16 },
  { id: '6', name: 'Gunung Bromo', region: 'Jawa Timur', elevation: 2329, difficulty: 4, lat: -7.942, lng: 112.953, routes: 2, weather: 'Berkabut', temp: 12 },
];

const REGIONS = ['Semua', 'Jawa', 'Sumatra', 'Kalimantan', 'Sulawesi', 'Bali'];

const getDifficultyColor = (level: number) => {
  if (level <= 3) return Colors.success;
  if (level <= 6) return Colors.warning;
  if (level <= 8) return Colors.accent;
  return Colors.danger;
};

const getWeatherBg = (weather: string) => {
  if (weather === 'Cerah') return Colors.successFaded;
  if (weather.includes('Hujan')) return Colors.infoFaded;
  return Colors.warningFaded;
};

const MapsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Semua');
  const [selectedMountain, setSelectedMountain] = useState<any>(null);
  const [showCard, setShowCard] = useState(false);

  const filteredMountains = MOUNTAINS.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchRegion = selectedRegion === 'Semua' || m.region.includes(selectedRegion);
    return matchSearch && matchRegion;
  });

  const DifficultyBar = ({ level }: { level: number }) => (
    <View style={styles.difficultyBar}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
        <View
          key={i}
          style={[
            styles.difficultyDot,
            { backgroundColor: i <= level ? getDifficultyColor(level) : Colors.border },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <MapViewComponent
        centerCoordinate={{ latitude: -6.9, longitude: 110.5 }}
        zoomLevel={5}
        style={{ width, height }}
        markers={filteredMountains.map(m => ({
          id: m.id,
          coordinate: { latitude: m.lat, longitude: m.lng },
          title: m.name,
        }))}
        onMarkerPress={id => {
          const m = MOUNTAINS.find(mt => mt.id === id);
          if (m) {
            setSelectedMountain(m);
            setShowCard(true);
          }
        }}
        showUserLocation
        showBreadcrumb={false}
      />

      {/* Overlay controls */}
      <View style={styles.topOverlay}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari gunung..."
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
          style={styles.chipScroll}
        >
          {REGIONS.map(region => (
            <Chip
              key={region}
              label={region}
              active={selectedRegion === region}
              onPress={() => setSelectedRegion(region)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Mountain card */}
      {showCard && selectedMountain && (
        <Card elevated style={styles.mountainCard}>
          <TouchableOpacity
            style={styles.closeCard}
            onPress={() => setShowCard(false)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.cardHeader}>
            <Text style={styles.mountainName}>{selectedMountain.name}</Text>
            <View
              style={[
                styles.weatherBadge,
                { backgroundColor: getWeatherBg(selectedMountain.weather) },
              ]}
            >
              <Text style={styles.weatherText}>
                {selectedMountain.weather} · {selectedMountain.temp}°C
              </Text>
            </View>
          </View>
          <View style={styles.cardStats}>
            <View style={styles.statItem}>
              <Icon name="terrain" size={16} color={Colors.textSecondary} />
              <Text style={styles.statText}>{selectedMountain.elevation} mdpl</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="trending-up" size={16} color={Colors.textSecondary} />
              <Text style={styles.statText}>Level {selectedMountain.difficulty}/10</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="route" size={16} color={Colors.textSecondary} />
              <Text style={styles.statText}>{selectedMountain.routes} rute</Text>
            </View>
          </View>
          <DifficultyBar level={selectedMountain.difficulty} />
          <View style={styles.cardActions}>
            <Button
              title="Lihat Detail"
              onPress={() => navigation.navigate('MountainDetail', { mountain: selectedMountain })}
              style={styles.detailBtn}
            />
            <Button
              title="Offline"
              variant="outline"
              icon="download"
              onPress={() => navigation.navigate('OfflineMapManager')}
              style={styles.offlineBtn}
            />
          </View>
        </Card>
      )}

      <View style={[styles.layersToggle, { bottom: showCard ? 220 : 24 }]}>
        <TouchableOpacity style={styles.layerBtn}>
          <Icon name="layers" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topOverlay: {
    position: 'absolute',
    top: 50,
    left: Spacing.screenPadding,
    right: Spacing.screenPadding,
    gap: Spacing.sm,
  },
  chipScroll: { flexGrow: 0 },
  chipContainer: { gap: Spacing.sm, paddingRight: Spacing.md },

  mountainCard: {
    position: 'absolute',
    bottom: 24,
    left: Spacing.screenPadding,
    right: Spacing.screenPadding,
    padding: Spacing.md,
  },
  closeCard: { position: 'absolute', top: 12, right: 12, zIndex: 1, padding: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  mountainName: { ...Typography.h4, color: Colors.text, fontWeight: '800', flex: 1 },
  weatherBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.round },
  weatherText: { ...Typography.caption, color: Colors.text, fontWeight: '600' },
  cardStats: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { ...Typography.caption, color: Colors.textSecondary },
  difficultyBar: { flexDirection: 'row', gap: 4, marginBottom: Spacing.md },
  difficultyDot: { width: 22, height: 6, borderRadius: 3 },
  cardActions: { flexDirection: 'row', gap: Spacing.sm },
  detailBtn: { flex: 1 },
  offlineBtn: { flex: 1 },

  layersToggle: {
    position: 'absolute',
    right: Spacing.screenPadding,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.md,
  },
  layerBtn: { padding: 12 },
});

export default MapsScreen;
