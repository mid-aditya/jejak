import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppDispatch, useAppSelector } from '../../shared/store';
import { loginUser, socialLogin } from '../../shared/store/slices/authSlice';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import { featureFlags } from '../../config/env';
import { validateEmail, validatePassword } from '../../shared/utils/validators';
import ErrorMessage from '../../shared/components/ErrorMessage';
import { Input, Button } from '../../shared/components/ui';
import type { AuthScreenProps } from '../../navigation/types';

type Props = AuthScreenProps<'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    if (emailError) setEmailError('');
  }, [emailError]);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  }, [passwordError]);

  const validate = useCallback((): boolean => {
    const emailResult = validateEmail(email);
    const passwordResult = validatePassword(password);
    setEmailError(emailResult.isValid ? '' : emailResult.message);
    setPasswordError(passwordResult.isValid ? '' : passwordResult.message);
    return emailResult.isValid && passwordResult.isValid;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    if (!validate()) return;

    try {
      await dispatch(loginUser({ email, password })).unwrap();
    } catch (err: any) {
      Alert.alert('Login Gagal', err || 'Terjadi kesalahan saat login');
    }
  }, [dispatch, email, password, validate]);

  const handleGoogleLogin = useCallback(async () => {
    try {
      // In production, integrate with react-native-google-signin
      // This opens a browser for OAuth authorization
      Alert.alert(
        'Login dengan Google',
        'Login Google akan terbuka di browser untuk otorisasi.',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Lanjutkan',
            onPress: async () => {
              try {
                // Placeholder - replace with actual Google OAuth token
                await dispatch(socialLogin({ provider: 'google', token: 'placeholder' })).unwrap();
              } catch (err: any) {
                Alert.alert('Login Gagal', err || 'Gagal login dengan Google');
              }
            },
          },
        ],
      );
    } catch (err: any) {
      Alert.alert('Login Gagal', err || 'Gagal login dengan Google');
    }
  }, [dispatch]);

  const isFormValid = useMemo(
    () => email.length > 0 && password.length > 0,
    [email, password],
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🏔️</Text>
            <Text style={styles.title}>Jejak</Text>
            <Text style={styles.subtitle}>Masuk ke akun Anda</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              testID="login-email"
              label="Email"
              icon="mail-outline"
              error={emailError || undefined}
              placeholder="nama@email.com"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Input
              testID="login-password"
              label="Password"
              icon="lock"
              error={passwordError || undefined}
              placeholder="Password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              returnKeyType="done"
            />

            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() => navigation.navigate('ForgotPassword', { email })}
            >
              <Text style={styles.forgotText}>Lupa password?</Text>
            </TouchableOpacity>

            {error ? <ErrorMessage message={error} variant="card" /> : null}

            <Button
              testID="login-submit"
              title="Masuk"
              onPress={handleLogin}
              loading={isLoading}
              disabled={!isFormValid}
              size="lg"
              style={styles.submitButton}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            activeOpacity={0.7}
          >
            <Icon name="logo-google" size={20} color={Colors.text} />
            <Text style={styles.googleText}>Masuk dengan Google</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Daftar sekarang</Text>
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
  header: { alignItems: 'center', marginTop: Spacing.xl, marginBottom: Spacing.xxl },
  logo: { fontSize: 56, marginBottom: Spacing.md },
  title: { ...Typography.h1, color: Colors.primary, fontWeight: '800' },
  subtitle: { ...Typography.body2, color: Colors.textSecondary, marginTop: Spacing.xs },
  form: { gap: Spacing.md },
  submitButton: { marginTop: Spacing.sm },
  forgotLink: { alignItems: 'flex-end', marginTop: -Spacing.xs },
  forgotText: { ...Typography.body2, color: Colors.primary, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { ...Typography.caption, color: Colors.textTertiary, marginHorizontal: Spacing.md },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    height: 52,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  googleText: { ...Typography.button, color: Colors.text, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl, marginBottom: Spacing.lg },
  footerText: { ...Typography.body2, color: Colors.textSecondary },
  footerLink: { ...Typography.body2, color: Colors.primary, fontWeight: '700' },
});

export default LoginScreen;
