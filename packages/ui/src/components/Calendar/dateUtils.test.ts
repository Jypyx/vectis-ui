import { describe, expect, it } from 'vitest'

import {
  addDays,
  addMonths,
  buildMonthGrid,
  clampISO,
  compareISO,
  formatDisplayRange,
  isValidISO,
  isWithin,
  monthNames,
  monthNamesCompact,
  parseISO,
  weekdayNames,
} from './dateUtils'

describe('dateUtils', () => {
  it('valide et parse un ISO en heure locale (sans dérive UTC)', () => {
    expect(isValidISO('2026-06-10')).toBe(true)
    expect(isValidISO('2026-13-01')).toBe(false)
    expect(isValidISO('2026-02-30')).toBe(false)
    expect(isValidISO('boom')).toBe(false)
    const d = parseISO('2026-06-10')!
    // le jour local est bien le 10 (pas décalé par le fuseau)
    expect(d.getDate()).toBe(10)
    expect(d.getMonth()).toBe(5)
  })

  it('additionne jours et mois avec report et clamp de fin de mois', () => {
    expect(addDays('2026-06-30', 1)).toBe('2026-07-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    // 31 janvier + 1 mois → 28 février (clamp), pas mars
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28')
  })

  it('compare, clampe et teste l’appartenance à un intervalle', () => {
    expect(compareISO('2026-06-10', '2026-06-11')).toBe(-1)
    expect(clampISO('2026-06-01', '2026-06-05', '2026-06-20')).toBe('2026-06-05')
    expect(clampISO('2026-06-25', '2026-06-05', '2026-06-20')).toBe('2026-06-20')
    expect(isWithin('2026-06-10', '2026-06-05', '2026-06-20')).toBe(true)
    expect(isWithin('2026-06-30', '2026-06-05', '2026-06-20')).toBe(false)
  })

  it('construit une grille de 42 cellules pour un mois', () => {
    const grid = buildMonthGrid(2026, 5, 1) // juin 2026, semaine débutant lundi
    expect(grid).toHaveLength(42)
    // contient bien le 1er et le 30 juin marqués « in month »
    const inMonth = grid.filter((c) => c.adjacent === null)
    expect(inMonth).toHaveLength(30)
  })

  it('produit des noms localisés indépendants du fuseau', () => {
    expect(monthNames('fr-FR', 'long')[5]).toBe('juin')
    // premier jour de semaine lundi → lundi en tête
    expect(weekdayNames('fr-FR', 1, 'long')[0]?.toLowerCase()).toContain('lundi')
  })

  it('abrège les mois : entier si ≤4 caractères, sinon 3 + point', () => {
    const m = monthNamesCompact('fr-FR')
    expect(m[4]).toBe('mai') // 3 car. → entier
    expect(m[5]).toBe('juin') // 4 car. → entier
    expect(m[7]).toBe('août') // 4 car. (accent compté comme 1) → entier
    expect(m[0]).toBe('jan.') // « janvier » → 3 + point
    expect(m[1]).toBe('fév.') // « février » → 3 + point
  })

  it('formate une plage via Intl.formatRange', () => {
    const out = formatDisplayRange('2026-06-19', '2026-06-26', 'fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    expect(out).toContain('19')
    expect(out).toContain('26')
  })
})
