import { useEffect, useState, type ReactNode } from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from './tokens';
import { ProductArt } from '../art';
import { Skeleton } from './Feedback';
import { API_BASE_URL } from '../config';

/** Normalizes backend upload URLs to the active API server origin */
export function normalizeImageUrl(src?: string | null): string | null | undefined {
  if (!src) return src;
  const backendOrigin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  const uploadsIdx = src.indexOf('/uploads/');
  if (uploadsIdx !== -1) {
    return `${backendOrigin}${src.substring(uploadsIdx)}`;
  }
  return src;
}

/** Product image with a bundled DairyFresh illustration fallback.
 *  The backend seeds imageUrl values that may not resolve; this keeps the UI
 *  premium without inventing product data. */
export function DairyImage({
  src,
  name,
  category,
  style,
  eager = false,
  resizeMode = 'contain',
}: {
  src?: string | null;
  name: string;
  category?: string;
  alt?: string;
  style?: StyleProp<ViewStyle>;
  eager?: boolean;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [src]);

  const normalizedSrc = normalizeImageUrl(src);
  const showImage = Boolean(normalizedSrc) && !failed;

  return (
    <View style={[styles.wrap, style]}>
      {!loaded && showImage ? (
        <Skeleton
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 0 }}
        />
      ) : null}
      {showImage ? (
        <Image
          source={{ uri: normalizedSrc as string }}
          resizeMode={resizeMode}
          fadeDuration={eager ? 0 : 120}
          onError={() => setFailed(true)}
          onLoadEnd={() => setLoaded(true)}
          accessibilityLabel={name}
          style={{ width: '100%', height: '100%', opacity: loaded ? 1 : 0 }}
        />
      ) : (
        <View style={{ width: '100%', height: '100%' }}>
          <ProductArt name={name} category={category} />
        </View>
      )}
    </View>
  );
}

/** Wrapper for arbitrary art placements (hero panels, empty states). */
export function ArtBox({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.wrap, style]}>{children}</View>;
}

const styles = {
  wrap: {
    backgroundColor: colors.white,
    overflow: 'hidden' as const,
    borderRadius: 0,
  },
};
