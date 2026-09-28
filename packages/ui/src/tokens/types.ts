/** Typed DTCG tokens: nested groups of $value, $type and optional $description. */
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

/** Tells a token apart from a group of them, which walking the tree rests on. */
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
