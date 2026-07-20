import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type KeyboardScrollContextValue = {
  scrollToFocusedInput: (nativeTarget: number) => void;
};

const KeyboardScrollContext = createContext<KeyboardScrollContextValue | null>(null);

export function useKeyboardScroll() {
  return useContext(KeyboardScrollContext);
}

/** Attach to TextInput onFocus when not using AuthInput / KeyboardTextInput */
export function useInputFocusScroll() {
  const ctx = useKeyboardScroll();
  return useCallback(
    (nativeTarget: number) => {
      ctx?.scrollToFocusedInput(nativeTarget);
    },
    [ctx],
  );
}

type Props = ScrollViewProps & {
  containerStyle?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
  /** Extra space above keyboard when scrolling to focused input */
  extraScrollOffset?: number;
};

export default function KeyboardAwareScroll({
  children,
  containerStyle,
  contentContainerStyle,
  keyboardVerticalOffset,
  extraScrollOffset = 72,
  onScroll,
  ...scrollProps
}: Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const scrollBeforeKeyboard = useRef(0);
  const [keyboardExtraPadding, setKeyboardExtraPadding] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      scrollBeforeKeyboard.current = scrollYRef.current;
      setKeyboardExtraPadding(Math.max(0, e.endCoordinates.height - insets.bottom - 24));
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardExtraPadding(0);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: scrollBeforeKeyboard.current, animated: true });
      });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [insets.bottom]);

  const scrollToFocusedInput = useCallback(
    (nativeTarget: number) => {
      const scroll = scrollRef.current;
      if (!scroll || !nativeTarget) return;

      const delay = Platform.OS === 'android' ? 100 : 50;
      setTimeout(() => {
        scroll.scrollResponderScrollNativeHandleToKeyboard?.(
          nativeTarget,
          extraScrollOffset,
          true,
        );
      }, delay);
    },
    [extraScrollOffset],
  );

  const offset = keyboardVerticalOffset ?? insets.top + 8;

  const mergedContentStyle = contentContainerStyle;

  const scrollView = (
    <ScrollView
      ref={scrollRef}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      nestedScrollEnabled
      onScroll={(e) => {
        scrollYRef.current = e.nativeEvent.contentOffset.y;
        onScroll?.(e);
      }}
      scrollEventThrottle={16}
      contentContainerStyle={mergedContentStyle}
      {...scrollProps}
    >
      {children}
      {keyboardExtraPadding > 0 ? <View style={{ height: keyboardExtraPadding }} /> : null}
    </ScrollView>
  );

  return (
    <KeyboardScrollContext.Provider value={{ scrollToFocusedInput }}>
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          style={[{ flex: 1 }, containerStyle]}
          behavior="padding"
          keyboardVerticalOffset={offset}
        >
          {scrollView}
        </KeyboardAvoidingView>
      ) : (
        <View style={[{ flex: 1 }, containerStyle]}>{scrollView}</View>
      )}
    </KeyboardScrollContext.Provider>
  );
}
