import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing, BorderRadius } from '../../config/theme';
import { Button } from '../../shared/components/ui';
import type { AuthScreenProps } from '../../navigation/types';

type Props = AuthScreenProps<'VerifyEmail'>;

/**
 * Post-registration confirmation screen. The OTP endpoint requires a logged-in
 * session, so this screen explains the email link flow instead of collecting a
 * code pre-login.
 */
const VerifyEmailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params ?? {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrap}>
          <Icon name="mail-open-outline" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Cek Email Anda</Text>
        <Text style={styles.subtitle}>
          Kami sudah mengirim link verifikasi ke{' '}
          <Text style={styles.email}>{email || 'email Anda'}</Text>. Klik link
          tersebut untuk mengaktifkan akun, lalu kembali untuk masuk.
        </Text>

        <View style={styles.noteCard}>
          <Icon name="information-circle-outline" size={18} color={Colors.info} />
          <Text style={styles.noteText}>
            Tidak menerima email? Periksa folder spam, atau pastikan alamat
            email sudah benar.
          </Text>
        </View>

        <Button
          title="Kembali ke Login"
          size="lg"
          onPress={() => navigation.navigate('Login')}
          style={styles.action}
        />
        <Button
          title="Daftar Ulang"
          variant="ghost"
          onPress={() => navigation.navigate('Register')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    flexGrow: 1,
    padding: Spacing.screenPadding,
    justifyContent: 'center',
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 24,
  },
  email: { color: Colors.primary, fontWeight: '700' },
  noteCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.infoFaded,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    ...Typography.body2,
    color: Colors.text,
    lineHeight: 20,
  },
  action: { marginTop: Spacing.xl, marginBottom: Spacing.sm },
});

export default VerifyEmailScreen;
