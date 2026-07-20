import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { useKeyboardScroll } from './KeyboardAwareScroll';

/** TextInput that auto-scrolls parent KeyboardAwareScroll on focus */
export default function KeyboardTextInput(props: TextInputProps) {
  const ctx = useKeyboardScroll();
  const { onFocus, ...rest } = props;

  return (
    <TextInput
      {...rest}
      onFocus={(e) => {
        onFocus?.(e);
        ctx?.scrollToFocusedInput(e.nativeEvent.target);
      }}
    />
  );
}
