import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import { Card, Avatar } from '../../shared/components/ui';

const ThreadDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { thread } = route.params;
  const [reply, setReply] = useState('');
  const [likes, setLikes] = useState(42);
  const [liked, setLiked] = useState(false);

  const replies = [
    { id: '1', author: 'AndiPendaki', avatar: null, content: 'Terima kasih info-nya! Jadi siap-siap dari sekarang.', time: '1 jam lalu', likes: 5 },
    { id: '2', author: 'Ranger Sari', avatar: null, content: 'Hati-hati di sektor 3 ya, tanahnya masih labil. Gunakan footwear yang grippy.', time: '45 menit lalu', likes: 12, isRanger: true },
    { id: '3', author: 'Hikersatu', avatar: null, content: 'Berangkat dari kapan? Biar bisa koordinasi.', time: '30 menit lalu', likes: 2 },
    { id: '4', author: 'ClimberBaru', avatar: null, content: 'Boleh gabung? First time ke Gede nih.', time: '15 menit lalu', likes: 0 },
  ];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Author */}
        <View style={styles.threadHeader}>
          <View style={styles.authorRow}>
            <Avatar name={thread.author} size={40} />
            <View>
              <Text style={styles.authorName}>{thread.author}</Text>
              <Text style={styles.threadTime}>2 jam lalu · {thread.category}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.reportBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="flag" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.threadTitle}>{thread.title}</Text>
        <Text style={styles.threadBody}>
          Halo pendaki sekalian!{'\n\n'}Setelah longsor yang terjadi bulan lalu di sektor 2 jalur Cibodas, berikut update terbaru:{'\n\n'}1. Jalur sudah dibersihkan dan dinyatakan aman oleh Tim Ranger{'\n'}2. Beberapa titik masih berlumpur, siapkan footwear yang tepat{'\n'}3. Pos 3 dipindahkan 200 meter ke arah timur{'\n'}4. Check-in basecamp wajib dilakukan sebelum pukul 09.00{'\n\n'}Semoga membantu dan tetap safe semua! 🌿
        </Text>

        <Image source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500' }} style={styles.threadImage} />

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => { setLiked(!liked); setLikes(liked ? likes - 1 : likes + 1); }}
            activeOpacity={0.7}
          >
            <Icon name={liked ? 'thumb-up' : 'thumb-up-outlined'} size={20} color={liked ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.actionText, liked && styles.actionTextActive]}>{likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <Icon name="share" size={20} color={Colors.textSecondary} />
            <Text style={styles.actionText}>Bagikan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.replyDivider}>
          <Text style={styles.replyCount}>{replies.length} Balasan</Text>
          <View style={styles.divider} />
        </View>

        {replies.map(r => (
          <Card key={r.id} style={styles.replyCard}>
            <View style={styles.replyHeader}>
              <Avatar name={r.author} size={32} />
              <View style={styles.replyInfo}>
                <View style={styles.replyNameRow}>
                  <Text style={styles.replyAuthor}>{r.author}</Text>
                  {r.isRanger && (
                    <View style={styles.rangerBadge}>
                      <Icon name="verified" size={12} color={Colors.textInverse} />
                      <Text style={styles.rangerText}>Ranger</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.replyTime}>{r.time}</Text>
            </View>
            <Text style={styles.replyContent}>{r.content}</Text>
            <View style={styles.replyActions}>
              <TouchableOpacity style={styles.replyAction} activeOpacity={0.7}>
                <Icon name="thumb-up-outlined" size={16} color={Colors.textSecondary} />
                <Text style={styles.replyActionText}>{r.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.replyAction} activeOpacity={0.7}>
                <Icon name="reply" size={16} color={Colors.textSecondary} />
                <Text style={styles.replyActionText}>Balas</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>

      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.attachBtn} activeOpacity={0.7}>
          <Icon name="image" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TextInput
          style={styles.replyInput}
          placeholder="Tulis balasan..."
          value={reply}
          onChangeText={setReply}
          placeholderTextColor={Colors.textTertiary}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !reply && styles.sendBtnDisabled]}
          disabled={!reply}
          activeOpacity={0.8}
        >
          <Icon name="send" size={20} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  threadHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.screenPadding },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  authorName: { ...Typography.subtitle1, color: Colors.text, fontWeight: '800' },
  threadTime: { ...Typography.caption, color: Colors.textSecondary },
  reportBtn: { padding: 4 },
  threadTitle: { ...Typography.h4, color: Colors.text, fontWeight: '800', paddingHorizontal: Spacing.screenPadding, marginBottom: Spacing.sm },
  threadBody: { ...Typography.body1, color: Colors.text, lineHeight: 24, paddingHorizontal: Spacing.screenPadding, marginBottom: Spacing.md },
  threadImage: { width: '100%', height: 220, marginBottom: Spacing.md },
  actionRow: { flexDirection: 'row', paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.sm, gap: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { ...Typography.body2, color: Colors.textSecondary, fontWeight: '600' },
  actionTextActive: { color: Colors.primary },
  replyDivider: { flexDirection: 'row', alignItems: 'center', padding: Spacing.screenPadding, gap: Spacing.md },
  replyCount: { ...Typography.subtitle1, color: Colors.text, fontWeight: '800' },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  replyCard: { marginHorizontal: Spacing.screenPadding, marginBottom: Spacing.sm },
  replyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  replyInfo: { flex: 1 },
  replyNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  replyAuthor: { ...Typography.subtitle2, color: Colors.text, fontWeight: '700' },
  rangerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.xs, gap: 2 },
  rangerText: { fontSize: 10, color: Colors.textInverse, fontWeight: '800' },
  replyTime: { ...Typography.caption, color: Colors.textTertiary, marginLeft: 'auto' },
  replyContent: { ...Typography.body2, color: Colors.text, lineHeight: 20 },
  replyActions: { flexDirection: 'row', marginTop: Spacing.sm, gap: Spacing.lg },
  replyAction: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  replyActionText: { ...Typography.caption, color: Colors.textSecondary },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  attachBtn: { padding: Spacing.sm },
  replyInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  sendBtn: { backgroundColor: Colors.primary, padding: 10, borderRadius: BorderRadius.round, ...Shadows.sm },
  sendBtnDisabled: { backgroundColor: Colors.disabled },
});

export default ThreadDetailScreen;
