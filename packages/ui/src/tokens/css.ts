/**
 * Utilitaires de transformation tokens → CSS. Utilisés par le script de build
 * et exposés via `@socle/ui/tokens` pour la future app de theming
 * (génération de surcharges runtime, export de config).
 */
import { isToken, type DesignToken, type TokenGroup } from './types'

export interface FlatToken {
  /** Chemin dans l'arbre, ex. ['color', 'neutral', '500'] */
  path: string[]
  /** Nom de la custom property, ex. `--ds-color-neutral-500` */
  cssName: string
  token: DesignToken
}

export function flattenTokens(group: TokenGroup, prefix: string[] = []): FlatToken[] {
  const out: FlatToken[] = []
  for (const [key, node] of Object.entries(group)) {
    const path = [...prefix, key]
    if (isToken(node)) {
      out.push({ path, cssName: `--ds-${path.join('-')}`, token: node })
    } else {
      out.push(...flattenTokens(node, path))
    }
  }
  return out
}

const ALIAS_RE = /\{([^}]+)\}/g

/**
 * Résout les alias DTCG `{path.to.token}` en `var(--ds-path-to-token)`.
 * Lève une erreur si l'alias ne correspond à aucun token connu.
 */
export function resolveTokenValue(value: string, known: ReadonlySet<string>): string {
  return value.replace(ALIAS_RE, (_match, ref: string) => {
    const cssName = `--ds-${ref.trim().split('.').join('-')}`
    if (!known.has(cssName)) {
      throw new Error(`Alias de token inconnu : {${ref}}`)
    }
    return `var(${cssName})`
  })
}

export function toCssDeclarations(
  flat: FlatToken[],
  known: ReadonlySet<string>,
  indent = '  ',
): string {
  return flat
    .map((f) => `${indent}${f.cssName}: ${resolveTokenValue(f.token.$value, known)};`)
    .join('\n')
}
