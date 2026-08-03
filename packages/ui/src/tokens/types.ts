/**
 * Format de tokens inspiré du W3C Design Tokens Community Group (DTCG) :
 * un token est un objet `{ $value, $type, $description? }`, les groupes sont
 * des objets imbriqués. Les alias utilisent la syntaxe DTCG `{path.to.token}`
 * et sont résolus en `var(--vectis-path-to-token)` par le build.
 *
 * Cette source typée est LA source de vérité : le CSS est généré depuis elle,
 * et la future app de theming la manipulera programmatiquement.
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
