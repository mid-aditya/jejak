import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, BorderRadius, Spacing } from '../../../config/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  description?: string;
  icon?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

/** shadcn Input: h-11, radius md, border zinc-200, focus ring emerald. */
const Input: React.FC<InputProps> = ({ label, description, icon, error, secureTextEntry, containerStyle, editable = true, onFocus, onBlur, ...rest }) => {
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  const isSecure = !!secureTextEntry;
  return (
    <View style={styles.group}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.container, focused && styles.focused, !editable && styles.disabled, error ? styles.error : null, containerStyle]}>
        {icon ? <Icon name={icon} size={18} color={error ? Colors.danger : Colors.textTertiary} /> : null}
        <TextInput
          {...rest}
          style={styles.input}
          placeholderTextColor={Colors.textTertiary}
          secureTextEntry={isSecure && hidden}
          editable={editable}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        />
        {isSecure ? (
          <TouchableOpacity onPress={() => setHidden((v) => !v)} hitSlop={8}>
            <Icon name={hidden ? 'visibility' : 'visibility-off'} size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </View>
      {description && !error ? <Text style={styles.desc}>{description}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  group: { gap: 6 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.text },
  desc: { fontSize: 12, color: Colors.textSecondary },
  container: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, height: 46, gap: 8,
  },
  focused: { borderColor: Colors.ring, shadowColor: Colors.ring, shadowOpacity: 0.15, shadowRadius: 4, elevation: 0 },
  disabled: { backgroundColor: Colors.muted, opacity: 0.7 },
  error: { borderColor: Colors.danger },
  input: { flex: 1, fontSize: 14, color: Colors.text, paddingVertical: 0 },
  errorText: { fontSize: 12, color: Colors.danger, fontWeight: '500' },
});

export default Input;
