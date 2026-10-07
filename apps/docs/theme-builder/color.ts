/**
 * The colour arithmetic the theme builder needs: reading and writing `oklch()`, deriving one
 * colour from another in that space, and the WCAG contrast ratio between two colours. The
 * conversion matrices are Björn Ottosson's OKLab reference values.
 */

/** Lightness from 0 to 1, chroma, and hue in degrees. */
export interface Oklch {
  l: number
  c: number
  h: number
}

const OKLCH_RE =
  /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+|none)\s+([\d.]+|none)(?:\s*\/\s*[\d.]+%?)?\s*\)$/i
const HEX_RE = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function linearFromGamma(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

function linearSrgbToOklch(r: number, g: number, b: number): Oklch {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const c = Math.hypot(A, B)
  const h = c < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360
  return { l: L, c, h }
}

function oklchToLinearSrgb({ l, c, h }: Oklch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const l3 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m3 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s3 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ]
}

/** Reads an `oklch()` or hex colour; anything else, or an empty value, is `null`. */
export function parseColor(input: string | null | undefined): Oklch | null {
  const text = input?.trim()
  if (!text) return null

  const oklch = OKLCH_RE.exec(text)
  if (oklch) {
    const lightness = Number(oklch[1]) / (oklch[2] ? 100 : 1)
    const chroma = oklch[3] === 'none' ? 0 : Number(oklch[3])
    const hue = oklch[4] === 'none' ? 0 : Number(oklch[4])
    return { l: clamp(lightness, 0, 1), c: chroma, h: hue }
  }

  const hex = HEX_RE.exec(text)?.[1]
  if (!hex) return null
  const full = hex.length <= 4 ? [...hex].map((digit) => digit + digit).join('') : hex
  const [r, g, b] = [0, 2, 4].map((at) =>
    linearFromGamma(Number.parseInt(full.slice(at, at + 2), 16) / 255),
  ) as [number, number, number]
  return linearSrgbToOklch(r, g, b)
}

const round = (value: number, digits: number) => Number(value.toFixed(digits))

/** Writes the colour as `oklch()`, at the precision Tailwind's own palettes use. */
export function formatOklch({ l, c, h }: Oklch): string {
  // A grey has no hue to speak of, and a hue that rounds up to 360 is 0.
  const hue = c < 5e-4 ? 0 : round(h, 1) % 360
  return `oklch(${round(l * 100, 1)}% ${round(c, 3)} ${hue})`
}

/** Whether two colours differ by no more than writing them out and reading them back would. */
export function sameColor(a: Oklch, b: Oklch): boolean {
  const hueGap = Math.abs(((a.h - b.h + 540) % 360) - 180)
  return (
    Math.abs(a.l - b.l) < 2e-3 &&
    Math.abs(a.c - b.c) < 2e-3 &&
    (Math.min(a.c, b.c) < 2e-3 || hueGap < 0.5)
  )
}

/**
 * Places `color` where `reference` sits relative to `referenceBase`, around a new `base`.
 * Lightness moves the same share of the way towards white or black, so white stays white and
 * black stays black; chroma keeps its ratio; hue keeps its offset.
 */
export function deriveColor(base: Oklch, reference: Oklch, referenceBase: Oklch): Oklch {
  const l =
    reference.l >= referenceBase.l
      ? base.l + ((reference.l - referenceBase.l) * (1 - base.l)) / (1 - referenceBase.l || 1)
      : base.l - ((referenceBase.l - reference.l) * base.l) / (referenceBase.l || 1)
  const c = referenceBase.c > 1e-3 ? base.c * (reference.c / referenceBase.c) : reference.c
  const h = base.c > 1e-3 ? (base.h + reference.h - referenceBase.h + 360) % 360 : reference.h
  return { l: clamp(l, 0, 1), c: clamp(c, 0, 0.4), h }
}

/** The WCAG relative luminance, from the colour clipped to the sRGB gamut. */
function luminance(color: Oklch): number {
  const [r, g, b] = oklchToLinearSrgb(color).map((channel) => clamp(channel, 0, 1)) as [
    number,
    number,
    number,
  ]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** The WCAG 2 contrast ratio between two colours, from 1 to 21. */
export function contrastRatio(a: Oklch, b: Oklch): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (light + 0.05) / (dark + 0.05)
}
