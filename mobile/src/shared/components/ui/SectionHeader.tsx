import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing } from '../../../config/theme';

interface SectionHeaderProps {
  title: string;
  eyebrow?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Consistent section heading: optional eyebrow, title, and trailing action. */
const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  eyebrow,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={styles.action}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Icon name="chevron-right" size={18} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  titleBlock: {
    flex: 1,
  },
  eyebrow: {
    ...Typography.overline,
    color: Colors.primary,
    marginBottom: 2,
  },
  title: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: '700',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    ...Typography.subtitle2,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default SectionHeader;
