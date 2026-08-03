import { render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import VCalendar from '../components/VCalendar/VCalendar.vue'
import VPagination from '../components/VPagination/VPagination.vue'
import VSpinner from '../components/VSpinner/VSpinner.vue'

import { en } from './en'
import { fr } from './fr'
import { DEFAULT_LOCALE, registerMessages, setLocale, useMessages } from './state'
import type { VectisMessages } from './types'

// The state is module-level (like VToast/state.ts and VIcon/resolver.ts): it
// survives from one test to the next WITHIN this file. Since Vitest isolates
// modules per file, nothing leaks into the component tests.
afterEach(() => {
  registerMessages('en', undefined)
  registerMessages('fr', undefined)
  setLocale(DEFAULT_LOCALE)
  vi.restoreAllMocks()
})

const messages = () => useMessages().value
const namespaces = Object.keys(en) as (keyof VectisMessages)[]

describe('dictionary parity', () => {
  // The typecheck already guarantees that `fr` forgets no key (both are
  // ANNOTATED `: VectisMessages`). This test covers what the type cannot see: an
  // `as` slipped in later, a divergent function arity.
  it('en and fr have exactly the same namespaces', () => {
    expect(Object.keys(fr).sort()).toEqual(Object.keys(en).sort())
  })

  it.each(namespaces)('en and fr have the same keys and the same types — %s', (namespace) => {
    const enSection = en[namespace] as Record<string, unknown>
    const frSection = fr[namespace] as Record<string, unknown>

    expect(Object.keys(frSection).sort()).toEqual(Object.keys(enSection).sort())

    for (const [key, enValue] of Object.entries(enSection)) {
      const frValue = frSection[key]
      expect(typeof frValue, `${namespace}.${key}`).toBe(typeof enValue)
      if (typeof enValue === 'function' && typeof frValue === 'function') {
        expect(frValue.length, `arity of ${namespace}.${key}`).toBe(enValue.length)
      } else {
        expect(enValue, `${namespace}.${key} must not be empty`).not.toBe('')
        expect(frValue, `${namespace}.${key} must not be empty`).not.toBe('')
      }
    }
  })
})

describe('setLocale', () => {
  it('serves English by default, with no call at all', () => {
    expect(messages().common.loading).toBe('Loading…')
  })

  it('falls back to English and warns when the language has no dictionary', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    setLocale('fr-FR')
    expect(messages().common.loading).toBe('Loading…')
    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0]?.[0]).toContain('registerMessages')
  })

  it('serves French once the dictionary is registered', () => {
    registerMessages('fr', fr)
    setLocale('fr')
    expect(messages().common.loading).toBe('Chargement…')
    expect(messages().dataTable.range({ start: 1, end: 10, total: 42 })).toBe('1–10 sur 42')
  })

  it.each([
    ['fr-FR', 'Chargement…'],
    ['FR-ca', 'Chargement…'],
    ['en-GB', 'Loading…'],
    ['de-DE', 'Loading…'],
    ['', 'Loading…'],
    ['zzz', 'Loading…'],
  ])('resolves %s through its language subtag', (locale, expected) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    registerMessages('fr', fr)
    setLocale(locale)
    expect(messages().common.loading).toBe(expected)
  })
})

describe('registerMessages', () => {
  it('applies a PARTIAL override without losing the rest', () => {
    registerMessages('en', { common: { loading: 'Please wait…' } })

    expect(messages().common.loading).toBe('Please wait…')
    // same namespace, another key
    expect(messages().common.close).toBe('Close')
    // another namespace
    expect(messages().dataTable.empty).toBe('No data')
  })

  it('treats FUNCTIONS as leaves, never as objects to merge', () => {
    registerMessages('en', { dataTable: { empty: 'Nothing to show' } })

    // The neighbouring function was not walked into: it stays callable.
    expect(messages().dataTable.selection(3)).toBe('3 items selected')
    expect(messages().dataTable.empty).toBe('Nothing to show')

    // And an overridden function is indeed REPLACED.
    registerMessages('en', { dataTable: { selection: (count) => `${count} row(s)` } })
    expect(messages().dataTable.selection(3)).toBe('3 row(s)')
  })

  it('accumulates successive calls on the same language', () => {
    registerMessages('fr', fr)
    registerMessages('fr', { common: { close: 'Quitter' } })
    setLocale('fr')

    expect(messages().common.close).toBe('Quitter')
    expect(messages().common.loading).toBe('Chargement…')
  })

  it('completes a partial language with the English base', () => {
    registerMessages('de', { common: { loading: 'Wird geladen…' } })
    setLocale('de-DE')

    expect(messages().common.loading).toBe('Wird geladen…')
    expect(messages().common.close).toBe('Close')
  })

  it('undefined removes the override', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    registerMessages('fr', fr)
    setLocale('fr')
    expect(messages().common.loading).toBe('Chargement…')

    registerMessages('fr', undefined)
    setLocale('fr')
    expect(messages().common.loading).toBe('Loading…')
    expect(warn).toHaveBeenCalled()
  })

  it('undefined restores the English base', () => {
    registerMessages('en', { common: { loading: 'Please wait…' } })
    expect(messages().common.loading).toBe('Please wait…')

    registerMessages('en', undefined)
    expect(messages().common.loading).toBe('Loading…')
  })

  it('normalizes a regional key to a language subtag, and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    registerMessages('fr-CA', fr)
    setLocale('fr-FR')

    expect(messages().common.loading).toBe('Chargement…')
    expect(warn).toHaveBeenCalledOnce()
  })
})

