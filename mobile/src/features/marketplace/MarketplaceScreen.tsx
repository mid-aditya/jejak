import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import { Card, SearchBar, Chip, EmptyState, Avatar } from '../../shared/components/ui';

const { width } = Dimensions.get('window');

const GEAR_ITEMS = [
  { id: '1', title: 'Carrier Eiger Trail 45L - Like New', price: 'Rp 850.000', condition: 'Like New', category: 'Carrier', location: 'Bandung', seller: 'MiaHiker', rating: 4.8 },
  { id: '2', title: 'Tenda Naturehike CloudUp 2P', price: 'Rp 1.200.000', condition: 'New', category: 'Tenda', location: 'Jakarta', seller: 'GearShopID', rating: 4.9 },
  { id: '3', title: 'Sleeping Bag Consina Extreme -5°C', price: 'Rp 450.000', condition: 'Good', category: 'Sleeping Bag', location: 'Yogyakarta', seller: 'DoniTrek', rating: 4.5 },
  { id: '4', title: 'Sepatu Eiger Blacknut Series 42', price: 'Rp 650.000', condition: 'Good', category: 'Sepatu', location: 'Surabaya', seller: 'JalanTerus', rating: 4.7 },
  { id: '5', title: 'Kompor Camping Gas Portable', price: 'Rp 120.000', condition: 'New', category: 'Cookware', location: 'Malang', seller: 'BasecampStore', rating: 5.0 },
  { id: '6', title: 'Jaket Eiger Aquaproof M', price: 'Rp 380.000', condition: 'Like New', category: 'Jaket', location: 'Bandung', seller: 'RainHunter', rating: 4.6 },
];

const CATEGORIES = ['Semua', 'Tenda', 'Carrier', 'Sleeping Bag', 'Jaket', 'Sepatu', 'Cookware', 'Lampu', 'Lainnya'];
const SORT_OPTIONS = ['Terbaru', 'Harga Terendah', 'Harga Tertinggi'];

const getConditionColor = (c: string) => {
  switch (c) {
    case 'New': return Colors.success;
    case 'Like New': return Colors.secondary;
    case 'Good': return Colors.warning;
    default: return Colors.textSecondary;
  }
};

const MarketplaceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sort, setSort] = useState(0);
  const [isListView, setIsListView] = useState(true);

  const filteredItems = GEAR_ITEMS.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    return matchSearch && matchCategory;
  }).sort((a, b) => {
    if (sort === 1) return parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, ''));
    if (sort === 2) return parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, ''));
    return 0;
  });

  const renderListCard = ({ item }: { item: typeof GEAR_ITEMS[0] }) => (
    <Card
      onPress={() => navigation.navigate('GearDetail', { item })}
      style={styles.listCard}
    >
      <View style={styles.listImage}>
        <Icon name="backpack" size={32} color="rgba(255,255,255,0.7)" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
        <View style={styles.itemMeta}>
          <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(item.condition) + '1A' }]}>
            <Text style={[styles.conditionText, { color: getConditionColor(item.condition) }]}>{item.condition}</Text>
          </View>
          <View style={styles.locationRow}>
            <Icon name="location-on" size={13} color={Colors.textTertiary} />
            <Text style={styles.itemLocation}>{item.location}</Text>
          </View>
        </View>
        <View style={styles.sellerRow}>
          <Avatar name={item.seller} size={20} />
          <Text style={styles.sellerName}>{item.seller}</Text>
          <View style={styles.ratingRow}>
            <Icon name="star" size={13} color={Colors.warning} />
            <Text style={styles.sellerRating}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderGridCard = ({ item }: { item: typeof GEAR_ITEMS[0] }) => (
    <Card
      onPress={() => navigation.navigate('GearDetail', { item })}
      padded={false}
      style={styles.gridCard}
    >
      <View style={styles.gridImage}>
        <Icon name="backpack" size={36} color="rgba(255,255,255,0.7)" />
      </View>
      <View style={styles.gridBody}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
        <View style={styles.gridMetaRow}>
          <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(item.condition) + '1A' }]}>
            <Text style={[styles.conditionText, { color: getConditionColor(item.condition) }]}>{item.condition}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Icon name="star" size={12} color={Colors.warning} />
            <Text style={styles.sellerRating}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari gear outdoor..."
          style={styles.searchBar}
        />
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setIsListView(!isListView)}
          activeOpacity={0.7}
        >
          <Icon name={isListView ? 'view-module' : 'view-list'} size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContent}
        style={styles.chipScroll}
      >
        {CATEGORIES.map(cat => (
          <Chip
            key={cat}
            label={cat}
            active={selectedCategory === cat}
            onPress={() => setSelectedCategory(cat)}
          />
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        <Text style={styles.resultCount}>{filteredItems.length} hasil</Text>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setSort((sort + 1) % SORT_OPTIONS.length)}
          activeOpacity={0.7}
        >
          <Icon name="sort" size={16} color={Colors.textSecondary} />
          <Text style={styles.sortText}>{SORT_OPTIONS[sort]}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={isListView ? renderListCard : renderGridCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={isListView ? 1 : 2}
        key={isListView ? 'list' : 'grid'}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={isListView ? undefined : styles.gridRow}
        ListEmptyComponent={
          <EmptyState
            title="Gear tidak ditemukan"
            message="Coba ubah kata kunci atau kategori pencarian."
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateListing')}
        activeOpacity={0.85}
      >
        <Icon name="add" size={26} color={Colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    alignItems: 'center',
  },
  searchBar: { flex: 1 },
  viewToggle: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  chipScroll: { flexGrow: 0, marginTop: Spacing.md },
  chipContent: { paddingHorizontal: Spacing.screenPadding, gap: Spacing.sm, paddingRight: Spacing.lg },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  resultCount: { ...Typography.caption, color: Colors.textSecondary },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '600' },
  listContent: { paddingHorizontal: Spacing.screenPadding, paddingBottom: 96 },
  gridRow: { gap: Spacing.sm },
  listCard: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  gridCard: { width: (width - Spacing.screenPadding * 2 - Spacing.sm) / 2, marginBottom: Spacing.sm },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridImage: {
    width: '100%',
    height: 110,
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
    backgroundColor: Colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBody: { padding: Spacing.sm },
  cardContent: { flex: 1 },
  itemTitle: { ...Typography.subtitle2, color: Colors.text, fontWeight: '700' },
  itemPrice: { ...Typography.subtitle1, color: Colors.primary, fontWeight: '800', marginVertical: 2 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  conditionBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.xs },
  conditionText: { fontSize: 11, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  itemLocation: { ...Typography.caption, color: Colors.textSecondary },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sellerName: { ...Typography.caption, color: Colors.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 'auto' },
  sellerRating: { ...Typography.caption, color: Colors.warning, fontWeight: '700' },
  gridMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.screenPadding,
    backgroundColor: Colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
});

export default MarketplaceScreen;
