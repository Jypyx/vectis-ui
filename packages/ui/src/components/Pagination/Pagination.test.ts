import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Pagination from './Pagination.vue'

/** Libellés des pastilles de page, dans l'ordre du DOM. */
function pageLabels(container: Element): string[] {
  return [...container.querySelectorAll('.ds-pagination-page')].map(
    (el) => el.textContent?.trim() ?? '',
  )
}

describe('Pagination', () => {
  describe('fenêtre glissante', () => {
    it('encadre la page courante de ses voisines, garde les bornes et intercale deux ellipses', () => {
      const { container } = render(Pagination, { props: { count: 20, modelValue: 10 } })

      expect(pageLabels(container)).toEqual(['1', '9', '10', '11', '20'])
      expect(container.querySelectorAll('.ds-pagination-ellipsis')).toHaveLength(2)
    })

    it("n'intercale aucune ellipse quand toutes les pages tiennent dans la fenêtre", () => {
      const { container } = render(Pagination, { props: { count: 4, modelValue: 2 } })

      expect(pageLabels(container)).toEqual(['1', '2', '3', '4'])
      expect(container.querySelectorAll('.ds-pagination-ellipsis')).toHaveLength(0)
    })

    it('élargit la fenêtre avec siblingCount', () => {
      const { container } = render(Pagination, {
        props: { count: 20, modelValue: 10, siblingCount: 2 },
      })

      expect(pageLabels(container)).toEqual(['1', '8', '9', '10', '11', '12', '20'])
    })

    it('élargit les extrémités avec boundaryCount', () => {
      const { container } = render(Pagination, {
        props: { count: 20, modelValue: 10, boundaryCount: 2 },
      })

      expect(pageLabels(container)).toEqual(['1', '2', '9', '10', '11', '19', '20'])
    })

    it('marque les bornes en data-edge et les voisines de leur distance à la page courante', () => {
      const { container } = render(Pagination, { props: { count: 20, modelValue: 10 } })
      const [first, before, current, after, last] = [
        ...container.querySelectorAll<HTMLElement>('.ds-pagination-page'),
      ]

      expect(first?.hasAttribute('data-edge')).toBe(true)
      expect(last?.hasAttribute('data-edge')).toBe(true)
      expect(before?.dataset.distance).toBe('1')
      expect(after?.dataset.distance).toBe('1')
      // la page courante n'est jamais masquable
      expect(current?.hasAttribute('data-distance')).toBe(false)
    })
  })

  describe('v-model', () => {
    it('émet la page cliquée', async () => {
      const { getByRole, emitted } = render(Pagination, { props: { count: 20, modelValue: 10 } })

      await fireEvent.click(getByRole('button', { name: 'Page 11' }))

      expect(emitted('update:modelValue')).toEqual([[11]])
    })

    it('avance et recule d’une page avec les contrôles', async () => {
      const next = render(Pagination, { props: { count: 20, modelValue: 10 } })
      await fireEvent.click(next.getByRole('button', { name: 'Page suivante' }))
      expect(next.emitted('update:modelValue')).toEqual([[11]])
      next.unmount()

      const previous = render(Pagination, { props: { count: 20, modelValue: 10 } })
      await fireEvent.click(previous.getByRole('button', { name: 'Page précédente' }))
      expect(previous.emitted('update:modelValue')).toEqual([[9]])
    })

    it('désactive le contrôle en butée à chaque extrémité', () => {
      const first = render(Pagination, { props: { count: 5, modelValue: 1 } })
      expect(
        (first.getByRole('button', { name: 'Page précédente' }) as HTMLButtonElement).disabled,
      ).toBe(true)
      expect(
        (first.getByRole('button', { name: 'Page suivante' }) as HTMLButtonElement).disabled,
      ).toBe(false)
      first.unmount()

      const last = render(Pagination, { props: { count: 5, modelValue: 5 } })
      expect(
        (last.getByRole('button', { name: 'Page suivante' }) as HTMLButtonElement).disabled,
      ).toBe(true)
    })
  })

  describe('accessibilité', () => {
    it('pose aria-current="page" sur la seule page active', () => {
      const { container, getByRole } = render(Pagination, { props: { count: 20, modelValue: 10 } })

      expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
      expect(getByRole('button', { name: 'Page 10' }).getAttribute('aria-current')).toBe('page')
    })

    it('nomme la navigation et accepte un libellé de page personnalisé', () => {
      const { getByRole } = render(Pagination, {
        props: {
          count: 5,
          modelValue: 2,
          label: 'Résultats',
          pageLabel: (n: number) => `Aller à la page ${n}`,
        },
      })

      expect(getByRole('navigation').getAttribute('aria-label')).toBe('Résultats')
      expect(getByRole('button', { name: 'Aller à la page 3' })).toBeTruthy()
    })

    it("masque l'ellipse aux technologies d'assistance et la sort de la tabulation", () => {
      const { container } = render(Pagination, { props: { count: 20, modelValue: 10 } })
      const ellipsis = container.querySelector<HTMLButtonElement>('.ds-pagination-ellipsis')

      expect(ellipsis?.getAttribute('aria-hidden')).toBe('true')
      expect(ellipsis?.disabled).toBe(true)
    })
  })

  describe('pages désactivées', () => {
    // l'inertie elle-même est native (<button disabled>, fourni par Button) :
    // jsdom la contourne en dispatchant l'événement, on n'asserte donc que le marquage
    it('accepte une liste', () => {
      const { getByRole } = render(Pagination, {
        props: { count: 5, modelValue: 2, disabledPages: [3] },
      })

      expect((getByRole('button', { name: 'Page 3' }) as HTMLButtonElement).disabled).toBe(true)
      expect((getByRole('button', { name: 'Page 2' }) as HTMLButtonElement).disabled).toBe(false)
    })

    it('accepte un prédicat', () => {
      const { getByRole } = render(Pagination, {
        props: { count: 5, modelValue: 1, boundaryCount: 3, disabledPages: (n: number) => n > 3 },
      })

      expect((getByRole('button', { name: 'Page 2' }) as HTMLButtonElement).disabled).toBe(false)
      expect((getByRole('button', { name: 'Page 4' }) as HTMLButtonElement).disabled).toBe(true)
    })

    it('enjambe les pages désactivées avec les contrôles', async () => {
      const { getByRole, emitted } = render(Pagination, {
        props: { count: 5, modelValue: 3, disabledPages: [2] },
      })

      await fireEvent.click(getByRole('button', { name: 'Page précédente' }))

      expect(emitted('update:modelValue')).toEqual([[1]])
    })

    it('désactive tout le composant avec disabled', () => {
      const { container } = render(Pagination, {
        props: { count: 5, modelValue: 3, disabled: true },
      })
      const buttons = [...container.querySelectorAll<HTMLButtonElement>('button')]

      expect(buttons.every((el) => el.disabled)).toBe(true)
    })
  })

  describe('attached', () => {
    it('rattache les boutons dans un ButtonGroup', () => {
      const { container, getByRole } = render(Pagination, {
        props: { count: 5, modelValue: 1, attached: true },
      })

      expect(container.querySelector('.ds-pagination-items')?.classList).toContain(
        'ds-button-group',
      )
      expect(getByRole('group')).toBeTruthy()
    })

    it('reste une simple rangée par défaut', () => {
      const { container, queryByRole } = render(Pagination, { props: { count: 5, modelValue: 1 } })

      expect(container.querySelector('.ds-button-group')).toBeNull()
      expect(queryByRole('group')).toBeNull()
    })
  })

  describe('contrôles', () => {
    it("n'affiche aucun contrôle avec showControls: false", () => {
      const { container } = render(Pagination, {
        props: { count: 5, modelValue: 3, showControls: false },
      })

      expect(container.querySelectorAll('.ds-pagination-control')).toHaveLength(0)
    })

    it('rend un libellé visible en mode text, sans icône', () => {
      const { container } = render(Pagination, {
        props: { count: 5, modelValue: 3, controlsDisplay: 'text' },
      })
      const control = container.querySelector('.ds-pagination-control')

      expect(control?.querySelector('.ds-pagination-control-label')?.textContent).toBe(
        'Page précédente',
      )
      expect(control?.querySelector('.ds-icon')).toBeNull()
    })

    it('cumule icône et libellé en mode both', () => {
      const { container } = render(Pagination, {
        props: { count: 5, modelValue: 3, controlsDisplay: 'both' },
      })
      const control = container.querySelector('.ds-pagination-control')

      expect(control?.querySelector('.ds-pagination-control-label')).toBeTruthy()
      expect(control?.querySelector('.ds-icon')).toBeTruthy()
    })

    it('garde le nom accessible même quand le libellé est visible', () => {
      const { getByRole } = render(Pagination, {
        props: { count: 5, modelValue: 3, controlsDisplay: 'both' },
      })

      expect(getByRole('button', { name: 'Page précédente' })).toBeTruthy()
    })

    it('accepte un nom Material ou une URL pour les icônes personnalisées', () => {
      const { container } = render(Pagination, {
        props: {
          count: 5,
          modelValue: 3,
          prevIcon: 'first_page',
          nextIcon: 'https://cdn.test/next.svg',
        },
      })
      const [prev, next] = [...container.querySelectorAll('.ds-pagination-control')]

      expect(prev?.querySelector('.ds-icon-symbol')?.textContent).toBe('first_page')
      expect(next?.querySelector('.ds-icon-img')?.getAttribute('src')).toBe(
        'https://cdn.test/next.svg',
      )
    })

    it('reprend les libellés personnalisés', () => {
      const { getByRole } = render(Pagination, {
        props: { count: 5, modelValue: 3, prevLabel: 'Précédent', nextLabel: 'Suivant' },
      })

      expect(getByRole('button', { name: 'Suivant' })).toBeTruthy()
    })
  })

  describe('taille', () => {
    it('propage size et compact à tous les boutons', () => {
      const { container } = render(Pagination, {
        props: { count: 20, modelValue: 10, size: 'sm', compact: true },
      })
      const buttons = [...container.querySelectorAll<HTMLElement>('.ds-button')]

      expect(buttons.every((el) => el.dataset.size === 'sm')).toBe(true)
      expect(buttons.every((el) => el.hasAttribute('data-compact'))).toBe(true)
    })

    it('rend la page active en solid et les autres dans la variante demandée', () => {
      const { container } = render(Pagination, {
        props: { count: 5, modelValue: 3, variant: 'outline' },
      })
      const pages = [...container.querySelectorAll<HTMLElement>('.ds-pagination-page')]

      expect(pages[2]?.dataset.variant).toBe('solid')
      expect(pages[2]?.dataset.tone).toBe('accent')
      expect(pages[0]?.dataset.variant).toBe('outline')
      expect(pages[0]?.dataset.tone).toBe('neutral')
    })
  })

  describe('navigation clavier', () => {
    it('déplace le focus avec les flèches sans changer de page', async () => {
      const { container, getByRole, emitted } = render(Pagination, {
        props: { count: 20, modelValue: 10 },
      })
      const pages = [...container.querySelectorAll<HTMLElement>('.ds-pagination-page')]
      pages[1]?.focus()

      await fireEvent.keyDown(getByRole('navigation'), { key: 'ArrowRight' })

      expect(document.activeElement).toBe(pages[2])
      expect(emitted('update:modelValue')).toBeUndefined()
    })

    it('boucle en arrière et saute aux extrémités avec Home/End', async () => {
      const { container, getByRole } = render(Pagination, {
        props: { count: 20, modelValue: 10 },
      })
      const nav = getByRole('navigation')
      const pages = [...container.querySelectorAll<HTMLElement>('.ds-pagination-page')]
      pages[0]?.focus()

      await fireEvent.keyDown(nav, { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(pages[pages.length - 1])

      await fireEvent.keyDown(nav, { key: 'Home' })
      expect(document.activeElement).toBe(pages[0])

      await fireEvent.keyDown(nav, { key: 'End' })
      expect(document.activeElement).toBe(pages[pages.length - 1])
    })

    it('ignore les pages désactivées', async () => {
      const { container, getByRole } = render(Pagination, {
        props: { count: 5, modelValue: 1, boundaryCount: 3, disabledPages: [2] },
      })
      const pages = [...container.querySelectorAll<HTMLElement>('.ds-pagination-page')]
      pages[0]?.focus()

      await fireEvent.keyDown(getByRole('navigation'), { key: 'ArrowRight' })

      expect(document.activeElement).toBe(pages[2])
    })
  })

  describe('cas limites', () => {
    it('rend une seule pastille pour une page unique, contrôles en butée', () => {
      const { container, getByRole } = render(Pagination, { props: { count: 1, modelValue: 1 } })

      expect(pageLabels(container)).toEqual(['1'])
      expect((getByRole('button', { name: 'Page suivante' }) as HTMLButtonElement).disabled).toBe(
        true,
      )
    })

    it('borne une page courante hors limites', () => {
      const { getByRole } = render(Pagination, { props: { count: 5, modelValue: 99 } })

      expect(getByRole('button', { name: 'Page 5' }).getAttribute('aria-current')).toBe('page')
    })
  })
})
