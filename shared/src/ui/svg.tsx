import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import RNSvg, { type SvgProps } from 'react-native-svg';
import { guardSvgDimensions } from './svg-guard';

/**
 * `react-native-svg` forwards `width` / `height` (props and flattened style)
 * to the native `SVGLength` parser — the RN style value "auto" crashes Android
 * with `For input string: "auto"`. This wrapper strips non-numeric dimensions
 * (see `svg-guard.ts`) so art can never take the native runtime down.
 */
export default function Svg({ width, height, viewBox, style, ...rest }: SvgProps) {
  const flat = style != null ? (StyleSheet.flatten(style) as ViewStyle | undefined) : undefined;
  const guarded = guardSvgDimensions(width, height, viewBox, flat as Record<string, unknown>);

  return (
    <RNSvg
      {...rest}
      viewBox={viewBox}
      width={guarded.width as SvgProps['width']}
      height={guarded.height as SvgProps['height']}
      style={guarded.style as StyleProp<ViewStyle>}
    />
  );
}
