import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, BorderRadius } from '../../config/theme';
import { Chip, Button } from '../../shared/components/ui';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const CATEGORIES = ['Tenda', 'Carrier', 'Sleeping Bag', 'Jaket', 'Sepatu', 'Cookware', 'Lampu', 'Aksesoris', 'Lainnya'];

const CreateListingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const isValid = title.length >= 5 && description.length >= 20 && price && condition && category && agreeTerms;

  const handleAddImage = () => {
    if (images.length >= 5) { Alert.alert('Maksimal 5 foto'); return; }
    Alert.alert('Tambah Foto', 'Pilih sumber foto', [
      { text: 'Kamera', onPress: () => setImages([...images, 'camera']) },
      { text: 'Galeri', onPress: () => setImages([...images, 'gallery']) },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const handleSubmit = () => {
    if (!isValid) return;
    Alert.alert('✅ Listing Dibuat', 'Item Anda akan ditinjau dalam 24 jam.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Buat Iklan Baru</Text>

      <Text style={styles.label}>Foto ({images.length}/5)</Text>
      <View style={styles.imageGrid}>
        {images.map((_, i) => (
          <View key={i} style={styles.imageSlot}>
            <Icon name="image" size={24} color={Colors.textTertiary} />
          </View>
        ))}
        {images.length < 5 && (
          <TouchableOpacity style={styles.addSlot} onPress={handleAddImage} activeOpacity={0.7}>
            <Icon name="add-a-photo" size={24} color={Colors.textSecondary} />
            <Text style={styles.addSlotText}>Tambah Foto</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.label}>Judul</Text>
      <TextInput
        style={styles.input}
        placeholder="Contoh: Carrier Eiger Trail 45L - Like New"
        placeholderTextColor={Colors.textTertiary}
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />
      <Text style={styles.charCount}>{title.length}/100</Text>

      <Text style={styles.label}>Deskripsi</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Jelaskan kondisi, ukuran, defect, dll"
        placeholderTextColor={Colors.textTertiary}
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={1000}
      />
      <Text style={styles.charCount}>{description.length}/1000</Text>

      <Text style={styles.label}>Harga (Rp)</Text>
      <View style={styles.priceRow}>
        <Text style={styles.pricePrefix}>Rp</Text>
        <TextInput
          style={styles.priceInput}
          placeholder="850.000"
          placeholderTextColor={Colors.textTertiary}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.label}>Kondisi</Text>
      <View style={styles.chipRow}>
        {CONDITIONS.map(c => (
          <Chip key={c} label={c} active={condition === c} onPress={() => setCondition(c)} />
        ))}
      </View>

      <Text style={styles.label}>Kategori</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map(c => (
          <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
        ))}
      </View>

      <Text style={styles.label}>Lokasi</Text>
      <TextInput
        style={styles.input}
        placeholder="Kota Anda (auto dari profil)"
        placeholderTextColor={Colors.textTertiary}
        value={location}
        onChangeText={setLocation}
      />

      <View style={styles.termsRow}>
        <Switch
          value={agreeTerms}
          onValueChange={setAgreeTerms}
          trackColor={{ true: Colors.primary }}
          thumbColor={Colors.surface}
        />
        <Text style={styles.termsText}>
          Saya setuju dengan <Text style={styles.termsLink}>Syarat & Ketentuan</Text> jual beli, termasuk penggunaan
          sistem escrow untuk keamanan transaksi.
        </Text>
      </View>

      <Button title="Buat Iklan" size="lg" disabled={!isValid} onPress={handleSubmit} style={styles.submitBtn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.screenPadding, paddingBottom: 40 },
  pageTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  label: { ...Typography.subtitle2, color: Colors.text, fontWeight: '700', marginBottom: Spacing.sm, marginTop: Spacing.md },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  imageSlot: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSlot: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSlotText: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  multiline: { height: 100, textAlignVertical: 'top' },
  charCount: { ...Typography.caption, color: Colors.textTertiary, textAlign: 'right', marginTop: 2 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingLeft: Spacing.md,
  },
  pricePrefix: { ...Typography.subtitle2, color: Colors.text, fontWeight: '700' },
  priceInput: { flex: 1, height: 44, fontSize: 14, color: Colors.text },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xs },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: Spacing.lg, marginBottom: Spacing.sm, gap: Spacing.sm },
  termsText: { flex: 1, ...Typography.caption, color: Colors.textSecondary, lineHeight: 18 },
  termsLink: { color: Colors.primary, fontWeight: '600' },
  submitBtn: { marginTop: Spacing.xs },
});

export default CreateListingScreen;
