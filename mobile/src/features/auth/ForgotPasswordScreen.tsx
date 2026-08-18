import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing, BorderRadius } from '../../config/theme';
import { Input, Button } from '../../shared/components/ui';
import { apiClient } from '../../shared/services/api-client';
import { validateEmail } from '../../shared/utils/validators';
import type { AuthScreenProps } from '../../navigation/types';

type Props = AuthScreenProps<'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(async () => {
    const result = validateEmail(email);
    if (!result.isValid) {
      setEmailError(result.message);
      return;
    }
    setEmailError('');
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { emailOrPhone: email });
      setSent(true);
    } catch (err: any) {
      Alert.alert(
        'Gagal',
        err?.response?.data?.message ||
          err?.message ||
          'Terjadi kesalahan. Coba lagi nanti.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {sent ? (
          <>
            <View style={styles.iconWrap}>
              <Icon name="checkmark-circle-outline" size={48} color={Colors.success} />
            </View>
            <Text style={styles.title}>Link Dikirim</Text>
            <Text style={styles.subtitle}>
              Jika akun dengan email tersebut terdaftar, kami sudah mengirim
              link reset password. Cek inbox (atau spam) Anda.
            </Text>
            <Button
              title="Kembali ke Login"
              size="lg"
              onPress={() => navigation.navigate('Login')}
              style={styles.action}
            />
          </>
        ) : (
          <>
            <View style={styles.iconWrap}>
              <Icon name="key-outline" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Lupa Password</Text>
            <Text style={styles.subtitle}>
              Masukkan email yang terdaftar. Kami akan kirim link untuk
              mengatur ulang password Anda.
            </Text>

            <View style={styles.form}>
              <Input
                label="Email"
                icon="mail-outline"
                error={emailError || undefined}
                placeholder="nama@email.com"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (emailError) setEmailError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                editable={!isLoading}
              />
            </View>

            <Button
              title="Kirim Link Reset"
              size="lg"
              loading={isLoading}
              onPress={handleSubmit}
              style={styles.action}
            />
            <Button
              title="Kembali ke Login"
              variant="ghost"
              onPress={() => navigation.navigate('Login')}
            />
          </>
        )}
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
  form: { marginTop: Spacing.xl },
  action: { marginTop: Spacing.xl, marginBottom: Spacing.sm },
});

export default ForgotPasswordScreen;