describe('plurals and typographic conventions', () => {
  it('pluralizes English from 0', () => {
    expect(en.dataTable.selection(0)).toBe('0 items selected')
    expect(en.dataTable.selection(1)).toBe('1 item selected')
    expect(en.dataTable.selection(2)).toBe('2 items selected')
  })

  it('pluralizes French beyond 1', () => {
    expect(fr.dataTable.selection(0)).toBe('0 élément sélectionné')
    expect(fr.dataTable.selection(1)).toBe('1 élément sélectionné')
    expect(fr.dataTable.selection(2)).toBe('2 éléments sélectionnés')
  })

  it('keeps no space before the % in English, and the French non-breaking one', () => {
    expect(en.progress.percent(50)).toBe('50%')
    expect(fr.progress.percent(50)).toBe('50 %')
  })
})

// CANONICAL tests of the mechanism — they hold for the ~20 consumer components
// and are therefore not duplicated across their respective files.
describe('mechanism, component side', () => {
  it('refreshes an ALREADY MOUNTED component when the locale changes', async () => {
    registerMessages('fr', fr)
    const { container } = render(VSpinner)
    expect(container.textContent).toContain('Loading…')

    setLocale('fr')
    await nextTick()

    // Without the shallowRef in `useMessages`, the text would stay frozen in English.
    expect(container.textContent).toContain('Chargement…')
  })

  it('lets the prop win over the dictionary', () => {
    registerMessages('fr', fr)
    setLocale('fr')
    const { container } = render(VSpinner, { props: { label: 'Please hold' } })

    expect(container.textContent).toContain('Please hold')
  })

  it("lets the consumer's aria-label win over the prop and the dictionary", () => {
    registerMessages('fr', fr)
    setLocale('fr')

    const { getByRole } = render(VPagination, {
      props: { length: 3, label: 'Prop' },
      attrs: { 'aria-label': 'Attribute' },
    })

    // Full precedence: aria-label > `label` prop > dictionary > en.
    expect(getByRole('navigation').getAttribute('aria-label')).toBe('Attribute')
  })

  it('serves the dictionary when neither attribute nor prop is set', () => {
    registerMessages('fr', fr)
    setLocale('fr')

    const { getByRole } = render(VPagination, { props: { length: 3 } })

    expect(getByRole('navigation').getAttribute('aria-label')).toBe('Pagination')
    expect(getByRole('button', { name: 'Page précédente' })).toBeTruthy()
  })
})

/* Formats (month names, first day of week, hour cycle) are derived from `Intl`
   using the TAG, independently of the dictionary: setting a locale with no
   translation already yields correct dates. */
describe('locale of the date components', () => {
  /* The button DISPLAYS the abbreviated month ('Mar.', 'mars'); it is its
     aria-label that carries the long name, more readable in an assertion. */
  const monthToggle = (r: ReturnType<typeof render>) =>
    r.container.querySelector('.v-calendar-picker-toggle')?.getAttribute('aria-label')

  it('follows the global DS locale when the prop is absent', () => {
    const english = render(VCalendar, { props: { modelValue: '2026-03-15' } })
    expect(monthToggle(english)).toBe('March')

    setLocale('fr-FR')
    const french = render(VCalendar, { props: { modelValue: '2026-03-15' } })
    expect(monthToggle(french)).toBe('mars')
  })

  it('lets the `locale` prop win over the global locale', () => {
    setLocale('fr-FR')
    const forced = render(VCalendar, {
      props: { modelValue: '2026-03-15', locale: 'de-DE' },
    })
    expect(monthToggle(forced)).toBe('März')
  })

  it('translates the formats even without a dictionary for that language', () => {
    // 'de' has no dictionary: the LABELS stay English…
    setLocale('de-DE')
    const de = render(VCalendar, { props: { modelValue: '2026-03-15' } })
    expect(de.getByRole('button', { name: 'Previous month' })).toBeTruthy()
    // …but the month comes from Intl and does follow the tag.
    expect(monthToggle(de)).toBe('März')
  })
})
