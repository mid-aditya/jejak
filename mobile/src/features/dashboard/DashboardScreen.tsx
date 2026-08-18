import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState } from '../../shared/store';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import { Card, SectionHeader, Avatar, Chip } from '../../shared/components/ui';

const QUICK_ACTIONS = [
  { id: '1', label: 'SOS', icon: 'warning', color: Colors.danger, bg: Colors.dangerFaded, route: 'Emergency' },
  { id: '2', label: 'Check In', icon: 'login', color: Colors.warning, bg: Colors.warningFaded, route: 'CheckInOut' },
  { id: '3', label: 'Cari Tim', icon: 'group', color: Colors.primary, bg: Colors.primaryFaded, route: 'FindTeam' },
  { id: '4', label: 'Forum', icon: 'forum', color: Colors.info, bg: Colors.infoFaded, route: 'Community' },
  { id: '5', label: 'Map', icon: 'map', color: Colors.secondary, bg: Colors.secondaryFaded, route: 'Maps' },
  { id: '6', label: 'Market', icon: 'store', color: Colors.accent, bg: Colors.accentFaded, route: 'Marketplace' },
];

const RECOMMENDATIONS = [
  { id: '1', name: 'Gunung Merbabu', match: '95%', reason: 'Level Intermediate, budget pas, cuaca cerah', difficulty: 5 },
  { id: '2', name: 'Gunung Prau', match: '88%', reason: 'Sunrise view terbaik, cocok pemula', difficulty: 3 },
  { id: '3', name: 'Gunung Lawu', match: '82%', reason: 'Jalur landai, banyak air, trek sepi', difficulty: 4 },
];

const RECENT_POSTS = [
  { id: '1', title: 'Info Terbaru Jalur Cibodas', author: 'Ranger Budi', category: 'Info Jalur' },
  { id: '2', title: 'Review Carrier Eiger 45L', author: 'DewiPendaki', category: 'Gear Review' },
];

