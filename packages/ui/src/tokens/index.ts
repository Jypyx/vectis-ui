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
