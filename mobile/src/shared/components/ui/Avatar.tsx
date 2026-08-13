import React from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Typography } from '../../../config/theme';

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Circular avatar: image if provided, otherwise initials on a tinted circle. */
const Avatar: React.FC<AvatarProps> = ({ name, uri, size = 48, style }) => {
  const initial = (name || '').trim().charAt(0).toUpperCase() || '?';
  const circle = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={[styles.wrapper, circle, style]}>
      {uri ? (
        <Image source={{ uri }} style={[styles.image, circle]} />
      ) : (
        <View style={[styles.placeholder, circle]}>
          <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    backgroundColor: Colors.primaryFaded,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '800',
  },
});

export default Avatar;
