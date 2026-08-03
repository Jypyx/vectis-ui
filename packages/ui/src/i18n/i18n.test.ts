import { render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import Calendar from '../components/VCalendar/VCalendar.vue'
import Pagination from '../components/VPagination/VPagination.vue'
import Spinner from '../components/VSpinner/VSpinner.vue'

import { en } from './en'
import { fr } from './fr'
import { DEFAULT_LOCALE, registerMessages, setLocale, useMessages } from './state'
import type { DsMessages } from './types'

// L'état est module-level (comme Toast/state.ts et Icon/resolver.ts) : il
// survit d'un test à l'autre DANS ce fichier. Vitest isolant les modules par
// fichier, aucune fuite vers les tests de composants.
afterEach(() => {
  registerMessages('en', undefined)
  registerMessages('fr', undefined)
  setLocale(DEFAULT_LOCALE)
  vi.restoreAllMocks()
})

const messages = () => useMessages().value
const namespaces = Object.keys(fr) as (keyof DsMessages)[]

describe('parité des dictionnaires', () => {
  // Le typecheck garantit déjà que `en` n'oublie aucune clé (les deux sont
  // ANNOTÉS `: DsMessages`). Ce test couvre ce que le type ne voit pas : un
  // `as` glissé plus tard, une arité de fonction divergente.
  it('fr et en ont exactement les mêmes namespaces', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(fr).sort())
  })

  it.each(namespaces)('fr et en ont les mêmes clés et les mêmes types — %s', (namespace) => {
    const frSection = fr[namespace] as Record<string, unknown>
    const enSection = en[namespace] as Record<string, unknown>

    expect(Object.keys(enSection).sort()).toEqual(Object.keys(frSection).sort())

    for (const [key, frValue] of Object.entries(frSection)) {
      const enValue = enSection[key]
      expect(typeof enValue, `${namespace}.${key}`).toBe(typeof frValue)
      if (typeof frValue === 'function' && typeof enValue === 'function') {
        expect(enValue.length, `arité de ${namespace}.${key}`).toBe(frValue.length)
      } else {
        expect(frValue, `${namespace}.${key} ne doit pas être vide`).not.toBe('')
        expect(enValue, `${namespace}.${key} ne doit pas être vide`).not.toBe('')
      }
    }
  })
})

describe('setLocale', () => {
  it('sert le français par défaut, sans aucun appel', () => {
    expect(messages().common.loading).toBe('Chargement…')
  })

  it('retombe sur le français et avertit quand la langue n’a pas de dictionnaire', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    setLocale('en-GB')
    expect(messages().common.loading).toBe('Chargement…')
    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0]?.[0]).toContain('registerMessages')
  })

  it('sert l’anglais une fois le dictionnaire enregistré', () => {
    registerMessages('en', en)
    setLocale('en')
    expect(messages().common.loading).toBe('Loading…')
    expect(messages().dataTable.range({ start: 1, end: 10, total: 42 })).toBe('1–10 of 42')
  })

  it.each([
    ['en-GB', 'Loading…'],
    ['EN-us', 'Loading…'],
    ['fr-CA', 'Chargement…'],
    ['de-DE', 'Chargement…'],
    ['', 'Chargement…'],
    ['zzz', 'Chargement…'],
  ])('résout %s par sa sous-balise de langue', (locale, expected) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    registerMessages('en', en)
    setLocale(locale)
    expect(messages().common.loading).toBe(expected)
  })
})

describe('registerMessages', () => {
  it('applique une surcharge PARTIELLE sans perdre le reste', () => {
    registerMessages('fr', { common: { loading: 'Patientez…' } })

    expect(messages().common.loading).toBe('Patientez…')
    // même namespace, autre clé
    expect(messages().common.close).toBe('Fermer')
    // autre namespace
    expect(messages().dataTable.empty).toBe('Aucune donnée')
  })

  it('traite les FONCTIONS comme des feuilles, jamais comme des objets à fusionner', () => {
    registerMessages('fr', { dataTable: { empty: 'Rien à afficher' } })

    // La fonction voisine n'a pas été traversée : elle reste appelable.
    expect(messages().dataTable.selection(3)).toBe('3 éléments sélectionnés')
    expect(messages().dataTable.empty).toBe('Rien à afficher')

    // Et une fonction surchargée est bien REMPLACÉE.
    registerMessages('fr', { dataTable: { selection: (count) => `${count} ligne(s)` } })
    expect(messages().dataTable.selection(3)).toBe('3 ligne(s)')
  })

  it('cumule les appels successifs sur une même langue', () => {
    registerMessages('en', en)
    registerMessages('en', { common: { close: 'Dismiss' } })
    setLocale('en')

    expect(messages().common.close).toBe('Dismiss')
    expect(messages().common.loading).toBe('Loading…')
  })

  it('complète une langue partielle par le socle français', () => {
    registerMessages('de', { common: { loading: 'Wird geladen…' } })
    setLocale('de-DE')

    expect(messages().common.loading).toBe('Wird geladen…')
    expect(messages().common.close).toBe('Fermer')
  })

  it('undefined retire la surcharge', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    registerMessages('en', en)
    setLocale('en')
    expect(messages().common.loading).toBe('Loading…')

    registerMessages('en', undefined)
    setLocale('en')
    expect(messages().common.loading).toBe('Chargement…')
    expect(warn).toHaveBeenCalled()
  })

  it('undefined restaure le socle du français', () => {
    registerMessages('fr', { common: { loading: 'Patientez…' } })
    expect(messages().common.loading).toBe('Patientez…')

    registerMessages('fr', undefined)
    expect(messages().common.loading).toBe('Chargement…')
  })

  it('normalise une clé régionale en sous-balise de langue, et avertit', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    registerMessages('en-GB', en)
    setLocale('en-US')

    expect(messages().common.loading).toBe('Loading…')
    expect(warn).toHaveBeenCalledOnce()
  })
})

