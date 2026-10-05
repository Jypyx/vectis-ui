// @core
/**
 * The arithmetic and the locale handling of VNumberInput, kept free of Vue: reading what was
 * typed, writing a value back for editing, and stepping on a grid without floating-point drift.
 */

/** The two separators a locale writes numbers with: "1 234,5" in French, "1,234.5" in English. */
export interface NumberSeparators {
  group: string
  decimal: string
}

export function numberSeparators(locale: string): NumberSeparators {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6)
  return {
    group: parts.find((part) => part.type === 'group')?.value ?? '',
    decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
  }
}

/** The minus signs a keyboard or a paste can bring, besides the hyphen. */
const MINUS = /[−‒–﹣－]/g

/** What a number may look like once separators and symbols are gone: "-12", "3.", ".5". */
const PLAIN = /^-?(\d+\.?\d*|\.\d+)$/

/**
 * Reads a typed number: `null` for an empty field, `NaN` for text that is not a number.
 *
 * Group separators and any space are dropped, the locale's decimal separator becomes a point,
 * and a point is also accepted as the decimal separator where the locale does not group with
 * it. Currency, unit and percent symbols are ignored, so a formatted value pasted back in reads
 * as the number it shows.
 */
export function parseNumber(text: string, separators: NumberSeparators): number | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  let plain = trimmed.replace(MINUS, '-')
  if (separators.group) plain = plain.split(separators.group).join('')
  plain = plain.replace(/\s/g, '')
  if (separators.decimal !== '.') plain = plain.split(separators.decimal).join('.')
  plain = plain.replace(/[^\d.-]/g, '')
  return PLAIN.test(plain) ? Number(plain) : Number.NaN
}

/** The number of decimals a value is written with: 0.25 has two, 1e-7 has seven. */
export function decimalsOf(value: number): number {
  const text = String(value)
  const exponent = text.indexOf('e-')
  if (exponent >= 0)
    return Number(text.slice(exponent + 2)) + decimalsOf(Number(text.slice(0, exponent)))
  const point = text.indexOf('.')
  return point < 0 ? 0 : text.length - point - 1
}

/** Rounds to a number of decimals, which is what removes the drift of 0.1 + 0.2. */
export function roundTo(value: number, decimals: number): number {
  return Number(value.toFixed(Math.min(decimals, 100)))
}

/** Multiplies by a power of ten without picking up drift: 0.07 × 100 is 7, not 7.000000000000001. */
export function scale(value: number, factor: number): number {
  return Number((value * factor).toPrecision(15))
}

export function clamp(value: number, min: number | undefined, max: number | undefined): number {
  if (max !== undefined && value > max) value = max
  if (min !== undefined && value < min) value = min
  return value
}

/**
 * Moves a value by a number of steps on the grid that starts at `base`. A value off the grid
 * lands on the next grid line in the direction of travel first, as a native number input does:
 * up from 1.5 by a step of 1 gives 2, not 2.5.
 */
export function stepValue(value: number, steps: number, step: number, base: number): number {
  const decimals = Math.max(decimalsOf(step), decimalsOf(base))
  const position = roundTo((value - base) / step, 10)
  const onGrid = Number.isInteger(position)
  const from = onGrid ? position : steps > 0 ? Math.floor(position) : Math.ceil(position)
  return roundTo(base + (from + steps) * step, decimals)
}
