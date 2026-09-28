/**
 * Flatten typed DTCG groups and aliases into CSS declarations for token generation and consumer
 * theming tools.
 */
import { isToken, type DesignToken, type TokenGroup } from './types'

export interface FlatToken {
  path: string[]
  cssName: string
  token: DesignToken
}

/** Flatten nested groups into token entries with qualified CSS custom-property names. */
export function flattenTokens(group: TokenGroup, prefix: string[] = []): FlatToken[] {
  const out: FlatToken[] = []
  for (const [key, node] of Object.entries(group)) {
    const path = [...prefix, key]
    if (isToken(node)) {
      out.push({ path, cssName: `--vectis-${path.join('-')}`, token: node })
    } else {
      out.push(...flattenTokens(node, path))
    }
  }
  return out
}

const ALIAS_RE = /\{([^}]+)\}/g

/** Resolve DTCG references into CSS var aliases while preserving literal values. */
export function resolveTokenValue(value: string, known: ReadonlySet<string>): string {
  return value.replace(ALIAS_RE, (_match, ref: string) => {
    const cssName = `--vectis-${ref.trim().split('.').join('-')}`
    if (!known.has(cssName)) {
      throw new Error(`Unknown token alias: {${ref}}`)
    }
    return `var(${cssName})`
  })
}

/** Serialize flat token entries into CSS declarations. */
export function toCssDeclarations(
  flat: FlatToken[],
  known: ReadonlySet<string>,
  indent = '  ',
): string {
  return flat
    .map((f) => `${indent}${f.cssName}: ${resolveTokenValue(f.token.$value, known)};`)
    .join('\n')
}
