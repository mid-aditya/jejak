import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { apiClient } from '../../shared/services/api-client';
import { Colors, Typography, Spacing, BorderRadius } from '../../config/theme';
import { Button } from '../../shared/components/ui';
import type { AuthScreenProps } from '../../navigation/types';

type Props = AuthScreenProps<'VerifyEmail'>;

const VerifyEmailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params ?? {};
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = useCallback(async () => {
    if (!email) return;

    setIsResending(true);
    try {
      await apiClient.post('/auth/resend-confirmation', { email });
      setResent(true);
    } catch (err: any) {
      Alert.alert(
        'Gagal',
        err?.response?.data?.message || err?.message || 'Tidak dapat mengirim ulang email',
      );
    } finally {
      setIsResending(false);
    }
  }, [email]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrap}>
          <Icon name="mail-unread-outline" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Verifikasi Email</Text>
        <Text style={styles.subtitle}>
          Kami telah mengirim link verifikasi ke{' '}
          <Text style={styles.email}>{email || 'email Anda'}</Text>.
          {'\n'}Klik link tersebut untuk mengaktifkan akun.
        </Text>

        <View style={styles.noteCard}>
          <Icon name="information-circle-outline" size={18} color={Colors.info} />
          <Text style={styles.noteText}>
            Tidak menemukan email? Periksa folder spam. Link berlaku selama 24 jam.
          </Text>
        </View>

        {resent && (
          <View style={styles.successCard}>
            <Icon name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.successText}>
              Email verifikasi telah dikirim ulang!
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title={resent ? 'Kirim Ulang Lagi' : 'Kirim Ulang Email'}
            variant="outline"
            onPress={handleResend}
            loading={isResending}
            disabled={isResending}
            style={styles.actionBtn}
          />
          <Button
            title="Masuk"
            size="lg"
            onPress={() => navigation.navigate('Login')}
            style={styles.actionBtn}
          />
          <Button
            title="Daftar Ulang"
            variant="ghost"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
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
  successCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.successFaded,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  successText: {
    flex: 1,
    ...Typography.body2,
    color: Colors.success,
    fontWeight: '600',
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  actionBtn: { marginBottom: 0 },
});

export default VerifyEmailScreen;
