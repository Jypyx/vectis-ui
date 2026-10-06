// @core
/**
 * Colour parsing, conversion and formatting for VColorPicker and VColorInput, without a
 * dependency. Everything works in sRGB: an `oklch()` colour outside it is clipped to the nearest
 * displayable one, which is what the picker could show anyway.
 */

/** How a colour is written: `#rrggbb`, `rgb()`, `hsl()` or `oklch()`. */
export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch'

/** The formats in the order the picker offers them. */
export const COLOR_FORMATS: readonly ColorFormat[] = ['hex', 'rgb', 'hsl', 'oklch']

/** A colour in sRGB, each channel from 0 to 1, alpha included. */
export interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

/**
 * A colour as the picker holds it: hue in degrees, saturation and value (brightness) from 0 to
 * 1. The hue survives where RGB would lose it, on greys, black and white.
 */
export interface Hsva {
  h: number
  s: number
  v: number
  a: number
}

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1)
const wrapHue = (h: number) => ((h % 360) + 360) % 360

export function hsvToRgb({ h, s, v, a }: Hsva): Rgba {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1))
  }
  return { r: f(5), g: f(3), b: f(1), a }
}

/** `hue` is kept when the colour has none of its own: a grey, black or white. */
export function rgbToHsv({ r, g, b, a }: Rgba, hue = 0): Hsva {
  const max = Math.max(r, g, b)
  const delta = max - Math.min(r, g, b)
  let h = hue
  if (delta > 0) {
    if (max === r) h = 60 * (((g - b) / delta + 6) % 6)
    else if (max === g) h = 60 * ((b - r) / delta + 2)
    else h = 60 * ((r - g) / delta + 4)
  }
  return { h: wrapHue(h), s: max === 0 ? 0 : delta / max, v: max, a }
}

function hslToRgb(h: number, s: number, l: number, a: number): Rgba {
  const v = l + s * Math.min(l, 1 - l)
  return hsvToRgb({ h, s: v === 0 ? 0 : 2 * (1 - l / v), v, a })
}

function rgbToHsl(rgba: Rgba): { h: number; s: number; l: number } {
  const { h, s, v } = rgbToHsv(rgba)
  const l = v * (1 - s / 2)
  return { h, s: l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l), l }
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

/** Björn Ottosson's OKLab matrices, from linear sRGB and back. */
function rgbToOklch({ r, g, b }: Rgba): { l: number; c: number; h: number } {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)]
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return { l: L, c: Math.hypot(A, B), h: wrapHue((Math.atan2(B, A) * 180) / Math.PI) }
}

