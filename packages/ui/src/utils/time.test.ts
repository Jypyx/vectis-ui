import { describe, expect, it } from 'vitest'

import {
  DIAL_INNER_THRESHOLD,
  angleToIndex,
  clampInt,
  dialIndexToHour24,
  distanceFraction,
  formatDisplay,
  formatTime,
  formatTimeMask,
  hour24ToDial,
  hourCycleFor,
  isValidTime,
  minutesOf,
  parseTime,
  parseTimeMask,
  snapMinute,
  timeCaret,
  timeList,
  timeToMask,
  to12h,
  to24h,
} from './time'

describe('isValidTime / parseTime / formatTime', () => {
  it('accepte les bornes 00:00 et 23:59', () => {
    expect(isValidTime('00:00')).toBe(true)
    expect(isValidTime('23:59')).toBe(true)
    expect(parseTime('09:15')).toEqual({ hour: 9, minute: 15 })
  })

  it('rejette les formats invalides', () => {
    expect(isValidTime('24:00')).toBe(false)
    expect(isValidTime('12:60')).toBe(false)
    expect(isValidTime('7:5')).toBe(false)
    expect(isValidTime('07:05:00')).toBe(false)
    expect(isValidTime(null)).toBe(false)
    expect(isValidTime(715)).toBe(false)
    expect(parseTime('24:00')).toBeNull()
    expect(parseTime(undefined)).toBeNull()
  })

  it('formate avec zéros de tête', () => {
    expect(formatTime(7, 5)).toBe('07:05')
    expect(formatTime(0, 0)).toBe('00:00')
    expect(formatTime(23, 59)).toBe('23:59')
  })
})

describe('to12h / to24h', () => {
  it('gère les cas pièges minuit et midi', () => {
    expect(to12h(0)).toEqual({ hour: 12, meridiem: 'AM' })
    expect(to12h(12)).toEqual({ hour: 12, meridiem: 'PM' })
    expect(to12h(23)).toEqual({ hour: 11, meridiem: 'PM' })
    expect(to24h(12, 'AM')).toBe(0)
    expect(to24h(12, 'PM')).toBe(12)
  })

  it('fait un aller-retour exact sur les 24 heures', () => {
    for (let h = 0; h < 24; h++) {
      const { hour, meridiem } = to12h(h)
      expect(to24h(hour, meridiem)).toBe(h)
    }
  })
})

describe('hourCycleFor', () => {
  it('dérive le cycle de la locale', () => {
    expect(hourCycleFor('fr-FR')).toBe('24h')
    expect(hourCycleFor('en-US')).toBe('12h')
  })

  it('replie sur 24h pour une locale invalide', () => {
    expect(hourCycleFor('not a locale !!')).toBe('24h')
  })
})

describe('formatDisplay', () => {
  it('affiche en 24 h pour fr-FR', () => {
    expect(formatDisplay('19:05', 'fr-FR', '24h')).toBe('19:05')
  })

  it('affiche en 12 h avec méridien pour en-US', () => {
    const text = formatDisplay('19:05', 'en-US', '12h')
    expect(text).toContain('7:05')
    expect(text).toMatch(/PM/)
  })

  it('force le cycle indépendamment de la locale', () => {
    expect(formatDisplay('19:05', 'en-US', '24h')).toBe('19:05')
  })

  it('renvoie une chaîne vide sur entrée invalide', () => {
    expect(formatDisplay('25:00', 'fr-FR', '24h')).toBe('')
  })
})

describe('clampInt / snapMinute', () => {
  it('borne et arrondit', () => {
    expect(clampInt(99, 0, 23)).toBe(23)
    expect(clampInt(-3, 0, 59)).toBe(0)
    expect(clampInt(7.6, 0, 23)).toBe(8)
  })

  it('snap au multiple le plus proche, modulo 60', () => {
    expect(snapMinute(32, 5)).toBe(30)
    expect(snapMinute(58, 5)).toBe(0)
    expect(snapMinute(13, 15)).toBe(15)
    expect(snapMinute(44, 1)).toBe(44)
  })
})

describe('angleToIndex', () => {
  it('résout les quatre points cardinaux (secteur 0 à midi, sens horaire)', () => {
    expect(angleToIndex(0, -1, 12)).toBe(0) // haut
    expect(angleToIndex(1, 0, 12)).toBe(3) // droite
    expect(angleToIndex(0, 1, 12)).toBe(6) // bas
    expect(angleToIndex(-1, 0, 12)).toBe(9) // gauche
  })

  it('arrondit au secteur le plus proche et boucle au voisinage de midi', () => {
    // Juste avant midi côté gauche (~ -1°) : revient au secteur 0, pas 12.
    expect(angleToIndex(-0.01, -1, 12)).toBe(0)
    // Mi-chemin entre 1 h et 2 h (45°) : bascule au secteur supérieur (round).
    expect(angleToIndex(1, -1, 12)).toBe(2)
  })

  it('fonctionne avec 60 segments (minutes)', () => {
    expect(angleToIndex(1, 0, 60)).toBe(15)
    expect(angleToIndex(0, 1, 60)).toBe(30)
  })
})

