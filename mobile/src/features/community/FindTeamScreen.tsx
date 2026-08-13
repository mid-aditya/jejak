import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import { Card, SearchBar, Chip, Button, Avatar, EmptyState } from '../../shared/components/ui';

const TEAMS = [
  { id: '1', host: 'Fitri Hiker', title: 'Open Trip Gede 15-16 Mar', mountain: 'Gunung Gede', date: '15-16 Mar 2024', members: 4, maxMembers: 8, price: 'Rp 350K', level: 'Intermediate', desc: 'Trip santai lewat jalur Cibodas. Include porter & konsumsi.', isJoined: false },
  { id: '2', host: 'Rinjani Pro', title: 'Rinjani Summit via Senaru', mountain: 'Gunung Rinjani', date: '22-25 Mar 2024', members: 6, maxMembers: 6, price: 'Rp 1.2jt', level: 'Advanced', desc: 'Full service termasuk guide expert, sudah full capacity.', isJoined: true },
  { id: '3', host: 'Sahabat Alam', title: 'Merbabu Sunrise via Selo', mountain: 'Gunung Merbabu', date: '10-11 Mar 2024', members: 3, maxMembers: 10, price: 'Rp 250K', level: 'Pemula', desc: 'Cocok untuk pemula. Include sarapan & dokumentasi.', isJoined: false },
  { id: '4', host: 'Summit Club', title: 'Semeru 3 Hari 2 Malam', mountain: 'Gunung Semeru', date: '5-7 Apr 2024', members: 8, maxMembers: 12, price: 'Rp 800K', level: 'Expert', desc: 'Rute Ranupane. Wajib pengalaman minimal Rinjani.', isJoined: false },
  { id: '5', host: 'Basecamp Gede', title: 'Weekend Escape Gede', mountain: 'Gunung Gede', date: '17-18 Mar 2024', members: 5, maxMembers: 10, price: 'Rp 285K', level: 'Intermediate', desc: 'Include camping gear, tent, sleeping bag.', isJoined: false },
];

const MOUNTAINS = ['Semua Gunung', 'Gunung Gede', 'Gunung Rinjani', 'Gunung Semeru', 'Gunung Merbabu', 'Gunung Merapi'];
const LEVELS = ['Semua Level', 'Pemula', 'Intermediate', 'Advanced', 'Expert'];

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Pemula': return { bg: Colors.successFaded, fg: Colors.success };
    case 'Intermediate': return { bg: Colors.warningFaded, fg: Colors.warning };
    default: return { bg: Colors.dangerFaded, fg: Colors.danger };
  }
};

const FindTeamScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ mountain: 'Semua Gunung', level: 'Semua Level', minBudget: '', maxBudget: '' });

  const filteredTeams = TEAMS.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.mountain.toLowerCase().includes(search.toLowerCase());
    const matchMountain = filters.mountain === 'Semua Gunung' || t.mountain === filters.mountain;
    const matchLevel = filters.level === 'Semua Level' || t.level === filters.level;
    return matchSearch && matchMountain && matchLevel;
  });

  const renderTeam = ({ item }: { item: typeof TEAMS[0] }) => {
    const levelColor = getLevelColor(item.level);
    return (
      <Card style={styles.teamCard}>
        <View style={styles.cardHeader}>
          <Avatar name={item.host} size={36} />
          <View style={styles.hostInfo}>
            <Text style={styles.hostName}>{item.host}</Text>
            <Text style={styles.teamDate}>{item.date}</Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: levelColor.bg }]}>
            <Text style={[styles.levelText, { color: levelColor.fg }]}>{item.level}</Text>
          </View>
        </View>
        <Text style={styles.teamTitle}>{item.title}</Text>
        <View style={styles.teamMeta}>
          <View style={styles.metaItem}>
            <Icon name="terrain" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{item.mountain}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="people" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{item.members}/{item.maxMembers}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="attach-money" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{item.price}</Text>
          </View>
        </View>
        <Text style={styles.teamDesc} numberOfLines={2}>{item.desc}</Text>
        {item.isJoined ? (
          <Button
            title="Chat Group"
            icon="chat"
            onPress={() => navigation.navigate('Chat', { team: item })}
          />
        ) : (
          <View style={styles.actionRow}>
            <Button title="Request Join" style={styles.joinBtn} />
            <Button title="Detail" variant="outline" style={styles.detailBtn} />
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari tim atau gunung..."
          style={styles.searchBar}
        />
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(true)} activeOpacity={0.7}>
          <Icon name="filter-list" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTeams}
        renderItem={renderTeam}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="Tim tidak ditemukan"
            message="Coba ubah pencarian atau filter."
          />
        }
      />

      <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Pencarian</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>Gunung</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
              {MOUNTAINS.map(m => (
                <Chip
                  key={m}
                  label={m}
                  active={filters.mountain === m}
                  onPress={() => setFilters({ ...filters, mountain: m })}
                />
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Level</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
              {LEVELS.map(l => (
                <Chip
                  key={l}
                  label={l}
                  active={filters.level === l}
                  onPress={() => setFilters({ ...filters, level: l })}
                />
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Budget</Text>
            <View style={styles.budgetRow}>
              <TextInput
                style={styles.budgetInput}
                placeholder="Min"
                placeholderTextColor={Colors.textTertiary}
                value={filters.minBudget}
                onChangeText={t => setFilters({ ...filters, minBudget: t })}
                keyboardType="numeric"
              />
              <Text style={styles.budgetSep}>-</Text>
              <TextInput
                style={styles.budgetInput}
                placeholder="Max"
                placeholderTextColor={Colors.textTertiary}
                value={filters.maxBudget}
                onChangeText={t => setFilters({ ...filters, maxBudget: t })}
                keyboardType="numeric"
              />
            </View>

            <Button title="Terapkan Filter" size="lg" onPress={() => setShowFilters(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: { flexDirection: 'row', padding: Spacing.screenPadding, gap: Spacing.sm },
  searchBar: { flex: 1 },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  listContent: { paddingHorizontal: Spacing.screenPadding, paddingBottom: Spacing.xl },
  teamCard: { marginBottom: Spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  hostInfo: { flex: 1 },
  hostName: { ...Typography.subtitle2, color: Colors.text, fontWeight: '700' },
  teamDate: { ...Typography.caption, color: Colors.textSecondary },
  levelBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.round },
  levelText: { fontSize: 11, fontWeight: '700' },
  teamTitle: { ...Typography.subtitle1, color: Colors.text, fontWeight: '800', marginBottom: Spacing.sm },
  teamMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xs },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { ...Typography.caption, color: Colors.textSecondary },
  teamDesc: { ...Typography.body2, color: Colors.textSecondary, lineHeight: 18, marginBottom: Spacing.md },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },
  joinBtn: { flex: 1 },
  detailBtn: { flex: 1 },

  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  modalTitle: { ...Typography.h4, color: Colors.text, fontWeight: '800' },
  filterLabel: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '700', marginBottom: Spacing.sm, marginTop: Spacing.md },
  filterChipRow: { gap: Spacing.sm, paddingRight: Spacing.lg },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  budgetInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.text,
  },
  budgetSep: { fontSize: 16, color: Colors.textSecondary },
});

export default FindTeamScreen;
