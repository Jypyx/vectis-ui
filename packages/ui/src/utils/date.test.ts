import { describe, expect, it } from 'vitest'

import {
  addDays,
  addMonths,
  buildMonthGrid,
  caretAfterDigits,
  clampISO,
  compareISO,
  dateMaskFor,
  formatDateMask,
  formatDisplayRange,
  isoToMask,
  isValidISO,
  isWithin,
  maskPlaceholder,
  monthNames,
  monthNamesCompact,
  parseDateMask,
  parseISO,
  weekdayNames,
} from './date'

describe('utils/date', () => {
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

describe('utils/date — masque de saisie', () => {
  const FR = dateMaskFor('fr-FR')

  it('dérive l’ordre des champs et le séparateur de la locale', () => {
    expect(FR.order).toEqual(['day', 'month', 'year'])
    expect(FR.separator).toBe('/')
    expect(dateMaskFor('en-US').order).toEqual(['month', 'day', 'year'])
    expect(dateMaskFor('ja-JP').order).toEqual(['year', 'month', 'day'])
    expect(dateMaskFor('de-DE').separator).toBe('.')
    expect(dateMaskFor('sv-SE').separator).toBe('-')
  })

  it('nettoie les séparateurs exotiques et force le calendrier grégorien', () => {
    // hu-HU formate « 2021. 11. 22. » : littéral avec espace, plus une queue.
    expect(dateMaskFor('hu-HU').separator).toBe('.')
    // ar-EG préfixe son « / » d'une marque bidi U+200F.
    expect(dateMaskFor('ar-EG').separator).toBe('/')
    // fa-IR renverrait une année persane (1400) sans `calendar: 'gregory'`.
    expect(isoToMask('2026-06-10', dateMaskFor('fa-IR'))).toBe('2026/06/10')
    // locale invalide (RangeError) → repli jour/mois/année « / »
    expect(dateMaskFor('fr_FR')).toEqual(FR)
  })

  it('pose le séparateur dès que le champ précédent est plein', () => {
    expect(formatDateMask('', FR)).toBe('')
    expect(formatDateMask('1', FR)).toBe('1')
    expect(formatDateMask('22', FR)).toBe('22/')
    expect(formatDateMask('221', FR)).toBe('22/1')
    expect(formatDateMask('2211', FR)).toBe('22/11/')
    expect(formatDateMask('22112021', FR)).toBe('22/11/2021')
    // au-delà du gabarit, les chiffres surnuméraires sont ignorés
    expect(formatDateMask('221120215', FR)).toBe('22/11/2021')
  })

  it('formate un ISO selon l’ordre de la locale', () => {
    expect(isoToMask('2026-06-10', FR)).toBe('10/06/2026')
    expect(isoToMask('2026-06-10', dateMaskFor('en-US'))).toBe('06/10/2026')
    expect(isoToMask('2026-06-10', dateMaskFor('ja-JP'))).toBe('2026/06/10')
    expect(isoToMask('boom', FR)).toBe('')
  })

  it('parse une saisie masquée et rejette l’impossible', () => {
    expect(parseDateMask('10/06/2026', FR)).toBe('2026-06-10')
    expect(parseDateMask('06/10/2026', dateMaskFor('en-US'))).toBe('2026-06-10')
    expect(parseDateMask('31/02/2026', FR)).toBeNull()
    expect(parseDateMask('29/02/2026', FR)).toBeNull() // non bissextile
    expect(parseDateMask('29/02/2024', FR)).toBe('2024-02-29')
    expect(parseDateMask('10/06/202', FR)).toBeNull() // incomplet
    expect(parseDateMask('10/06/20261', FR)).toBeNull() // chiffres en trop
    expect(parseDateMask('', FR)).toBeNull()
  })

  it('n’étend une année à 2 chiffres que si un pivot est fourni', () => {
    expect(parseDateMask('10/06/26', FR)).toBeNull()
    expect(parseDateMask('10/06/26', FR, { yearPivot: 2000 })).toBe('2026-06-10')
    expect(parseDateMask('10/06/00', FR, { yearPivot: 2000 })).toBe('2000-06-10')
    // année en tête (ja-JP) : pas de raccourci possible, elle reste à 4 chiffres
    expect(parseDateMask('26/06/10', dateMaskFor('ja-JP'), { yearPivot: 2000 })).toBeNull()
  })

  it('replace le caret sur le n-ième chiffre, en franchissant le séparateur à la frappe', () => {
    expect(caretAfterDigits('22/11/2021', 0)).toBe(0)
    expect(caretAfterDigits('22/11/2021', 2)).toBe(2)
    expect(caretAfterDigits('22/11/2021', 2, '/')).toBe(3) // insertion : on entre dans le champ suivant
    expect(caretAfterDigits('22/', 2, '/')).toBe(3)
    expect(caretAfterDigits('22/11/2021', 99)).toBe(10) // au-delà → fin du texte
  })

  it('dérive un gabarit de placeholder des noms de champs localisés', () => {
    expect(maskPlaceholder('fr-FR', FR)).toBe('jj/mm/aaaa')
    expect(maskPlaceholder('en-US', dateMaskFor('en-US'))).toBe('mm/dd/yyyy')
    expect(maskPlaceholder('de-DE', dateMaskFor('de-DE'))).toBe('tt.mm.jjjj')
    // script idéographique (« 日日/月月/年年年年 » serait illisible) → repli latin
    expect(maskPlaceholder('ja-JP', dateMaskFor('ja-JP'))).toBe('yyyy/mm/dd')
  })
})
