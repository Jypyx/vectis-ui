/**
 * Point d'entrée `@vectis/ui/tokens` : la source de vérité des tokens et les
 * utilitaires pour les transformer (flatten, résolution d'alias, CSS).
 */
import { primitives } from './primitives'
import { semantic } from './semantic'
import { dark } from './themes/dark'

export type { DesignToken, TokenGroup, TokenType } from './types'
export { isToken } from './types'
export { flattenTokens, resolveTokenValue, toCssDeclarations, type FlatToken } from './css'

export const tokens = {
  primitives,
  semantic,
  themes: { dark },
}

export type Tokens = typeof tokens
