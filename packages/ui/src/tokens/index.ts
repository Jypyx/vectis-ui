/**
 * What an application gets when it imports the design system's tokens: the tokens
 * themselves, exactly as the library defines them, and the means to turn them into CSS —
 * flattening the groups, following the references between tokens, writing the
 * declarations out.
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
