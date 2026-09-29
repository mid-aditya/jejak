import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, BorderRadius, Spacing } from '../../../config/theme';

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'danger' | 'primary';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// shadcn/ui button port: solid zinc-900 / emerald, outline hairline, ghost.
const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border: string }> = {
  default: { bg: '#09090B', text: '#FAFAF9', border: '#09090B' },
  primary: { bg: Colors.primary, text: '#FFFFFF', border: Colors.primary },
  secondary: { bg: Colors.secondaryFaded, text: Colors.text, border: 'transparent' },
  outline: { bg: 'transparent', text: Colors.text, border: Colors.border },
  ghost: { bg: 'transparent', text: Colors.text, border: 'transparent' },
  destructive: { bg: Colors.danger, text: '#FFFFFF', border: Colors.danger },
  danger: { bg: Colors.danger, text: '#FFFFFF', border: Colors.danger },
};

const SIZE_STYLES: Record<ButtonSize, { height: number; px: number; fontSize: number }> = {
  sm: { height: 36, px: 12, fontSize: 13 },
  md: { height: 44, px: 16, fontSize: 14 },
  lg: { height: 52, px: 20, fontSize: 15 },
  icon: { height: 44, px: 0, fontSize: 16 },
};

const Button: React.FC<ButtonProps> = ({
  title, onPress, variant = 'primary', size = 'md',
  icon, loading = false, disabled = false, style, testID,
}) => {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      style={[styles.base, { backgroundColor: v.bg, borderColor: v.border, height: s.height, paddingHorizontal: s.px, opacity: isDisabled ? 0.5 : 1 }, style]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon && <Icon name={icon} size={s.fontSize + 4} color={v.text} />}
          <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderRadius: BorderRadius.md, gap: Spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 2, elevation: 1,
  },
  text: { fontWeight: '600', letterSpacing: 0.1 },
});

export default Button;
