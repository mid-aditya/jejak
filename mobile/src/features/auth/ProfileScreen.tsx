import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootState, AppDispatch } from '../../shared/store';
import { updateProfile, type SkillLevel } from '../../shared/store/slices/authSlice';
import LoadingScreen from '../../shared/components/LoadingScreen';
import Badge from '../../shared/components/Badge';
import { Avatar } from '../../shared/components/ui';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    skillLevel: user?.skillLevel || 'beginner',
  });
  const [emergencyContact, setEmergencyContact] = useState({
    id: user?.emergencyContacts?.[0]?.id || '',
    name: user?.emergencyContacts?.[0]?.name || '',
    phone: user?.emergencyContacts?.[0]?.phone || '',
    relationship: user?.emergencyContacts?.[0]?.relationship || '',
  });
  const [medicalInfo, setMedicalInfo] = useState({
    bloodType: user?.medicalInfo?.bloodType || '',
    allergies: (user?.medicalInfo?.allergies || []).join(', '),
    conditions: (user?.medicalInfo?.conditions || []).join(', '),
    medications: (user?.medicalInfo?.medications || []).join(', '),
  });

  const handleSave = async () => {
    // Sensitive fields (medicalInfo, emergencyContacts) are encrypted on the
    // wire by the api-client interceptor.
    dispatch(updateProfile({
      ...profileData,
      medicalInfo: {
        bloodType: medicalInfo.bloodType || undefined,
        allergies: medicalInfo.allergies.split(',').map(s => s.trim()).filter(Boolean),
        conditions: medicalInfo.conditions.split(',').map(s => s.trim()).filter(Boolean),
        medications: medicalInfo.medications.split(',').map(s => s.trim()).filter(Boolean),
      },
      emergencyContacts: [emergencyContact],
    }));
    setIsEditing(false);
    Alert.alert('Sukses', 'Profil berhasil diperbarui');
  };

  const handleAvatarPick = () => {
    Alert.alert('Ganti Foto', 'Pilih sumber foto', [
      { text: 'Kamera', onPress: () => {} },
      { text: 'Galeri', onPress: () => {} },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const skillLevels: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
  const badges = user?.badges || [
    { id: '1', name: 'First Summit', icon: 'terrain' },
    { id: '2', name: 'Safety First', icon: 'verified' },
    { id: '3', name: 'Eco Warrior', icon: 'eco' },
  ];

  const tripHistory = [
    { id: 1, mountain: 'Gunung Gede', date: '2024-03-15', status: 'Selesai', height: 2958 },
    { id: 2, mountain: 'Gunung Rinjani', date: '2023-08-20', status: 'Selesai', height: 3726 },
  ];

  if (isLoading && !user) return <LoadingScreen />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarPick} style={styles.avatarContainer}>
          <Avatar name={user?.fullName || 'User'} uri={user?.avatar} size={96} />
          <View style={styles.cameraIcon}>
            <Icon name="photo-camera" size={16} color={Colors.textInverse} />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user?.fullName || 'Nama Pengguna'}</Text>
        <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
        <View style={styles.badgeWrap}>
          <Badge level={user?.verificationLevel || 1} showLabel />
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Basic info */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Informasi Dasar</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name={isEditing ? 'check' : 'edit'} size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {isEditing ? (
          <>
            <TextInput style={styles.input} value={profileData.fullName} onChangeText={t => setProfileData({ ...profileData, fullName: t })} placeholder="Nama Lengkap" placeholderTextColor={Colors.textTertiary} />
            <TextInput style={[styles.input, styles.multiline]} value={profileData.bio} onChangeText={t => setProfileData({ ...profileData, bio: t })} placeholder="Bio" placeholderTextColor={Colors.textTertiary} multiline />
            <Text style={styles.label}>Skill Level</Text>
            <View style={styles.chipRow}>
              {skillLevels.map(level => (
                <TouchableOpacity
                  key={level}
                  style={[styles.chip, profileData.skillLevel === level && styles.chipActive]}
                  onPress={() => setProfileData({ ...profileData, skillLevel: level })}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, profileData.skillLevel === level && styles.chipTextActive]}>
                    {level[0].toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Bio</Text><Text style={styles.infoValue}>{profileData.bio || '-'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Skill Level</Text><Text style={styles.infoValue}>{profileData.skillLevel[0].toUpperCase() + profileData.skillLevel.slice(1)}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone</Text><Text style={styles.infoValue}>{user?.phone || '-'}</Text></View>
          </>
        )}
      </View>

      {/* Verification */}
      <TouchableOpacity style={styles.section} onPress={() => setShowUpgradeModal(true)} activeOpacity={0.8}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Verifikasi</Text>
          <View style={styles.row}>
            <Text style={styles.verificationLabel}>Level {user?.verificationLevel || 1}</Text>
            <Icon name="chevron-right" size={20} color={Colors.textTertiary} />
          </View>
        </View>
        <Text style={styles.sectionDesc}>Verifikasi untuk meningkatkan kepercayaan</Text>
      </TouchableOpacity>

      {/* Emergency contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kontak Darurat</Text>
        <View style={styles.encryptedBanner}>
          <Icon name="lock" size={16} color={Colors.primary} />
          <Text style={styles.encryptedText}>End-to-end encrypted</Text>
        </View>
        <TextInput style={styles.input} value={emergencyContact.name} onChangeText={t => setEmergencyContact({ ...emergencyContact, name: t })} placeholder="Nama Kontak" placeholderTextColor={Colors.textTertiary} />
        <TextInput style={styles.input} value={emergencyContact.phone} onChangeText={t => setEmergencyContact({ ...emergencyContact, phone: t })} placeholder="Nomor Telepon" placeholderTextColor={Colors.textTertiary} keyboardType="phone-pad" />
        <TextInput style={styles.input} value={emergencyContact.relationship} onChangeText={t => setEmergencyContact({ ...emergencyContact, relationship: t })} placeholder="Hubungan" placeholderTextColor={Colors.textTertiary} />
      </View>

      {/* Medical info */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Info Medis</Text>
          <Switch value={showMedicalModal} onValueChange={setShowMedicalModal} trackColor={{ false: Colors.border, true: Colors.primary }} thumbColor={Colors.surface} />
        </View>
        {showMedicalModal && (
          <View style={styles.encryptedBanner}>
            <Icon name="lock" size={16} color={Colors.primary} />
            <Text style={styles.encryptedText}>End-to-end encrypted</Text>
          </View>
        )}
        {showMedicalModal && (
          <>
            <TextInput style={styles.input} value={medicalInfo.bloodType} onChangeText={t => setMedicalInfo({ ...medicalInfo, bloodType: t })} placeholder="Golongan Darah" placeholderTextColor={Colors.textTertiary} />
            <TextInput style={[styles.input, styles.multiline]} value={medicalInfo.allergies} onChangeText={t => setMedicalInfo({ ...medicalInfo, allergies: t })} placeholder="Alergi" placeholderTextColor={Colors.textTertiary} multiline />
            <TextInput style={[styles.input, styles.multiline]} value={medicalInfo.conditions} onChangeText={t => setMedicalInfo({ ...medicalInfo, conditions: t })} placeholder="Kondisi Kesehatan" placeholderTextColor={Colors.textTertiary} multiline />
            <TextInput style={[styles.input, styles.multiline]} value={medicalInfo.medications} onChangeText={t => setMedicalInfo({ ...medicalInfo, medications: t })} placeholder="Obat yang Dikonsumsi" placeholderTextColor={Colors.textTertiary} multiline />
          </>
        )}
      </View>

      {/* Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lencana</Text>
        <View style={styles.badgeGrid}>
          {badges.map((badge: any) => (
            <View key={badge.id} style={styles.badgeItem}>
              <View style={styles.badgeIconCircle}>
                <Icon name={badge.icon} size={28} color={Colors.primary} />
              </View>
              <Text style={styles.badgeName}>{badge.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Trip history */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Riwayat Pendakian</Text>
        {tripHistory.map(trip => (
          <View key={trip.id} style={styles.tripCard}>
            <View style={styles.tripIconCircle}>
              <Icon name="terrain" size={20} color={Colors.primary} />
            </View>
            <View style={styles.tripInfo}>
              <Text style={styles.tripName}>{trip.mountain}</Text>
              <Text style={styles.tripMeta}>{trip.height}mdpl · {trip.date}</Text>
            </View>
            <View style={styles.tripStatusBadge}>
              <Text style={styles.tripStatus}>{trip.status}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Verification modal */}
      <Modal visible={showUpgradeModal} animationType="slide" transparent onRequestClose={() => setShowUpgradeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tingkatkan Verifikasi</Text>
            {[
              { level: 1, bg: Colors.badgeBronze, desc: 'Email & Phone verified' },
              { level: 2, bg: Colors.badgeSilver, desc: 'KTP & Selfie verification' },
              { level: 3, bg: Colors.badgeGold, desc: 'Guide/Certification verified' },
            ].map((lv) => (
              <View key={lv.level} style={styles.levelRow}>
                <View style={[styles.levelBadge, { backgroundColor: lv.bg }]}>
                  <Text style={styles.levelText}>Lv {lv.level}</Text>
                </View>
                <Text style={styles.levelDesc}>{lv.desc}</Text>
                {user?.verificationLevel && user.verificationLevel >= lv.level && (
                  <Icon name="check-circle" size={20} color={Colors.success} />
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowUpgradeModal(false)} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xl },
  header: {
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  avatarContainer: { position: 'relative', marginBottom: Spacing.md },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 5,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  name: { ...Typography.h4, color: Colors.text, fontWeight: '800', marginBottom: 2 },
  email: { ...Typography.body2, color: Colors.textSecondary, marginBottom: Spacing.sm },
  badgeWrap: { marginTop: 2 },
  settingsBtn: { position: 'absolute', top: Spacing.md, right: Spacing.md, padding: 4 },

  section: {
    backgroundColor: Colors.surface,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { ...Typography.subtitle1, color: Colors.text, fontWeight: '800' },
  sectionDesc: { ...Typography.caption, color: Colors.textSecondary, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verificationLabel: { ...Typography.subtitle2, color: Colors.primary, fontWeight: '700' },

  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.text,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  multiline: { height: 80, textAlignVertical: 'top' },
  label: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primaryFaded,
    marginBottom: Spacing.sm,
  },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  chipTextActive: { color: Colors.textInverse },
  saveBtn: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    marginTop: Spacing.xs,
    ...Shadows.sm,
  },
  saveBtnText: { color: Colors.textInverse, fontWeight: '800', fontSize: 15 },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: { ...Typography.body2, color: Colors.textSecondary },
  infoValue: { ...Typography.body2, color: Colors.text, fontWeight: '600' },

  encryptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryFaded,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  encryptedText: { fontSize: 12, color: Colors.primary, marginLeft: 6, fontWeight: '600' },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  badgeItem: { alignItems: 'center', width: 84 },
  badgeIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeName: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', fontWeight: '600' },

  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  tripIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripInfo: { flex: 1 },
  tripName: { ...Typography.subtitle2, color: Colors.text, fontWeight: '700' },
  tripMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  tripStatusBadge: { backgroundColor: Colors.successFaded, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.xs },
  tripStatus: { fontSize: 11, color: Colors.success, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  modalTitle: { ...Typography.h4, color: Colors.text, fontWeight: '800', marginBottom: Spacing.lg },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  levelText: { color: Colors.textInverse, fontWeight: '800', fontSize: 12 },
  levelDesc: { flex: 1, ...Typography.body2, color: Colors.text },
  closeBtn: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  closeBtnText: { color: Colors.textInverse, fontWeight: '800', fontSize: 15 },
});

export default ProfileScreen;
