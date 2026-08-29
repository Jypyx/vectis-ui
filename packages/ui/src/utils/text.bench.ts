/**
 * The cost of accent-insensitive matching, which runs on every keystroke.
 *
 * `normalizeText` is the filter behind VCombobox and VDataTable: both normalize the search
 * term AND every candidate cell on each input event, so its real workload is not one call
 * but one call per row. VDataTable additionally normalizes across every declared column.
 *
 * The interesting question is what NFD costs on text that has nothing to decompose, since
 * that is the overwhelmingly common case — an ASCII list filtered by an ASCII term. If the
 * two are close, the helper is free and the WeakMap caches around it are what matter; if
 * they diverge, a fast path is worth considering. Both are measured rather than guessed.
 */
import { bench, describe } from 'vitest'

import { normalizeText } from './text'

const ASCII = 'Wireless Keyboard, Compact'
const ACCENTED = 'Réunion — Éclair à la crème brûlée'

describe('one value', () => {
  bench('ascii (nothing to decompose)', () => {
    normalizeText(ASCII)
  })

  bench('accented', () => {
    normalizeText(ACCENTED)
  })
})

describe('one keystroke over a list', () => {
  const rows = Array.from({ length: 1000 }, (_, i) => `${ASCII} ${i}`)
  const accentedRows = Array.from({ length: 1000 }, (_, i) => `${ACCENTED} ${i}`)

  bench('1000 ascii rows', () => {
    for (const row of rows) normalizeText(row)
  })

  bench('1000 accented rows', () => {
    for (const row of accentedRows) normalizeText(row)
  })
})
