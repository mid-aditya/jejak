import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing } from '../../../config/theme';
import Card from './Card';

interface StatCardProps {
  value: string;
  label: string;
  icon?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/** Compact metric card (duration, distance, elevation, speed...). */
const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  color = Colors.primary,
  style,
}) => {
  return (
    <Card padded style={[styles.card, style]}>
      {icon ? (
        <View style={[styles.iconCircle, { backgroundColor: `${color}1A` }]}>
          <Icon name={icon} size={18} color={color} />
        </View>
      ) : null}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  value: {
    ...Typography.subtitle1,
    color: Colors.text,
    fontWeight: '800',
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default StatCard;