function oklchToRgb(L: number, C: number, H: number, a: number): Rgba {
  const A = C * Math.cos((H * Math.PI) / 180)
  const B = C * Math.sin((H * Math.PI) / 180)
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  const channel = (n: number) => clamp01(toGamma(n))
  return {
    r: channel(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: channel(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: channel(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    a,
  }
}

/**
 * One argument of a colour function: a number, a percentage or an angle, `none` counting as 0.
 * `percent` is what 100% is worth for that channel.
 */
function readNumber(token: string | undefined, percent: number): number | null {
  if (token === undefined) return null
  if (token === 'none') return 0
  const match = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(%|deg|grad|rad|turn)?$/.exec(token)
  if (!match) return null
  const n = Number(match[1])
  switch (match[2]) {
    case '%':
      return (n / 100) * percent
    case 'grad':
      return n * 0.9
    case 'rad':
      return (n * 180) / Math.PI
    case 'turn':
      return n * 360
    default:
      return n
  }
}

function parseHex(hex: string): Rgba | null {
  if (!/^[0-9a-f]+$/.test(hex) || ![3, 4, 6, 8].includes(hex.length)) return null
  const pairs = hex.length <= 4 ? [...hex].map((c) => c + c) : hex.match(/../g)!
  const [r = 0, g = 0, b = 0, a = 1] = pairs.map((pair) => parseInt(pair, 16) / 255)
  return { r, g, b, a }
}

/**
 * Reads a colour written in hex (`#` optional, 3, 4, 6 or 8 digits), `rgb()`, `hsl()` or
 * `oklch()`, in the comma or the space syntax, with an optional alpha. Returns `null` for
 * anything else, CSS colour names included.
 */
export function parseColor(input: string | null | undefined): Rgba | null {
  const text = (input ?? '').trim().toLowerCase()
  if (!text) return null
  const fn = /^(rgba?|hsla?|oklch)\(\s*([^)]*)\)$/.exec(text)
  if (!fn) return parseHex(text.replace(/^#/, ''))

  const [main = '', alphaPart, extra] = fn[2]!.split('/')
  if (extra !== undefined) return null
  const args = main.trim().split(/\s*,\s*|\s+/)
  const legacyAlpha = alphaPart === undefined && args.length === 4 ? args.pop() : undefined
  if (args.length !== 3) return null
  const alphaToken = (alphaPart ?? legacyAlpha)?.trim()
  const a = alphaToken === undefined ? 1 : readNumber(alphaToken, 1)
  if (a === null) return null

  const name = fn[1]!
  if (name.startsWith('rgb')) {
    const [r, g, b] = args.map((arg) => readNumber(arg, 255))
    if (r == null || g == null || b == null) return null
    return { r: clamp01(r / 255), g: clamp01(g / 255), b: clamp01(b / 255), a: clamp01(a) }
  }
  if (name.startsWith('hsl')) {
    // Bare numbers are percentages here, as the space syntax allows.
    const [h, s, l] = [readNumber(args[0], 360), readNumber(args[1], 100), readNumber(args[2], 100)]
    if (h == null || s == null || l == null) return null
    return hslToRgb(wrapHue(h), clamp01(s / 100), clamp01(l / 100), clamp01(a))
  }
  const [l, c, h] = [readNumber(args[0], 1), readNumber(args[1], 0.4), readNumber(args[2], 360)]
  if (l == null || c == null || h == null) return null
  return oklchToRgb(clamp01(l), Math.max(c, 0), wrapHue(h), clamp01(a))
}

/** Rounds to `digits` decimals and drops the trailing zeros. */
const round = (n: number, digits = 0) => String(Number(n.toFixed(digits)))

/**
 * Writes a colour in `format`. The alpha appears only when `alpha` is true and the colour is not
 * opaque, so an opaque colour always reads the same whether alpha is offered or not.
 */
export function formatColor(rgba: Rgba, format: ColorFormat, alpha = false): string {
  const a = alpha ? clamp01(rgba.a) : 1
  const slash = a < 1 ? ` / ${round(a, 2)}` : ''
  switch (format) {
    case 'rgb':
      return `rgb(${round(rgba.r * 255)} ${round(rgba.g * 255)} ${round(rgba.b * 255)}${slash})`
    case 'hsl': {
      const { h, s, l } = rgbToHsl(rgba)
      return `hsl(${round(h)} ${round(s * 100)}% ${round(l * 100)}%${slash})`
    }
    case 'oklch': {
      const { l, c, h } = rgbToOklch(rgba)
      // Below this chroma the hue is noise from rounding: a grey is written with none.
      const hue = c < 0.0005 ? 0 : h
      return `oklch(${round(l * 100, 1)}% ${round(c, 3)} ${round(hue, 1)}${slash})`
    }
    default: {
      const hex = (n: number) =>
        Math.round(clamp01(n) * 255)
          .toString(16)
          .padStart(2, '0')
      return `#${hex(rgba.r)}${hex(rgba.g)}${hex(rgba.b)}${a < 1 ? hex(a) : ''}`
    }
  }
}

/** Whether two colours are the same once written in hex, which is how swatches are matched. */
export function sameColor(a: Rgba | null, b: Rgba | null, alpha: boolean): boolean {
  return !!a && !!b && formatColor(a, 'hex', alpha) === formatColor(b, 'hex', alpha)
}
