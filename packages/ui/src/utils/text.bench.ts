/**
 * Benchmark accent-insensitive search across a full candidate list, matching the per-keystroke
 * workload.
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