describe('distanceFraction', () => {
  it('normalise la distance par le rayon', () => {
    expect(distanceFraction(0, 0, 128)).toBe(0)
    expect(distanceFraction(128, 0, 128)).toBe(1)
    expect(distanceFraction(0, 64, 128)).toBe(0.5)
    expect(distanceFraction(10, 10, 0)).toBe(0)
  })

  it('a un seuil intérieur cohérent avec les tokens du cadran', () => {
    expect(DIAL_INNER_THRESHOLD).toBeGreaterThan(0)
    expect(DIAL_INNER_THRESHOLD).toBeLessThan(1)
  })
})

describe('dialIndexToHour24 / hour24ToDial', () => {
  it('mappe le layout M3 : extérieur 12,1..11 — intérieur 00,13..23', () => {
    expect(dialIndexToHour24(0, 'outer')).toBe(12)
    expect(dialIndexToHour24(1, 'outer')).toBe(1)
    expect(dialIndexToHour24(11, 'outer')).toBe(11)
    expect(dialIndexToHour24(0, 'inner')).toBe(0)
    expect(dialIndexToHour24(1, 'inner')).toBe(13)
    expect(dialIndexToHour24(11, 'inner')).toBe(23)
  })

  it('fait un aller-retour exact sur les 24 heures', () => {
    for (let h = 0; h < 24; h++) {
      const { index, ring } = hour24ToDial(h)
      expect(dialIndexToHour24(index, ring)).toBe(h)
    }
  })
})

describe('minutesOf', () => {
  it('convertit une heure valide en minutes depuis minuit', () => {
    expect(minutesOf('00:00')).toBe(0)
    expect(minutesOf('09:15')).toBe(555)
    expect(minutesOf('23:59')).toBe(1439)
  })

  it('rend null sur une heure absente ou invalide', () => {
    expect(minutesOf(null)).toBeNull()
    expect(minutesOf('25:00')).toBeNull()
  })
})

describe('timeList', () => {
  it('couvre la journée entière au pas demandé', () => {
    const half = timeList(30, 'fr-FR', '24h')
    expect(half).toHaveLength(48)
    expect(half[0]?.value).toBe('00:00')
    expect(half.at(-1)?.value).toBe('23:30')
    expect(timeList(15, 'fr-FR', '24h')).toHaveLength(96)
  })

  it('localise les libellés selon le format', () => {
    // Même formatage que le champ (`formatDisplay`) : ce qu'on choisit dans la
    // liste est exactement ce qui s'affichera — d'où « 0:30 » et non « 00:30 ».
    expect(timeList(30, 'fr-FR', '24h')[1]?.label).toBe('0:30')
    expect(timeList(30, 'fr-FR', '24h')[28]?.label).toBe('14:00')
    expect(timeList(60, 'en-US', '12h')[9]?.label).toMatch(/AM/)
  })

  it('replie un pas invalide sur 60 (la liste doit rester finie)', () => {
    expect(timeList(0, 'fr-FR', '24h')).toHaveLength(24)
    expect(timeList(7.5, 'fr-FR', '24h')).toHaveLength(24)
    expect(timeList(90, 'fr-FR', '24h')).toHaveLength(24)
  })
})

describe('masque HH:MM', () => {
  it('pose le deux-points dès que l’heure est complète', () => {
    expect(formatTimeMask('')).toBe('')
    expect(formatTimeMask('0')).toBe('0')
    expect(formatTimeMask('09')).toBe('09:')
    expect(formatTimeMask('093')).toBe('09:3')
    expect(formatTimeMask('0930')).toBe('09:30')
    expect(formatTimeMask('093012')).toBe('09:30') // chiffres surnuméraires ignorés
  })

  it('place le caret en forme close, en franchissant le séparateur à la frappe', () => {
    expect(timeCaret(0)).toBe(0)
    expect(timeCaret(1)).toBe(1)
    expect(timeCaret(2)).toBe(2) // suppression : on reste devant le « : »
    expect(timeCaret(2, true)).toBe(3) // insertion : on entre dans les minutes
    expect(timeCaret(3)).toBe(4)
    expect(timeCaret(4)).toBe(5)
  })

  it('formate une valeur canonique selon le format affiché', () => {
    expect(timeToMask('19:05', '24h')).toBe('19:05')
    expect(timeToMask('19:05', '12h')).toBe('07:05') // le méridien vit hors du masque
    expect(timeToMask('00:30', '12h')).toBe('12:30')
    expect(timeToMask(null, '24h')).toBe('')
  })

  it('parse en 24 h et rejette l’impossible', () => {
    expect(parseTimeMask('09:30', '24h')).toBe('09:30')
    expect(parseTimeMask('0930', '24h')).toBe('09:30')
    expect(parseTimeMask('24:00', '24h')).toBeNull()
    expect(parseTimeMask('09:60', '24h')).toBeNull()
    expect(parseTimeMask('09:3', '24h')).toBeNull() // incomplet
    expect(parseTimeMask('', '24h')).toBeNull()
  })

  it('parse en 12 h avec le méridien du VToggle', () => {
    expect(parseTimeMask('07:00', '12h', 'PM')).toBe('19:00')
    expect(parseTimeMask('12:00', '12h', 'AM')).toBe('00:00')
    expect(parseTimeMask('12:00', '12h', 'PM')).toBe('12:00')
    expect(parseTimeMask('00:30', '12h', 'AM')).toBeNull() // 0 hors de 1–12
    expect(parseTimeMask('13:00', '12h', 'PM')).toBeNull()
  })
})
