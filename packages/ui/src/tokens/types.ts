/**
 * The shape a design token takes in this repository.
 *
 * A token is a named decision — this blue, this corner radius, this pause before a
 * tooltip appears — and it is written as a small object holding its value, what KIND of
 * thing it is, and optionally a sentence explaining it. Tokens are gathered in nested
 * groups, which is what gives each of them its full name.
 *
 * A token may point at another instead of stating a value, by naming it in braces. That
 * is what lets "the colour of a primary button" be defined as "the indigo at step 600"
 * rather than as a colour repeated in twenty places.
 *
 * The format follows the one the W3C's design tokens group has been settling on, which is
 * what makes these files legible to tools other than ours.
 *
 * This is THE source of truth for every visual decision in the library. The stylesheet is
 * generated from it, and the live theming application to come will read and rewrite it
 * directly.
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
