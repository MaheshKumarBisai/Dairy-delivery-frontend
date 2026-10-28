/**
 * react-native-svg forwards `width` / `height` (from props *and* the flattened
 * style) into native `SVGLength`, which on Android parses them with
 * `Double.valueOf(...)`. The string "auto" is valid in RN styles (RN maps it to
 * `YogaUnit.AUTO`) but crashes Android with:
 *
 *   For input string: "auto" → FloatingDecimal.readJavaFormatString → parseDouble
 *
 * This guard keeps only numbers and `<number>%` strings, and when a dimension
 * had to be dropped it derives `aspectRatio` from the `viewBox` so art keeps its
 * proportions with a plain `width: '100%'`.
 */
const NUMERIC = /^-?(\d+(\.\d+)?|\.\d+)%?$/;

export type SvgDimension = number | string | undefined;

function safeDim(value: unknown): SvgDimension {
  if (value == null) return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  const text = String(value).trim();
  return NUMERIC.test(text) ? text : undefined;
}

function viewBoxRatio(viewBox: string | undefined): number | undefined {
  if (!viewBox) return undefined;
  const parts = viewBox.trim().split(/\s+/);
  const width = Number(parts[2]);
  const height = Number(parts[3]);
  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return width / height;
  }
  return undefined;
}

export function guardSvgDimensions<T extends Record<string, unknown>>(
  width: unknown,
  height: unknown,
  viewBox: string | undefined,
  flatStyle: T | undefined,
): {
  width: SvgDimension;
  height: SvgDimension;
  style: (T & { aspectRatio?: number }) | undefined;
  dropped: boolean;
} {
  let dropped = false;

  const w = safeDim(width);
  if (width != null && w !== width) dropped = true;

  const h = safeDim(height);
  if (height != null && h !== height) dropped = true;

  let style: Record<string, unknown> | undefined = flatStyle ? { ...flatStyle } : undefined;

  if (style) {
    for (const key of ['width', 'height']) {
      const original = style[key];
      if (original == null) continue;
      const safe = safeDim(original);
      if (safe !== original) {
        dropped = true;
        if (safe == null) delete style[key];
        else style[key] = safe;
      }
    }
  }

  if (dropped && viewBox && style?.aspectRatio == null) {
    const ratio = viewBoxRatio(viewBox);
    if (ratio != null) style = { ...style, aspectRatio: ratio };
  }

  return {
    width: w,
    height: h,
    style: style as (T & { aspectRatio?: number }) | undefined,
    dropped,
  };
}
