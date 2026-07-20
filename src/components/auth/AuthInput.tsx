import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { BRAND } from '../../config';
import { useKeyboardScroll } from '../KeyboardAwareScroll';

type Props = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (t: string) => void;
  secure?: boolean;
  showToggle?: boolean;
  onToggle?: () => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoComplete?: 'email' | 'password' | 'name' | 'tel' | 'password-new' | 'off';
  placeholder?: string;
  style?: ViewStyle;
};

export default function AuthInput({
  label,
  icon,
  value,
  onChangeText,
  secure,
  showToggle,
  onToggle,
  keyboardType = 'default',
  autoComplete,
  placeholder,
  style,
}: Props) {
  const [focused, setFocused] = useState(false);
  const keyboardScroll = useKeyboardScroll();

  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputShell}>
        <Ionicons
          name={icon}
          size={18}
          color={focused ? BRAND.primary : BRAND.muted}
          style={styles.icon}
        />
        <TextInput
          style={[
            styles.input,
            focused && styles.inputFocused,
            showToggle && styles.inputWithEye,
          ]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          autoCapitalize={
            keyboardType === 'email-address' || keyboardType === 'phone-pad' ? 'none' : 'sentences'
          }
          autoCorrect={false}
          autoComplete={autoComplete}
          keyboardType={keyboardType}
          placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
          placeholderTextColor="#9CA3AF"
          onFocus={(e) => {
            setFocused(true);
            keyboardScroll?.scrollToFocusedInput(e.nativeEvent.target);
          }}
          onBlur={() => setFocused(false)}
        />
        {showToggle && (
          <Pressable onPress={onToggle} hitSlop={12} style={styles.eyeBtn}>
            <Ionicons
              name={secure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={BRAND.muted}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND.ink,
    marginBottom: 8,
  },
  inputShell: {
    position: 'relative',
    justifyContent: 'center',
  },
  icon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingLeft: 48,
    paddingRight: 18,
    paddingVertical: Platform.OS === 'ios' ? 15 : 13,
    fontSize: 15,
    fontWeight: '500',
    color: BRAND.ink,
  },
  inputWithEye: {
    paddingRight: 48,
  },
  inputFocused: {
    borderColor: BRAND.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: BRAND.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});
