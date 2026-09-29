import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, BorderRadius } from '../../../config/theme';

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
}

const V: Record<BadgeVariant, { bg: string; fg: string; border: string }> = {
  default: { bg: '#09090B', fg: '#FAFAF9', border: '#09090B' },
  secondary: { bg: Colors.secondaryFaded, fg: Colors.text, border: 'transparent' },
  outline: { bg: 'transparent', fg: Colors.text, border: Colors.border },
  success: { bg: Colors.successFaded, fg: Colors.success, border: 'transparent' },
  warning: { bg: Colors.warningFaded, fg: Colors.warning, border: 'transparent' },
  destructive: { bg: Colors.dangerFaded, fg: Colors.danger, border: 'transparent' },
};

/** shadcn Badge pill. */
const Badge: React.FC<BadgeProps> = ({ children, variant = 'secondary', style }) => {
  const c = V[variant];
  return (
    <View style={[styles.base, { backgroundColor: c.bg, borderColor: c.border }, style]}>
      <Text style={[styles.text, { color: c.fg }]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.round, borderWidth: 1 },
  text: { fontSize: 11, fontWeight: '600' },
});

export default Badge;
