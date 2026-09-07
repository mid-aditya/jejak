import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import { Button } from '../../shared/components/ui';

const CATEGORIES = ['Info Jalur', 'Gear Review', 'Trip Report', 'Q&A Ranger', 'Tips & Trick', 'Jual Beli'];

const CreateThreadScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isValid = title.trim().length >= 10 && content.trim().length >= 20 && category !== '';

  const handlePost = () => {
    if (!isValid) return;
    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Berhasil',
        'Thread berhasil diposting!',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Category */}
          <Text style={styles.label}>Kategori</Text>
          <View style={styles.categoryWrap}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.categoryText, category === cat && styles.categoryTextActive]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title */}
          <Text style={styles.label}>Judul Thread</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Minimal 10 karakter..."
            placeholderTextColor={Colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>

          {/* Content */}
          <Text style={styles.label}>Isi Thread</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Tulis isi thread di sini... Minimal 20 karakter."
            placeholderTextColor={Colors.textTertiary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{content.length} karakter</Text>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Icon name="lightbulb" size={18} color={Colors.warning} />
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Tips Thread Menarik</Text>
              <Text style={styles.tipsText}>
                • Gunakan judul yang spesifik dan jelas{'\n'}
                • Tambahkan foto jika memungkinkan{'\n'}
                • Pilih kategori yang tepat{'\n'}
                • Posting berdasarkan pengalaman pribadi
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Posting Thread"
            onPress={handlePost}
            loading={submitting}
            disabled={!isValid}
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: Spacing.screenPadding, paddingBottom: Spacing.xl },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: { ...Typography.body2, color: Colors.textSecondary, fontWeight: '600' },
  categoryTextActive: { color: Colors.textInverse },
  titleInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  contentInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 15,
    color: Colors.text,
    minHeight: 200,
    lineHeight: 22,
  },
  charCount: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 4,
  },
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.warningFaded,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  tipsContent: { flex: 1 },
  tipsTitle: { ...Typography.subtitle2, color: Colors.warning, fontWeight: '800', marginBottom: 4 },
  tipsText: { ...Typography.caption, color: Colors.text, lineHeight: 20 },
  footer: {
    padding: Spacing.screenPadding,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
});

export default CreateThreadScreen;
