/**
 * The shape of a design token here: `{ $value, $type, $description? }`, gathered in nested
 * groups that give each one its full name. The DTCG format, which is what keeps these files
 * legible to tools other than ours.
 *
 * A token may ALIAS another by naming it in braces instead of stating a value, which is what
 * lets the accent be "indigo at step 600" rather than a colour repeated in twenty places.
 *
 * This is THE source of truth for every visual decision in the library: `tokens.css` is
 * generated from it, and the theming app to come will read and rewrite it directly.
 */
export type TokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'number'
  | 'duration'
  | 'cubicBezier'
  | 'shadow'

export interface DesignToken {
  $value: string
  $type: TokenType
  $description?: string
}

export interface TokenGroup {
  [key: string]: DesignToken | TokenGroup
}

/** Tells a token apart from a group of them, which is what walking the tree rests on. */
export function isToken(node: DesignToken | TokenGroup): node is DesignToken {
  return typeof (node as DesignToken).$value === 'string'
}

/**
 * Builds the small helper used to declare a token of one kind, so that the token files
 * below read as `color('#fff')` rather than repeating the shape of the object each time.
 */
const make =
  ($type: TokenType) =>
  ($value: string, $description?: string): DesignToken =>
    $description === undefined ? { $type, $value } : { $type, $value, $description }

export const color = make('color')
export const dimension = make('dimension')
export const fontFamily = make('fontFamily')
export const fontWeight = make('fontWeight')
export const number = make('number')
export const duration = make('duration')
export const cubicBezier = make('cubicBezier')
export const shadow = make('shadow')
