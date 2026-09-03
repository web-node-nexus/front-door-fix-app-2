import React, { useEffect, useMemo, useState } from 'react';
import { Image, ImageProps, ImageStyle, StyleProp } from 'react-native';

type Props = {
  uris: string[];
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageProps['resizeMode'];
};

/** Tries each catalog URL until one loads (local API, then live site photos). */
export default function CatalogImage({ uris, style, resizeMode = 'cover' }: Props) {
  const list = useMemo(() => uris.filter(Boolean), [uris.join('|')]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [list.join('|')]);

  const uri = list[Math.min(index, Math.max(list.length - 1, 0))];
  if (!uri) return null;

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => {
        if (index < list.length - 1) setIndex((i) => i + 1);
      }}
    />
  );
}
