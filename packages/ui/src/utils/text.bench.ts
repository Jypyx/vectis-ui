/**
 * Benchmark accent-insensitive search across a full candidate list, matching the per-keystroke
 * workload.
 */
import { test } from 'vite-plus/test'

import { normalizeText } from './text'

const ASCII = 'Wireless Keyboard, Compact'
const ACCENTED = 'Réunion — Éclair à la crème brûlée'

test('one value', async ({ bench }) => {
  await bench.compare(
    bench('ascii (nothing to decompose)', () => {
      normalizeText(ASCII)
    }),
    bench('accented', () => {
      normalizeText(ACCENTED)
    }),
  )
})

test('one keystroke over a list', async ({ bench }) => {
  const rows = Array.from({ length: 1000 }, (_, i) => `${ASCII} ${i}`)
  const accentedRows = Array.from({ length: 1000 }, (_, i) => `${ACCENTED} ${i}`)

  await bench.compare(
    bench('1000 ascii rows', () => {
      for (const row of rows) normalizeText(row)
    }),
    bench('1000 accented rows', () => {
      for (const row of accentedRows) normalizeText(row)
    }),
  )
})
