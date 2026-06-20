import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Options = {
  headerless?: boolean;
  extraTop?: number;
  extraBottom?: number;
};

export function useScreenPadding(options: Options = {}) {
  const insets = useSafeAreaInsets();
  const { headerless = false, extraTop = 16, extraBottom = 20 } = options;

  return {
    paddingTop: (headerless ? insets.top : 0) + extraTop,
    paddingBottom: extraBottom + insets.bottom,
  };
}
