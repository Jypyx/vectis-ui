import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import SkeletonLoader from './SkeletonLoader.vue'

/** Racine du composant (elle porte la table des variantes et les dimensions). */
const rootOf = (container: Element) => container.querySelector('.v-skeleton') as HTMLElement

/** Style inline de la racine (les custom properties y sont posées). */
const styleOf = (container: Element) => rootOf(container).getAttribute('style') ?? ''

const itemsOf = (container: Element) => container.querySelectorAll('.v-skeleton-item')

describe('SkeletonLoader', () => {
  it('défauts : forme text, taille md, animation wave, une seule silhouette', () => {
    const { container } = render(SkeletonLoader)
    const root = rootOf(container)

    expect(root.getAttribute('data-shape')).toBe('text')
    expect(root.getAttribute('data-size')).toBe('md')
    expect(root.getAttribute('data-animation')).toBe('wave')
    expect(itemsOf(container)).toHaveLength(1)
  })

  it('porte la classe v-control : sans elle --control-height est indéfinie et la hauteur s’effondre', () => {
    const { container } = render(SkeletonLoader)
    expect(rootOf(container).classList.contains('v-control')).toBe(true)
  })

  it('lines : une silhouette par ligne', async () => {
    const { container, rerender } = render(SkeletonLoader, { props: { lines: 4 } })
    expect(itemsOf(container)).toHaveLength(4)

    await rerender({ lines: 2 })
    expect(itemsOf(container)).toHaveLength(2)
  })

  it('lines est borné à au moins une ligne entière : 0, négatif et décimal', async () => {
    const { container, rerender } = render(SkeletonLoader, { props: { lines: 0 } })
    // `v-for="n in 0"` ne rendrait rien : un skeleton invisible, donc un bug muet
    expect(itemsOf(container)).toHaveLength(1)

    await rerender({ lines: -3 })
    expect(itemsOf(container)).toHaveLength(1)

    await rerender({ lines: 3.7 })
    expect(itemsOf(container)).toHaveLength(3)
  })

  it('shape et animation se reflètent en data-*', async () => {
    const { container, rerender } = render(SkeletonLoader, { props: { shape: 'circle' } })
    expect(rootOf(container).getAttribute('data-shape')).toBe('circle')

    await rerender({ shape: 'surface', animation: 'none' })
    expect(rootOf(container).getAttribute('data-shape')).toBe('surface')
    // l'attribut reste posé : le consommateur peut cibler [data-animation='none']
    expect(rootOf(container).getAttribute('data-animation')).toBe('none')
  })

  it('compact pose data-compact, sinon l’attribut est absent', async () => {
    const { container, rerender } = render(SkeletonLoader)
    expect(rootOf(container).hasAttribute('data-compact')).toBe(false)

    await rerender({ compact: true })
    expect(rootOf(container).hasAttribute('data-compact')).toBe(true)
  })

  it('width/height : nombre → px, chaîne CSS telle quelle, absentes → aucune custom property', async () => {
    const { container, rerender } = render(SkeletonLoader)
    expect(styleOf(container)).not.toContain('--skeleton-w')
    expect(styleOf(container)).not.toContain('--skeleton-h')

    await rerender({ width: 200, height: 48 })
    expect(styleOf(container)).toContain('--skeleton-w: 200px')
    expect(styleOf(container)).toContain('--skeleton-h: 48px')

    // unité libre, contrairement à `px()` : la chaîne n'est pas interprétée
    await rerender({ width: '100%', height: '12ch' })
    expect(styleOf(container)).toContain('--skeleton-w: 100%')
    expect(styleOf(container)).toContain('--skeleton-h: 12ch')
    expect(styleOf(container)).not.toContain('NaN')
  })

  it('color pose data-custom et --custom-color ; sinon ni l’un ni l’autre', async () => {
    const { container, rerender } = render(SkeletonLoader)
    expect(rootOf(container).hasAttribute('data-custom')).toBe(false)
    expect(styleOf(container)).not.toContain('--custom-color')

    await rerender({ color: 'oklch(60% 0.2 250)' })
    expect(rootOf(container).hasAttribute('data-custom')).toBe(true)
    expect(rootOf(container).style.getPropertyValue('--custom-color')).toBe('oklch(60% 0.2 250)')
  })

  it('décoratif par défaut : aria-hidden, aucun rôle, aucun texte', () => {
    const { container, queryByRole } = render(SkeletonLoader)

    expect(rootOf(container).getAttribute('aria-hidden')).toBe('true')
    expect(queryByRole('status')).toBeNull()
    expect(rootOf(container).textContent).toBe('')
  })

  it('announce : role="status", libellé du dictionnaire et aria-hidden retiré', () => {
    const { container, getByRole } = render(SkeletonLoader, { props: { announce: true } })

    expect(getByRole('status').textContent).toContain('Chargement…')
    expect(rootOf(container).hasAttribute('aria-hidden')).toBe(false)
  })

  it('label implique announce et prime sur le dictionnaire', () => {
    const { getByRole } = render(SkeletonLoader, { props: { label: 'Chargement des résultats…' } })
    // `announce` n'est pas fourni : sans l'implication, la prop serait inerte
    expect(getByRole('status').textContent).toContain('Chargement des résultats…')
  })

  it('le libellé masqué est rendu AVANT les silhouettes', () => {
    // Non-régression du sélecteur `.v-skeleton-item + .v-skeleton-item:last-child` :
    // un libellé rendu en dernier ferait cesser le raccourcissement de la
    // dernière ligne sans qu'aucun autre test ne rougisse.
    const { container } = render(SkeletonLoader, { props: { announce: true, lines: 3 } })
    const first = rootOf(container).firstElementChild as HTMLElement

    expect(first.classList.contains('v-visually-hidden')).toBe(true)
    expect(rootOf(container).lastElementChild?.classList.contains('v-skeleton-item')).toBe(true)
  })

  it('fallthrough : class, id et style du consommateur cohabitent avec les custom properties', () => {
    const { container } = render(SkeletonLoader, {
      props: { width: 120 },
      attrs: { class: 'ma-classe', id: 'chargement', style: 'margin-block: 8px' },
    })
    const root = rootOf(container)

    expect(root.classList.contains('ma-classe')).toBe(true)
    expect(root.classList.contains('v-skeleton')).toBe(true)
    expect(root.getAttribute('id')).toBe('chargement')
    expect(styleOf(container)).toContain('margin-block: 8px')
    expect(styleOf(container)).toContain('--skeleton-w: 120px')
  })
})