describe('pluriels et conventions typographiques', () => {
  it('accorde le français au-delà de 1', () => {
    expect(fr.dataTable.selection(0)).toBe('0 élément sélectionné')
    expect(fr.dataTable.selection(1)).toBe('1 élément sélectionné')
    expect(fr.dataTable.selection(2)).toBe('2 éléments sélectionnés')
  })

  it('accorde l’anglais dès 0', () => {
    expect(en.dataTable.selection(0)).toBe('0 items selected')
    expect(en.dataTable.selection(1)).toBe('1 item selected')
    expect(en.dataTable.selection(2)).toBe('2 items selected')
  })

  it('garde l’espace insécable français devant le %, et aucun en anglais', () => {
    expect(fr.progress.percent(50)).toBe('50 %')
    expect(en.progress.percent(50)).toBe('50%')
  })
})

// Tests CANONIQUES du mécanisme — ils valent pour les ~20 composants
// consommateurs et ne sont donc pas dupliqués dans leurs fichiers respectifs.
describe('mécanisme, côté composant', () => {
  it('rafraîchit un composant DÉJÀ MONTÉ quand la locale change', async () => {
    registerMessages('en', en)
    const { container } = render(Spinner)
    expect(container.textContent).toContain('Chargement…')

    setLocale('en')
    await nextTick()

    // Sans le shallowRef de `useMessages`, le texte resterait figé en français.
    expect(container.textContent).toContain('Loading…')
  })

  it('laisse la prop primer sur le dictionnaire', () => {
    registerMessages('en', en)
    setLocale('en')
    const { container } = render(Spinner, { props: { label: 'Merci de patienter' } })

    expect(container.textContent).toContain('Merci de patienter')
  })

  it('laisse l’aria-label du consommateur primer sur la prop et le dictionnaire', () => {
    registerMessages('en', en)
    setLocale('en')

    const { getByRole } = render(Pagination, {
      props: { length: 3, label: 'Prop' },
      attrs: { 'aria-label': 'Attribut' },
    })

    // Précédence complète : aria-label > prop `label` > dictionnaire > fr.
    expect(getByRole('navigation').getAttribute('aria-label')).toBe('Attribut')
  })

  it('sert le dictionnaire quand ni attribut ni prop ne sont posés', () => {
    registerMessages('en', en)
    setLocale('en')

    const { getByRole } = render(Pagination, { props: { length: 3 } })

    expect(getByRole('navigation').getAttribute('aria-label')).toBe('Pagination')
    expect(getByRole('button', { name: 'Previous page' })).toBeTruthy()
  })
})

/* Les formats (noms de mois, 1er jour de semaine, cycle horaire) sont dérivés
   d'`Intl` à partir de la BALISE, indépendamment du dictionnaire : poser une
   locale sans traduction donne déjà des dates correctes. */
describe('locale des composants de date', () => {
  /* Le bouton AFFICHE le mois abrégé ('mars', 'Mar.') ; c'est son aria-label
     qui porte le nom long, plus lisible en assertion. */
  const monthToggle = (r: ReturnType<typeof render>) =>
    r.container.querySelector('.v-calendar-picker-toggle')?.getAttribute('aria-label')

  it('suit la locale globale du DS quand la prop est absente', () => {
    const fr = render(Calendar, { props: { modelValue: '2026-03-15' } })
    expect(monthToggle(fr)).toBe('mars')

    setLocale('en-GB')
    const en = render(Calendar, { props: { modelValue: '2026-03-15' } })
    expect(monthToggle(en)).toBe('March')
  })

  it('laisse la prop `locale` primer sur la locale globale', () => {
    setLocale('en-GB')
    const forced = render(Calendar, {
      props: { modelValue: '2026-03-15', locale: 'de-DE' },
    })
    expect(monthToggle(forced)).toBe('März')
  })

  it('traduit les formats même sans dictionnaire pour cette langue', () => {
    // 'de' n'a aucun dictionnaire : les LIBELLÉS restent français…
    setLocale('de-DE')
    const de = render(Calendar, { props: { modelValue: '2026-03-15' } })
    expect(de.getByRole('button', { name: 'Mois précédent' })).toBeTruthy()
    // …mais le mois, lui, vient d'Intl et suit bien la balise.
    expect(monthToggle(de)).toBe('März')
  })
})
