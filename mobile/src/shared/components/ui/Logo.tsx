import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '../../../config/theme';

// Bundled raster logos (sumber: color.svg / white.svg di root mobile/).
// Svg asli berisi PNG base64, jadi dipakai via Image agar tajam di RN.
const LOGO_COLOR = require('../../../assets/logo-color.svg');
const LOGO_WHITE = require('../../../assets/logo-white.svg');

interface LogoProps {
  variant?: 'color' | 'white' | 'mono';
  size?: number;
  showWordmark?: boolean;
  wordmarkColor?: string;
}

/**
 * Logo Jejak — shadcn-style lockup.
 * variant color = di atas terang, white = di atas gelap, mono = vector fallback.
 */
const Logo: React.FC<LogoProps> = ({
  variant = 'color',
  size = 44,
  showWordmark = true,
  wordmarkColor,
}) => {
  if (variant === 'mono') {
    return (
      <View style={styles.row}>
        <View style={[styles.mark, { width: size, height: size, borderRadius: size * 0.28, backgroundColor: Colors.primary }]}>
          <Text style={[styles.markGlyph, { fontSize: size * 0.52 }]}>▲</Text>
        </View>
        {showWordmark && (
          <Text style={[styles.wordmark, { color: wordmarkColor ?? Colors.text }]}>Jejak</Text>
        )}
      </View>
    );
  }
  return (
    <View style={styles.row}>
      <Image
        source={variant === 'white' ? LOGO_WHITE : LOGO_COLOR}
        style={{ width: size, height: size, borderRadius: size * 0.24 }}
        resizeMode="cover"
      />
      {showWordmark && (
        <Text style={[styles.wordmark, { color: wordmarkColor ?? (variant === 'white' ? '#FFFFFF' : Colors.text) }]}>
          Jejak
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { alignItems: 'center', justifyContent: 'center' },
  markGlyph: { color: '#fff', fontWeight: '800', marginTop: -2 },
  wordmark: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
});

export default Logo;
