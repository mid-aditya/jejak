import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '../../../config/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Inner padding. Defaults to true. */
  padded?: boolean;
  /** Stronger shadow for floating elements. */
  elevated?: boolean;
}

/**
 * The single card primitive used across the app: white surface, hairline
 * border, soft shadow. `onPress` turns it into a pressable row.
 */
const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  padded = true,
  elevated = false,
}) => {
  const cardStyle = [
    styles.base,
    padded && styles.padded,
    elevated ? styles.elevated : styles.flat,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
  },
  padded: {
    padding: Spacing.cardPadding,
  },
  flat: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  elevated: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.md,
  },
});

export default Card;