const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [hasActiveTrip] = useState(true);
  const [weatherAlert] = useState<{ type: 'red' | 'yellow' | 'green'; msg: string }>({
    type: 'yellow',
    msg: 'Kabut tebal terpantau di Gede-Pangrango. Hati-hati.',
  });

  const weatherColors = {
    red: { bg: Colors.dangerFaded, fg: Colors.danger },
    yellow: { bg: Colors.warningFaded, fg: Colors.warning },
    green: { bg: Colors.successFaded, fg: Colors.success },
  }[weatherAlert.type];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar
          name={user?.fullName || 'Pendaki'}
          uri={user?.avatar}
          size={48}
        />
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>
            Hai, {user?.fullName?.split(' ')[0] || 'Pendaki'}!
          </Text>
          <Text style={styles.greetingSub}>Siap berpetualang hari ini?</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="account-circle" size={28} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Active trip */}
      {hasActiveTrip && (
        <Card
          style={styles.activeTripCard}
          onPress={() => navigation.navigate('GPSTracker')}
          padded={false}
        >
          <View style={styles.tripHeader}>
            <View style={styles.tripTitleRow}>
              <Icon name="terrain" size={20} color={Colors.textInverse} />
              <Text style={styles.tripTitle}>Pendakian Aktif</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.tripMountain}>Gunung Gede - Cibodas</Text>
          <View style={styles.tripProgress}>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.tripProgressText}>3.2/8.5 km · 2j 15m</Text>
          </View>
          <View style={styles.tripActions}>
            <TouchableOpacity style={styles.tripActionBtn}>
              <Icon name="pause" size={16} color={Colors.textInverse} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tripActionBtn}>
              <Icon name="flag" size={16} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Weather banner */}
      {weatherAlert && (
        <View style={[styles.weatherBanner, { backgroundColor: weatherColors.bg }]}>
          <Icon name="warning" size={20} color={weatherColors.fg} />
          <Text style={[styles.weatherText, { color: weatherColors.fg }]}>
            {weatherAlert.msg}
          </Text>
        </View>
      )}

      {/* Quick actions */}
      <View style={styles.section}>
        <SectionHeader title="Aksi Cepat" />
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
                <Icon name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <SectionHeader
          title="Rekomendasi"
          eyebrow="AI MATCH"
          actionLabel="Lihat semua"
          onAction={() => navigation.navigate('Maps')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendScroll}
        >
          {RECOMMENDATIONS.map(rec => (
            <TouchableOpacity
              key={rec.id}
              style={styles.recommendCard}
              onPress={() => navigation.navigate('MountainDetail', { mountain: rec })}
              activeOpacity={0.8}
            >
              <View style={styles.recommendImage}>
                <Icon name="landscape" size={40} color="rgba(255,255,255,0.7)" />
              </View>
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{rec.match} match</Text>
              </View>
              <View style={styles.recommendBody}>
                <Text style={styles.recommendName}>{rec.name}</Text>
                <View style={styles.difficultyRow}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <View
                      key={i}
                      style={[
                        styles.difficultyDot,
                        { backgroundColor: i <= rec.difficulty ? Colors.primary : Colors.border },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.recommendReason} numberOfLines={2}>
                  {rec.reason}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Forum posts */}
      <View style={styles.section}>
        <SectionHeader
          title="Forum Terbaru"
          actionLabel="Lihat semua"
          onAction={() => navigation.navigate('Community')}
        />
        <Card padded={false} style={styles.postsCard}>
          <FlatList
            data={RECENT_POSTS}
            keyExtractor={i => i.id}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[styles.postRow, index > 0 && styles.postRowBorder]}
                onPress={() => navigation.navigate('ThreadDetail', { thread: item })}
                activeOpacity={0.7}
              >
                <Avatar name={item.author} size={36} />
                <View style={styles.postInfo}>
                  <Text style={styles.postTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.postMeta}>
                    {item.author} · {item.category}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          />
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  greeting: { flex: 1, marginLeft: Spacing.md },
  greetingTitle: { ...Typography.subtitle1, color: Colors.text, fontWeight: '800' },
  greetingSub: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  profileBtn: { padding: 4 },

  activeTripCard: {
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
    padding: Spacing.md,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  tripTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  tripTitle: { color: Colors.textInverse, fontWeight: '700', fontSize: 15 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.successLight },
  liveText: { color: Colors.textInverse, fontWeight: '700', fontSize: 10, letterSpacing: 1 },
  tripMountain: { color: Colors.textInverse, fontSize: 16, fontWeight: '700', marginTop: 2 },
  tripProgress: { marginTop: Spacing.sm, gap: 4 },
  progressTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
  progressFill: { width: '40%', height: '100%', backgroundColor: Colors.textInverse, borderRadius: 2 },
  tripProgressText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  tripActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  tripActionBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.sm,
  },

  weatherBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  weatherText: { flex: 1, fontSize: 13, fontWeight: '600' },

  section: { marginTop: Spacing.lg, paddingHorizontal: Spacing.screenPadding },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  actionCard: { width: '33.33%', alignItems: 'center', paddingVertical: Spacing.sm },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: { ...Typography.caption, color: Colors.text, fontWeight: '600' },

  recommendScroll: { paddingRight: Spacing.md, gap: Spacing.md },
  recommendCard: {
    width: 200,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  recommendImage: {
    height: 96,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
  },
  matchText: { color: Colors.textInverse, fontSize: 11, fontWeight: '700' },
  recommendBody: { padding: Spacing.md },
  recommendName: { ...Typography.subtitle2, color: Colors.text, fontWeight: '800' },
  difficultyRow: { flexDirection: 'row', gap: 3, marginTop: 6 },
  difficultyDot: { width: 14, height: 4, borderRadius: 2 },
  recommendReason: { ...Typography.caption, color: Colors.textSecondary, marginTop: 6, lineHeight: 16 },

  postsCard: { overflow: 'hidden' },
  postRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  postRowBorder: { borderTopWidth: 1, borderTopColor: Colors.borderLight },
  postInfo: { flex: 1 },
  postTitle: { ...Typography.subtitle2, color: Colors.text, fontWeight: '700' },
  postMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
});

export default DashboardScreen;
