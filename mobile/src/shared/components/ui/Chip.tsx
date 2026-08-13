import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, BorderRadius } from '../../../config/theme';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: string;
}

/** Pill-shaped filter chip; filled when active. */
const Chip: React.FC<ChipProps> = ({ label, active = false, onPress, icon }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.base, active && styles.active]}
    >
      {icon && (
        <Icon
          name={icon}
          size={14}
          color={active ? Colors.textInverse : Colors.textSecondary}
        />
      )}
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  active: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  label: {
    ...Typography.subtitle2,
    color: Colors.text,
    fontWeight: '600',
  },
  labelActive: {
    color: Colors.textInverse,
  },
});

export default Chip;
