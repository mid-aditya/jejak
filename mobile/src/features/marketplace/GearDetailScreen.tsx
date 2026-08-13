import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import { Card, Chip, Button, Avatar } from '../../shared/components/ui';

const { width } = Dimensions.get('window');

const GearDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { item } = route.params;
  const [selectedImage, setSelectedImage] = useState(0);

  const images = [1, 2, 3, 4];
  const reviews = [
    { user: 'Andi K.', rating: 5, comment: 'Sangat puas dengan kualitasnya. Seperti baru!', date: '10 Feb 2024' },
    { user: 'Lisa M.', rating: 4, comment: 'Good condition, pengiriman cepat.', date: '5 Jan 2024' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageGallery}>
          <View style={styles.mainImage} />
          <View style={styles.imageIndicators}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, i === selectedImage && styles.dotActive]} />
            ))}
          </View>
        </View>

        <View style={styles.details}>
          <Text style={styles.price}>{item.price}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.badges}>
            <Chip label={item.condition} icon="verified-user" />
            <Text style={styles.category}>{item.category}</Text>
          </View>

          <Card style={styles.sellerCard}>
            <Avatar name={item.seller} size={44} />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{item.seller}</Text>
              <Text style={styles.sellerMeta}>⭐ {item.rating} · Terjual 23 · Bandung</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Icon name="verified" size={14} color={Colors.textInverse} />
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.description}>
            Gear dalam kondisi sangat terawat. Hanya dipakai 3 kali untuk pendakian ringan. Tidak ada kerusakan atau
            cacat. Semua zipper berfungsi normal. Include rainfly original.{'\n\n'}Bisa COD Bandung/Jakarta atau kirim
            via JNE/SiCepat. Warranty 7 hari jika ada masalah.
          </Text>

          <View style={styles.locationRow}>
            <Icon name="location-on" size={16} color={Colors.textSecondary} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>

        <View style={styles.reviews}>
          <Text style={styles.sectionTitle}>Review Transaksi ({reviews.length})</Text>
          {reviews.map((r, i) => (
            <Card key={i} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Avatar name={r.user} size={32} />
                <View>
                  <Text style={styles.reviewUser}>{r.user}</Text>
                  <Text style={styles.reviewDate}>{r.date}</Text>
                </View>
                <View style={styles.ratingPill}>
                  <Icon name="star" size={13} color={Colors.warning} />
                  <Text style={styles.reviewRating}>{r.rating}</Text>
                </View>
              </View>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title="Chat Seller"
          variant="outline"
          icon="chat"
          style={styles.chatBtn}
          onPress={() => {}}
        />
        <Button
          title="Beli dengan Escrow"
          icon="shopping-cart"
          style={styles.buyBtn}
          onPress={() => {}}
        />
      </View>

      <TouchableOpacity style={styles.reportLink} activeOpacity={0.7}>
        <Icon name="flag" size={14} color={Colors.textTertiary} />
        <Text style={styles.reportText}>Laporkan Iklan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 140 },
  imageGallery: { height: 320, backgroundColor: Colors.border, position: 'relative' },
  mainImage: { width, height: 320, backgroundColor: Colors.borderLight },
  imageIndicators: {
    position: 'absolute',
    bottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: Colors.textInverse, width: 20 },
  details: { padding: Spacing.md },
  price: { ...Typography.h2, color: Colors.primary, fontWeight: '800' },
  title: { ...Typography.subtitle1, color: Colors.text, fontWeight: '700', marginTop: 4, marginBottom: Spacing.sm },
  badges: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  category: { ...Typography.caption, color: Colors.textSecondary },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  sellerInfo: { flex: 1 },
  sellerName: { ...Typography.subtitle2, color: Colors.text, fontWeight: '700' },
  sellerMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  verifiedBadge: { backgroundColor: Colors.primary, padding: 6, borderRadius: BorderRadius.round },
  sectionTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  description: { ...Typography.body2, color: Colors.text, lineHeight: 22 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, gap: 4 },
  locationText: { ...Typography.caption, color: Colors.textSecondary },
  reviews: { padding: Spacing.md, borderTopWidth: 8, borderTopColor: Colors.borderLight },
  reviewCard: { marginBottom: Spacing.sm, ...Shadows.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 6 },
  reviewUser: { ...Typography.subtitle2, color: Colors.text, fontWeight: '600' },
  reviewDate: { ...Typography.caption, color: Colors.textTertiary, marginTop: 1 },
  ratingPill: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.warningFaded, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.round },
  reviewRating: { ...Typography.caption, color: Colors.warning, fontWeight: '700' },
  reviewComment: { ...Typography.body2, color: Colors.text, lineHeight: 20 },
  bottomBar: { flexDirection: 'row', padding: Spacing.md, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.borderLight, gap: Spacing.sm },
  chatBtn: { flex: 1 },
  buyBtn: { flex: 2 },
  reportLink: { position: 'absolute', bottom: 100, right: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 4 },
  reportText: { ...Typography.caption, color: Colors.textTertiary },
});

export default GearDetailScreen;
