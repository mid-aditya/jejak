import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import { Card, SearchBar, Chip, EmptyState, Avatar } from '../../shared/components/ui';

const CATEGORIES = ['Semua', 'Info Jalur', 'Gear Review', 'Trip Report', 'Q&A Ranger'];

const FORUM_THREADS = [
  { id: '1', title: 'Info Terbaru Jalur Cibodas setelah Longsor', author: 'Ranger Budi', category: 'Info Jalur', replies: 23, lastActivity: '2 jam lalu', isPinned: true, preview: 'Halo pendaki, setelah longsor bulan lalu...' },
  { id: '2', title: 'Review Carrier Eiger 45L setelah 5 Pendakian', author: 'DewiPendaki', category: 'Gear Review', replies: 15, lastActivity: '4 jam lalu', isPinned: false, preview: 'Setelah 5 kali bawa carrier ini...' },
  { id: '3', title: 'Trip Report: Rinjani Summit via Torean', author: 'AlexMerbabu', category: 'Trip Report', replies: 31, lastActivity: '1 hari lalu', isPinned: false, preview: 'Rinjani via Torean lebih sepi tapi tantangan...' },
  { id: '4', title: 'Tips First Aid untuk Hipotermia Ringan', author: 'Ranger Sari', category: 'Q&A Ranger', replies: 19, lastActivity: '3 jam lalu', isPinned: true, preview: 'Musim hujan sudah tiba, banyak pendaki...' },
  { id: '5', title: 'Rekomendasi Sleeping Bag untuk Semeru', author: 'PemulaJuga', category: 'Q&A Ranger', replies: 8, lastActivity: '6 jam lalu', isPinned: false, preview: 'Mau naik Semeru bulan depan, sleeping bag...' },
  { id: '6', title: 'Jalur Alternatif Gunung Merbabu via Thekelan', author: 'JogjaHiker', category: 'Info Jalur', replies: 12, lastActivity: '8 jam lalu', isPinned: false, preview: 'Thekelan lebih landai dibanding Selo...' },
  { id: '7', title: 'Review Sepatu Hiking Salomon XA Pro 3D', author: 'GearHead', category: 'Gear Review', replies: 9, lastActivity: '1 hari lalu', isPinned: false, preview: 'Setelah 2 tahun pemakaian, sepatu ini...' },
  { id: '8', title: 'Trip Report: Sunrise di Gunung Prau', author: 'SunriseHunter', category: 'Trip Report', replies: 20, lastActivity: '2 hari lalu', isPinned: false, preview: 'Prau adalah gunung favorit untuk sunrise...' },
];

const ForumScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const filteredThreads = FORUM_THREADS.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'Semua' || t.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const renderThread = ({ item }: { item: typeof FORUM_THREADS[0] }) => (
    <Card
      onPress={() => navigation.navigate('ThreadDetail', { thread: item })}
      style={styles.threadCard}
    >
      {item.isPinned && (
        <View style={styles.pinnedBadge}>
          <Icon name="push-pin" size={12} color={Colors.textInverse} />
          <Text style={styles.pinnedText}>PINNED</Text>
        </View>
      )}
      <Text style={styles.threadTitle}>{item.title}</Text>
      <Text style={styles.threadPreview} numberOfLines={2}>{item.preview}</Text>
      <View style={styles.threadMeta}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.authorText}>{item.author}</Text>
        <View style={styles.metaRight}>
          <Icon name="chat-bubble-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.replyCount}>{item.replies}</Text>
          <Text style={styles.activityText}>{item.lastActivity}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari forum..."
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContent}
        style={styles.categoryScroll}
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

      <FlatList
        data={filteredThreads}
        renderItem={renderThread}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="Tidak ada thread"
            message="Coba kata kunci atau kategori lain."
          />
        }
      />

      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Icon name="add" size={26} color={Colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchWrap: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
  },
  categoryScroll: { flexGrow: 0, marginTop: Spacing.md },
  categoryContent: { paddingHorizontal: Spacing.screenPadding, gap: Spacing.sm, paddingRight: Spacing.lg },
  listContent: { paddingHorizontal: Spacing.screenPadding, paddingBottom: 96 },
  threadCard: { marginBottom: Spacing.sm },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    gap: 4,
    marginBottom: Spacing.sm,
  },
  pinnedText: { fontSize: 10, color: Colors.textInverse, fontWeight: '800', letterSpacing: 0.5 },
  threadTitle: { ...Typography.subtitle1, color: Colors.text, fontWeight: '800', marginBottom: 4 },
  threadPreview: { ...Typography.body2, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.sm },
  threadMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.sm },
  categoryBadge: { backgroundColor: Colors.primaryFaded, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.xs },
  categoryText: { fontSize: 11, color: Colors.primaryDark, fontWeight: '700' },
  authorText: { ...Typography.caption, color: Colors.textSecondary },
  metaRight: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', gap: 4 },
  replyCount: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '700' },
  activityText: { ...Typography.caption, color: Colors.textTertiary },
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

export default ForumScreen;
