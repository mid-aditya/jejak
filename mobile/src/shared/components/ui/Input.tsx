import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, BorderRadius } from '../../../config/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  /** MaterialIcons name rendered on the left of the field. */
  icon?: string;
  /** Validation message shown below the field. */
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * The shared form input: optional label + leading icon, error state, and an
 * automatic visibility toggle for password fields (`secureTextEntry`).
 * All other TextInput props (including `testID`) are forwarded.
 */
const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  secureTextEntry,
  containerStyle,
  editable = true,
  ...rest
}) => {
  const [hidden, setHidden] = useState(true);
  const isSecure = !!secureTextEntry;

  return (
    <View style={styles.group}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.container,
          !editable && styles.containerDisabled,
          error ? styles.containerError : null,
          containerStyle,
        ]}
      >
        {icon ? (
          <Icon
            name={icon}
            size={20}
            color={error ? Colors.danger : Colors.textTertiary}
            style={styles.icon}
          />
        ) : null}
        <TextInput
          {...rest}
          style={styles.input}
          placeholderTextColor={Colors.textTertiary}
          secureTextEntry={isSecure && hidden}
          editable={editable}
        />
        {isSecure ? (
          <TouchableOpacity
            onPress={() => setHidden((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Tampilkan password' : 'Sembunyikan password'}
          >
            <Icon
              name={hidden ? 'visibility' : 'visibility-off'}
              size={20}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  group: { gap: 6 },
  label: { ...Typography.subtitle2, color: Colors.text, fontWeight: '600' },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 52,
    gap: Spacing.sm,
  },
  containerDisabled: { backgroundColor: Colors.borderLight },
  containerError: { borderColor: Colors.danger },
  icon: { marginRight: Spacing.xs },
  input: { flex: 1, ...Typography.body1, color: Colors.text, paddingVertical: 0 },
  errorText: { ...Typography.caption, color: Colors.danger },
});

export default Input;
