import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ProgressLinear from './ProgressLinear.vue'

/** Style inline de la racine (les custom properties y sont posées). */
const styleOf = (container: Element) =>
  container.querySelector('.ds-progress-linear')?.getAttribute('style') ?? ''

/** Le pourcentage est rendu avec une espace insécable (typographie française). */
const NBSP = ' '

describe('ProgressLinear', () => {
  it('contrat ARIA : rôle, bornes fidèles et fraction unitless', () => {
    const { getByRole, container } = render(ProgressLinear, {
      props: { value: 30, max: 60 },
      attrs: { 'aria-label': 'Progression' },
    })
    const bar = getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('30')
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    // borne haute fidèle (« 30 sur 60 »), pas de normalisation sur 100
    expect(bar.getAttribute('aria-valuemax')).toBe('60')
    expect(styleOf(container)).toContain('--fill-fraction: 0.5')
  })

  it('clampe au-dessus du max', () => {
    const { getByRole, container } = render(ProgressLinear, {
      props: { value: 250, max: 100 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
    expect(styleOf(container)).toContain('--fill-fraction: 1')
  })

  it('clampe en dessous de zéro', () => {
    const { getByRole, container } = render(ProgressLinear, {
      props: { value: -10 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')
    expect(styleOf(container)).toContain('--fill-fraction: 0')
  })

  it('max: 0 ne produit ni NaN ni Infinity', () => {
    const { container } = render(ProgressLinear, {
      props: { value: 10, max: 0 },
      attrs: { 'aria-label': 'x' },
    })
    const style = styleOf(container)
    expect(style).toContain('--fill-fraction: 0')
    expect(style).not.toContain('NaN')
    expect(style).not.toContain('Infinity')
  })

  it('indéterminé : pas d’aria-valuenow, data-indeterminate, --fill-fraction toujours posée', () => {
    const { getByRole, container } = render(ProgressLinear, {
      props: { indeterminate: true },
      attrs: { 'aria-label': 'Chargement' },
    })
    const bar = getByRole('progressbar')
    expect(bar.hasAttribute('aria-valuenow')).toBe(false)
    expect(bar.hasAttribute('data-indeterminate')).toBe(true)
    // toujours posée, sinon calc(100% * var(--fill-fraction)) serait invalide
    expect(styleOf(container)).toContain('--fill-fraction: 0')
  })

  it('indéterminé : showValue est ignoré (aucun texte rendu)', () => {
    const { container } = render(ProgressLinear, {
      props: { indeterminate: true, showValue: true },
      attrs: { 'aria-label': 'x' },
    })
    expect(container.querySelectorAll('.ds-progress-linear-text')).toHaveLength(0)
  })

  it('tone : accent par défaut, valeur explicite reportée', async () => {
    const { getByRole, rerender } = render(ProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('data-tone')).toBe('accent')
    await rerender({ tone: 'warning' })
    expect(getByRole('progressbar').getAttribute('data-tone')).toBe('warning')
  })

  it('couleur custom : data-custom + --custom-color (absents sinon)', async () => {
    const { getByRole, container, rerender } = render(ProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').hasAttribute('data-custom')).toBe(false)
    expect(styleOf(container)).not.toContain('--custom-color')
    await rerender({ color: 'hotpink' })
    expect(getByRole('progressbar').hasAttribute('data-custom')).toBe(true)
    expect(styleOf(container)).toContain('--custom-color: hotpink')
  })

  it('thickness : number → px, string telle quelle, absente si non fournie', async () => {
    const { container, rerender } = render(ProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(styleOf(container)).not.toContain('--progress-thickness')
    await rerender({ thickness: 12 })
    expect(styleOf(container)).toContain('--progress-thickness: 12px')
    // string numérique : même résultat, toujours des pixels
    await rerender({ thickness: '12' })
    expect(styleOf(container)).toContain('--progress-thickness: 12px')
    // valeur non numérique : ignorée plutôt que custom property invalide
    await rerender({ thickness: 'auto' })
    expect(styleOf(container)).not.toContain('--progress-thickness')
  })

  it('shape : rounded par défaut, square reporté', async () => {
    const { getByRole, rerender } = render(ProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('data-shape')).toBe('rounded')
    await rerender({ shape: 'square' })
    expect(getByRole('progressbar').getAttribute('data-shape')).toBe('square')
  })

  it('orientation : data-orientation posé uniquement en vertical', async () => {
    const { getByRole, rerender } = render(ProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').hasAttribute('data-orientation')).toBe(false)
    await rerender({ orientation: 'vertical' })
    expect(getByRole('progressbar').getAttribute('data-orientation')).toBe('vertical')
  })

  it('showValue : deux copies du texte, seule la clippée est aria-hidden', () => {
    const { container } = render(ProgressLinear, {
      props: { value: 50, showValue: true },
      attrs: { 'aria-label': 'x' },
    })
    const copies = [...container.querySelectorAll('.ds-progress-linear-text')]
    expect(copies).toHaveLength(2)
    for (const copy of copies) expect(copy.textContent?.trim()).toBe(`50${NBSP}%`)
    // copie de base : annoncée par personne (children presentational) mais non masquée
    expect(copies[0]!.hasAttribute('data-on-fill')).toBe(false)
    expect(copies[0]!.hasAttribute('aria-hidden')).toBe(false)
    // copie contrastée : duplique du texte visible → masquée
    expect(copies[1]!.hasAttribute('data-on-fill')).toBe(true)
    expect(copies[1]!.getAttribute('aria-hidden')).toBe('true')
  })

  it('DOM minimal : la racine EST la piste, le remplissage son seul enfant', () => {
    const { getByRole, container } = render(ProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    const root = getByRole('progressbar')
    expect(root.classList.contains('ds-progress-linear')).toBe(true)
    // pas d'élément de piste intermédiaire
    expect(container.querySelector('.ds-progress-linear-track')).toBeNull()
    expect(root.children).toHaveLength(1)
    expect(root.firstElementChild!.classList.contains('ds-progress-linear-fill')).toBe(true)
  })

  it('showValue : le pourcentage est arrondi et dérivé de max', () => {
    const { container } = render(ProgressLinear, {
      props: { value: 1, max: 3, showValue: true },
      attrs: { 'aria-label': 'x' },
    })
    expect(container.querySelector('.ds-progress-linear-text')?.textContent?.trim()).toBe(
      `33${NBSP}%`,
    )
  })

  it('slot scopé : reçoit value/max/percent et prime sur showValue', () => {
    const { container } = render(ProgressLinear, {
      props: { value: 30, max: 60, showValue: true },
      attrs: { 'aria-label': 'x' },
      slots: {
        default: '<template #default="s">{{ s.value }}/{{ s.max }} — {{ s.percent }}</template>',
      },
    })
    const copies = [...container.querySelectorAll('.ds-progress-linear-text')]
    expect(copies).toHaveLength(2)
    for (const copy of copies) expect(copy.textContent?.trim()).toBe('30/60 — 50')
  })

  it('le slot seul suffit à rendre le texte (sans showValue)', () => {
    const { container } = render(ProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
      slots: { default: 'Envoi…' },
    })
    const copies = [...container.querySelectorAll('.ds-progress-linear-text')]
    expect(copies).toHaveLength(2)
    for (const copy of copies) expect(copy.textContent?.trim()).toBe('Envoi…')
  })

  it('sans showValue ni slot : aucun texte rendu', () => {
    const { container } = render(ProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(container.querySelectorAll('.ds-progress-linear-text')).toHaveLength(0)
  })

  it('vertical : le texte est rendu comme en horizontal', () => {
    const { container } = render(ProgressLinear, {
      props: { value: 40, orientation: 'vertical', showValue: true },
      attrs: { 'aria-label': 'x' },
    })
    expect(container.querySelectorAll('.ds-progress-linear-text')).toHaveLength(2)
  })

  it('valuePosition : center par défaut, valeur explicite reportée', async () => {
    const { getByRole, rerender } = render(ProgressLinear, {
      props: { value: 40, showValue: true },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('data-value-position')).toBe('center')
    await rerender({ valuePosition: 'end' })
    expect(getByRole('progressbar').getAttribute('data-value-position')).toBe('end')
  })

  it('fallthrough : class, id et style du consommateur cohabitent avec les custom properties', () => {
    const { getByRole } = render(ProgressLinear, {
      props: { value: 40 },
      attrs: { 'aria-label': 'Envoi', class: 'mon-upload', id: 'up', style: 'margin-top: 4px' },
    })
    const bar = getByRole('progressbar', { name: 'Envoi' })
    expect(bar.classList.contains('ds-progress-linear')).toBe(true)
    expect(bar.classList.contains('mon-upload')).toBe(true)
    expect(bar.id).toBe('up')
    const style = bar.getAttribute('style') ?? ''
    expect(style).toContain('margin-top: 4px')
    expect(style).toContain('--fill-fraction: 0.4')
  })
})
