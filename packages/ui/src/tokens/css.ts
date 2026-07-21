/**
 * Turning the design tokens into CSS.
 *
 * The tokens are written as nested groups of typed objects, and what a browser needs is a
 * flat list of custom properties. That translation happens here. The build uses it to
 * produce the stylesheet the library ships, and it is also published as part of the
 * package so that an application can do the same thing at runtime — a live theming tool
 * regenerating the variables as its user moves a slider, or exporting a configuration.
 */
import { isToken, type DesignToken, type TokenGroup } from './types'

export interface FlatToken {
  path: string[]
  cssName: string
  token: DesignToken
}

/**
 * Walks the nested groups and returns one entry per token, each carrying the name of the
 * custom property it will become — the path through the groups, joined with dashes and
 * prefixed so that nothing collides with an application's own variables.
 */
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

/**
 * A token's value may point at another token by name, in braces, instead of stating a
 * colour or a length of its own. Each of those references becomes a reading of the
 * corresponding custom property, so the link survives into the CSS and remains
 * overridable at runtime.
 *
 * A reference to a token that does not exist STOPS the build rather than being left as
 * it is. A dangling reference in CSS resolves to nothing at all, and the component using
 * it loses its colour with nothing in the console to say why.
 */
export function resolveTokenValue(value: string, known: ReadonlySet<string>): string {
  return value.replace(ALIAS_RE, (_match, ref: string) => {
    const cssName = `--vectis-${ref.trim().split('.').join('-')}`
    if (!known.has(cssName)) {
      throw new Error(`Unknown token alias: {${ref}}`)
    }
    return `var(${cssName})`
  })
}

/** The final step: a list of tokens written out as the lines of a CSS rule. */
export function toCssDeclarations(
  flat: FlatToken[],
  known: ReadonlySet<string>,
  indent = '  ',
): string {
  return flat
    .map((f) => `${indent}${f.cssName}: ${resolveTokenValue(f.token.$value, known)};`)
    .join('\n')
}
