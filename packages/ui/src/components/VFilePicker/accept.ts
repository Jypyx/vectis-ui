/**
 * The `accept` rule, in JS.
 *
 * The attribute filters the OS dialog, but a DROP goes around it entirely: the
 * browser hands over `dataTransfer.files` untouched. Without this second
 * incarnation, drag & drop would smuggle in any type behind an `accept` the
 * consumer believes is enforced.
 *
 * Pure and total: an absent or empty `accept` accepts everything — the same
 * meaning the attribute has.
 */

/** What the matcher needs of a `File` — so the tests do not have to forge one. */
export interface AcceptCandidate {
  name: string
  type: string
}

/**
 * Matches a file against the three token forms of the HTML spec: `.ext` (a
 * case-insensitive suffix), `type/*` and `type/subtype`.
 *
 * **Trap**: `file.type` is the BROWSER's guess and is often `''` (an extension
 * it does not know, some Linux setups). A MIME-only `accept` then rejects a
 * perfectly valid file — which is why the docs recommend spelling extensions
 * alongside, `image/*,.heic` rather than `image/*` alone.
 */
export function matchesAccept(file: AcceptCandidate, accept?: string): boolean {
  if (!accept) return true

  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
  if (tokens.length === 0) return true

  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()

  return tokens.some((token) => {
    if (token === '*' || token === '*/*') return true
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) return type !== '' && type.startsWith(token.slice(0, -1))
    return type === token
  })
}
