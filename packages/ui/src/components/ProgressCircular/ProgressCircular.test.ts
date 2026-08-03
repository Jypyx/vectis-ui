import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ProgressCircular from './ProgressCircular.vue'

/** Style inline de la racine (les custom properties y sont posées). */
const styleOf = (container: Element) =>
  container.querySelector('.ds-progress-circular')?.getAttribute('style') ?? ''

/** Le pourcentage est rendu avec une espace insécable (typographie française). */
const NBSP = ' '

describe('ProgressCircular', () => {
  it('contrat ARIA : rôle, bornes fidèles et fraction unitless', () => {
    const { getByRole, container } = render(ProgressCircular, {
      props: { value: 30, max: 60 },
      attrs: { 'aria-label': 'Envoi' },
    })
    const bar = getByRole('progressbar', { name: 'Envoi' })
    expect(bar.getAttribute('aria-valuenow')).toBe('30')
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    // borne haute fidèle, pas de normalisation sur 100
    expect(bar.getAttribute('aria-valuemax')).toBe('60')
    expect(styleOf(container)).toContain('--fill-fraction: 0.5')
  })

  it('clampe au-dessus du max et en dessous de zéro', async () => {
    const { getByRole, container, rerender } = render(ProgressCircular, {
      props: { value: 250, max: 100 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
    expect(styleOf(container)).toContain('--fill-fraction: 1')
    await rerender({ value: -10 })
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')
    expect(styleOf(container)).toContain('--fill-fraction: 0')
  })

  it('max: 0 ne produit ni NaN ni Infinity', () => {
    const { container } = render(ProgressCircular, {
      props: { value: 10, max: 0 },
      attrs: { 'aria-label': 'x' },
    })
    const style = styleOf(container)
    expect(style).toContain('--fill-fraction: 0')
    expect(style).not.toContain('NaN')
    expect(style).not.toContain('Infinity')
  })

  it('indéterminé : pas d’aria-valuenow, data-indeterminate, aucun label', () => {
    const { getByRole, container } = render(ProgressCircular, {
      props: { indeterminate: true, showValue: true },
      attrs: { 'aria-label': 'Chargement' },
    })
    const bar = getByRole('progressbar')
    expect(bar.hasAttribute('aria-valuenow')).toBe(false)
    expect(bar.hasAttribute('data-indeterminate')).toBe(true)
    expect(container.querySelector('.ds-progress-circular-label')).toBeNull()
    // toujours posée, sinon le calc() du dashoffset serait invalide
    expect(styleOf(container)).toContain('--fill-fraction: 0')
  })

  it('size et thickness : number → px, string telle quelle, absentes si non fournies', async () => {
    const { container, rerender } = render(ProgressCircular, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(styleOf(container)).not.toContain('--progress-diameter')
    expect(styleOf(container)).not.toContain('--progress-thickness')
    await rerender({ size: 96, thickness: 8 })
    expect(styleOf(container)).toContain('--progress-diameter: 96px')
    expect(styleOf(container)).toContain('--progress-thickness: 8px')
    // strings numériques : même résultat, toujours des pixels
    await rerender({ size: '96', thickness: '8' })
    expect(styleOf(container)).toContain('--progress-diameter: 96px')
    expect(styleOf(container)).toContain('--progress-thickness: 8px')
    // valeurs non numériques : ignorées plutôt que custom properties invalides
    await rerender({ size: 'auto', thickness: 'auto' })
    expect(styleOf(container)).not.toContain('--progress-diameter')
    expect(styleOf(container)).not.toContain('--progress-thickness')
  })

  it('shape : rounded par défaut, square reporté', async () => {
    const { getByRole, rerender } = render(ProgressCircular, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('data-shape')).toBe('rounded')
    await rerender({ shape: 'square' })
    expect(getByRole('progressbar').getAttribute('data-shape')).toBe('square')
  })

  it('SVG décoratif : aria-hidden et pathLength normalisé sur les deux cercles', () => {
    const { container } = render(ProgressCircular, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(container.querySelector('.ds-progress-circular-svg')!.getAttribute('aria-hidden')).toBe(
      'true',
    )
    const circles = [...container.querySelectorAll('circle')]
    expect(circles).toHaveLength(2)
    for (const circle of circles) expect(circle.getAttribute('pathLength')).toBe('100')
  })

  it('tone et couleur custom', async () => {
    const { getByRole, container, rerender } = render(ProgressCircular, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x' },
    })
    expect(getByRole('progressbar').getAttribute('data-tone')).toBe('accent')
    expect(getByRole('progressbar').hasAttribute('data-custom')).toBe(false)
    await rerender({ tone: 'success', color: 'hotpink' })
    expect(getByRole('progressbar').getAttribute('data-tone')).toBe('success')
    expect(getByRole('progressbar').hasAttribute('data-custom')).toBe(true)
    expect(styleOf(container)).toContain('--custom-color: hotpink')
  })

  it('showValue : un seul label centré, non masqué', () => {
    const { container } = render(ProgressCircular, {
      props: { value: 65, showValue: true },
      attrs: { 'aria-label': 'x' },
    })
    const labels = [...container.querySelectorAll('.ds-progress-circular-label')]
    expect(labels).toHaveLength(1)
    expect(labels[0]!.textContent?.trim()).toBe(`65${NBSP}%`)
    expect(labels[0]!.hasAttribute('aria-hidden')).toBe(false)
  })

  it('slot scopé : reçoit value/max/percent et prime sur showValue', () => {
    const { container } = render(ProgressCircular, {
      props: { value: 3, max: 8, showValue: true },
      attrs: { 'aria-label': 'x' },
      slots: {
        default:
          '<template #default="s">{{ s.value }}/{{ s.max }} — {{ Math.round(s.percent) }}</template>',
      },
    })
    const labels = [...container.querySelectorAll('.ds-progress-circular-label')]
    expect(labels).toHaveLength(1)
    expect(labels[0]!.textContent?.trim()).toBe('3/8 — 38')
  })

  it('non-régression d’API : nom par fallthrough, plus de --vectis-progress-value', () => {
    const { getByRole, container } = render(ProgressCircular, {
      props: { value: 40 },
      attrs: { 'aria-label': 'Nom par fallthrough' },
    })
    // le nom vient d'aria-label en fallthrough, pas d'une prop `label` dédiée
    expect(getByRole('progressbar', { name: 'Nom par fallthrough' })).toBeTruthy()
    // la fraction est une custom property PRIVÉE : rien de public n'est exposé
    expect(styleOf(container)).not.toContain('--vectis-progress-value')
  })

  it('fallthrough : class, id et style du consommateur cohabitent avec les custom properties', () => {
    const { getByRole } = render(ProgressCircular, {
      props: { value: 40 },
      attrs: { 'aria-label': 'x', class: 'mon-donut', id: 'donut', style: 'margin: 4px' },
    })
    const bar = getByRole('progressbar')
    expect(bar.classList.contains('ds-progress-circular')).toBe(true)
    expect(bar.classList.contains('mon-donut')).toBe(true)
    expect(bar.id).toBe('donut')
    const style = bar.getAttribute('style') ?? ''
    expect(style).toContain('margin: 4px')
    expect(style).toContain('--fill-fraction: 0.4')
  })
})
