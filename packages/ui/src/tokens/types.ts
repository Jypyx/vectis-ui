/**
 * Token format inspired by the W3C Design Tokens Community Group (DTCG): a token
 * is an object `{ $value, $type, $description? }`, and groups are nested objects.
 * Aliases use the DTCG syntax `{path.to.token}` and are resolved to
 * `var(--vectis-path-to-token)` by the build.
 *
 * This typed source is THE source of truth: the CSS is generated from it, and the
 * future theming app will manipulate it programmatically.
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

export function isToken(node: DesignToken | TokenGroup): node is DesignToken {
  return typeof (node as DesignToken).$value === 'string'
}

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
