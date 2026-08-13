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
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../../../config/theme';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'danger'
  | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  { bg: string; text: string; border?: string }
> = {
  primary: { bg: Colors.primary, text: Colors.textInverse },
  secondary: { bg: Colors.primaryFaded, text: Colors.primaryDark },
  outline: { bg: 'transparent', text: Colors.primary, border: Colors.primary },
  danger: { bg: Colors.danger, text: Colors.textInverse },
  ghost: { bg: 'transparent', text: Colors.primary },
};

const SIZE_STYLES: Record<
  ButtonSize,
  { height: number; paddingHorizontal: number; fontSize: number; radius: number }
> = {
  sm: { height: 36, paddingHorizontal: Spacing.md, fontSize: 13, radius: BorderRadius.sm },
  md: { height: 48, paddingHorizontal: Spacing.lg, fontSize: 15, radius: BorderRadius.md },
  lg: { height: 54, paddingHorizontal: Spacing.xl, fontSize: 16, radius: BorderRadius.md },
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
}) => {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        {
          backgroundColor: variantStyle.bg,
          borderColor: variantStyle.border ?? 'transparent',
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderRadius: sizeStyle.radius,
          opacity: isDisabled ? 0.5 : 1,
        },
        variant === 'outline' && styles.outlineBorder,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text} />
      ) : (
        <>
          {icon && <Icon name={icon} size={sizeStyle.fontSize + 2} color={variantStyle.text} />}
          <Text
            style={[
              styles.text,
              {
                color: variantStyle.text,
                fontSize: sizeStyle.fontSize,
              },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: Spacing.sm,
  },
  outlineBorder: {
    borderWidth: 1.5,
  },
  text: {
    ...Typography.button,
    fontWeight: '700',
  },
});

export default Button;
