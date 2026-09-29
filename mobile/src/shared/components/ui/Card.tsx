import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, StyleProp, Text } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../../../config/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  elevated?: boolean;
}

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={cardSub.header}>{children}</View>
);
export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={cardSub.title}>{children}</Text>
);
export const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={cardSub.desc}>{children}</Text>
);
export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={cardSub.content}>{children}</View>
);
export const CardFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={cardSub.footer}>{children}</View>
);

/** shadcn Card: bg-card, border hairline, radius lg, shadow halus. */
const Card: React.FC<CardProps> = ({ children, onPress, style, padded = true, elevated = false }) => {
  const cardStyle = [styles.base, padded && styles.padded, elevated && styles.elevated, style];
  if (onPress) {
    return <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={cardStyle}>{children}</TouchableOpacity>;
  }
  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  padded: { padding: Spacing.md },
  elevated: {
    shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
});

const cardSub = StyleSheet.create({
  header: { gap: 4, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '600', color: Colors.text, letterSpacing: -0.2 },
  desc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  content: { gap: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
});

export default Card;
