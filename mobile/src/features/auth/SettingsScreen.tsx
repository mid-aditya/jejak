import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppDispatch, useAppSelector } from '../../shared/store';
import { logoutUser } from '../../shared/store/slices/authSlice';
import { Colors, Typography, Spacing, BorderRadius } from '../../config/theme';
import { Avatar, Button } from '../../shared/components/ui';
import type { RootStackScreenProps } from '../../navigation/types';

type Props = RootStackScreenProps<'Settings'>;

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((s) => s.auth);

  const handleLogout = useCallback(() => {
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => dispatch(logoutUser()),
      },
    ]);
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Manual header (root stack has headerShown: false) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pengaturan</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile summary */}
        <View style={styles.profileCard}>
          <Avatar name={user?.fullName || 'Pendaki'} uri={user?.avatar} size={56} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.fullName || 'Nama Pengguna'}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          </View>
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>Akun</Text>
        <View style={styles.list}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Main', { screen: 'Profile' })} activeOpacity={0.7}>
            <Icon name="person" size={20} color={Colors.primary} />
            <Text style={styles.rowLabel}>Profil Saya</Text>
            <Icon name="chevron-right" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('VerifyIdentity')} activeOpacity={0.7}>
            <Icon name="verified-user" size={20} color={Colors.info} />
            <Text style={styles.rowLabel}>Verifikasi Identitas</Text>
            <Icon name="chevron-right" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('OfflineMapManager')} activeOpacity={0.7}>
            <Icon name="offline-pin" size={20} color={Colors.warning} />
            <Text style={styles.rowLabel}>Peta Offline</Text>
            <Icon name="chevron-right" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>Tentang</Text>
        <View style={styles.list}>
          <View style={styles.row}>
            <Icon name="info" size={20} color={Colors.textSecondary} />
            <Text style={styles.rowLabel}>Versi Aplikasi</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>

        <Button
          title="Keluar"
          variant="danger"
          size="lg"
          icon="logout"
          loading={isLoading}
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
        <Text style={styles.footnote}>Jejak · Pendakian Gunung Indonesia</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: { padding: 4, width: 32 },
  headerTitle: { ...Typography.subtitle1, color: Colors.text, fontWeight: '700' },
  content: { padding: Spacing.screenPadding, paddingBottom: Spacing.xxl },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  profileInfo: { flex: 1 },
  profileName: { ...Typography.subtitle1, color: Colors.text, fontWeight: '700' },
  profileEmail: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: {
    ...Typography.subtitle2,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  list: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  rowLabel: { flex: 1, ...Typography.body2, color: Colors.text },
  rowValue: { ...Typography.caption, color: Colors.textSecondary },
  logoutBtn: { marginTop: Spacing.xl },
  footnote: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});

export default SettingsScreen;
