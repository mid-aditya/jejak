import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppDispatch } from '../../shared/store';
import { registerUser } from '../../shared/store/slices/authSlice';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import {
  validateEmail, validatePhone, validatePassword, validateConfirmPassword,
  validateFullName, validateRequired,
} from '../../shared/utils/validators';
import ErrorMessage from '../../shared/components/ErrorMessage';
import { Input, Button } from '../../shared/components/ui';
import type { AuthScreenProps } from '../../navigation/types';

type Props = AuthScreenProps<'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }, [errors]);

  const validateAll = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const nameResult = validateFullName(form.fullName);
    if (!nameResult.isValid) newErrors.fullName = nameResult.message;

    const emailResult = validateEmail(form.email);
    if (!emailResult.isValid) newErrors.email = emailResult.message;

    const phoneResult = validatePhone(form.phone);
    if (!phoneResult.isValid) newErrors.phone = phoneResult.message;

    const passwordResult = validatePassword(form.password);
    if (!passwordResult.isValid) newErrors.password = passwordResult.message;

    const confirmResult = validateConfirmPassword(form.password, form.confirmPassword);
    if (!confirmResult.isValid) newErrors.confirmPassword = confirmResult.message;

    if (!agreeTerms) newErrors.terms = 'Anda harus menyetujui syarat dan ketentuan';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, agreeTerms]);

  const handleRegister = useCallback(async () => {
    if (!validateAll()) return;

    setIsLoading(true);
    setError('');

    try {
      await dispatch(registerUser({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      })).unwrap();

      Alert.alert(
        'Berhasil',
        'Akun berhasil dibuat! Silakan verifikasi email Anda.',
        [{ text: 'OK' }],
      );
    } catch (err: any) {
      setError(err || 'Pendaftaran gagal');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, form, validateAll]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Daftar Akun</Text>
            <Text style={styles.subtitle}>Bergabung dengan komunitas pendaki Indonesia</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name */}
            <Input
              label="Nama Lengkap"
              icon="person-outline"
              error={errors.fullName || undefined}
              placeholder="Nama lengkap Anda"
              value={form.fullName}
              onChangeText={(v) => handleChange('fullName', v)}
              autoCapitalize="words"
              returnKeyType="next"
            />

            {/* Email */}
            <Input
              label="Email"
              icon="mail-outline"
              error={errors.email || undefined}
              placeholder="nama@email.com"
              value={form.email}
              onChangeText={(v) => handleChange('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            {/* Phone */}
            <Input
              label="No. Telepon (WhatsApp)"
              icon="call"
              error={errors.phone || undefined}
              placeholder="08xxxxxxxxxx"
              value={form.phone}
              onChangeText={(v) => handleChange('phone', v)}
              keyboardType="phone-pad"
              returnKeyType="next"
            />

            {/* Password */}
            <Input
              label="Password"
              icon="lock"
              error={errors.password || undefined}
              placeholder="Min. 8 karakter, huruf besar, angka"
              value={form.password}
              onChangeText={(v) => handleChange('password', v)}
              secureTextEntry
              returnKeyType="next"
            />

            {/* Confirm Password */}
            <Input
              label="Konfirmasi Password"
              icon="lock"
              error={errors.confirmPassword || undefined}
              placeholder="Ketik ulang password"
              value={form.confirmPassword}
              onChangeText={(v) => handleChange('confirmPassword', v)}
              secureTextEntry
              returnKeyType="done"
            />

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => {
                setAgreeTerms(!agreeTerms);
                if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
              }}
            >
              <View style={[styles.checkboxBox, agreeTerms && styles.checkboxChecked]}>
                {agreeTerms && <Icon name="checkmark" size={12} color={Colors.textInverse} />}
              </View>
              <Text style={styles.termsText}>
                Saya setuju dengan{' '}
                <Text style={styles.termsLink}>Syarat & Ketentuan</Text> dan{' '}
                <Text style={styles.termsLink}>Kebijakan Privasi</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

            {/* Error */}
            {error ? <ErrorMessage message={error} variant="card" /> : null}

            {/* Register Button */}
            <Button
              title="Daftar"
              onPress={handleRegister}
              loading={isLoading}
              size="lg"
              style={styles.submitButton}
            />
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Masuk</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: Spacing.screenPadding },
  header: { marginVertical: Spacing.lg },
  title: { ...Typography.h2, color: Colors.text },
  subtitle: { ...Typography.body2, color: Colors.textSecondary, marginTop: Spacing.xs },
  form: { gap: Spacing.md },
  submitButton: { marginTop: Spacing.sm },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  checkboxBox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  errorText: { ...Typography.caption, color: Colors.danger, marginTop: 2 },
  termsText: { flex: 1, ...Typography.body2, color: Colors.textSecondary, lineHeight: 20 },
  termsLink: { color: Colors.primary, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl, marginBottom: Spacing.lg },
  footerText: { ...Typography.body2, color: Colors.textSecondary },
  footerLink: { ...Typography.body2, color: Colors.primary, fontWeight: '700' },
});

export default RegisterScreen;
