import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VPagination from './VPagination.vue'

/** Libellés des pastilles de page, dans l'ordre du DOM. */
function pageLabels(container: Element): string[] {
  return [...container.querySelectorAll('.v-pagination-page')].map(
    (el) => el.textContent?.trim() ?? '',
  )
}

/** Nombre total d'emplacements rendus : pastilles + ellipses. */
function slotCount(container: Element): number {
  return container.querySelectorAll('.v-pagination-page, .v-pagination-ellipsis').length
}

describe('VPagination', () => {
  describe('troncature logique', () => {
    it('rend toutes les pages quand totalVisible est absente', () => {
      const { container } = render(VPagination, { props: { length: 8, modelValue: 2 } })

      expect(pageLabels(container)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8'])
      expect(container.querySelectorAll('.v-pagination-ellipsis')).toHaveLength(0)
    })

    it('encadre la page courante, garde les bornes et intercale deux ellipses', () => {
      const { container } = render(VPagination, {
        props: { length: 20, modelValue: 10, totalVisible: 7 },
      })

      expect(pageLabels(container)).toEqual(['1', '9', '10', '11', '20'])
      expect(container.querySelectorAll('.v-pagination-ellipsis')).toHaveLength(2)
    })

    it('garde un nombre d’emplacements constant en décalant la fenêtre aux extrémités', () => {
      const cases: Array<[number, string[]]> = [
        [1, ['1', '2', '3', '4', '5', '20']],
        [10, ['1', '9', '10', '11', '20']],
        [18, ['1', '16', '17', '18', '19', '20']],
      ]
      for (const [current, expected] of cases) {
        const { container, unmount } = render(VPagination, {
          props: { length: 20, modelValue: current, totalVisible: 7 },
        })

        expect(pageLabels(container)).toEqual(expected)
        // ellipses comprises : la barre garde exactement la même largeur
        expect(slotCount(container)).toBe(7)
        unmount()
      }
    })

    it("n'intercale aucune ellipse quand totalVisible couvre toutes les pages", () => {
      const { container } = render(VPagination, {
        props: { length: 4, modelValue: 2, totalVisible: 10 },
      })

      expect(pageLabels(container)).toEqual(['1', '2', '3', '4'])
      expect(container.querySelectorAll('.v-pagination-ellipsis')).toHaveLength(0)
    })

    it('clampe totalVisible au minimum utile de 5', () => {
      const { container } = render(VPagination, {
        props: { length: 20, modelValue: 10, totalVisible: 3 },
      })

      expect(pageLabels(container)).toEqual(['1', '10', '20'])
      expect(slotCount(container)).toBe(5)
    })

    it('marque les bornes en data-edge et les voisines de leur distance à la page courante', () => {
      const { container } = render(VPagination, {
        props: { length: 20, modelValue: 10, totalVisible: 7 },
      })
      const [first, before, current, after, last] = [
        ...container.querySelectorAll<HTMLElement>('.v-pagination-page'),
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
      const { getByRole, emitted } = render(VPagination, { props: { length: 20, modelValue: 10 } })

      await fireEvent.click(getByRole('button', { name: 'Page 11' }))

      expect(emitted('update:modelValue')).toEqual([[11]])
    })

    it('avance et recule d’une page avec les contrôles', async () => {
      const next = render(VPagination, { props: { length: 20, modelValue: 10 } })
      await fireEvent.click(next.getByRole('button', { name: 'Page suivante' }))
      expect(next.emitted('update:modelValue')).toEqual([[11]])
      next.unmount()

      const previous = render(VPagination, { props: { length: 20, modelValue: 10 } })
      await fireEvent.click(previous.getByRole('button', { name: 'Page précédente' }))
      expect(previous.emitted('update:modelValue')).toEqual([[9]])
    })

    it('désactive le contrôle en butée à chaque extrémité', () => {
      const first = render(VPagination, { props: { length: 5, modelValue: 1 } })
      expect(
        (first.getByRole('button', { name: 'Page précédente' }) as HTMLButtonElement).disabled,
      ).toBe(true)
      expect(
        (first.getByRole('button', { name: 'Page suivante' }) as HTMLButtonElement).disabled,
      ).toBe(false)
      first.unmount()

      const last = render(VPagination, { props: { length: 5, modelValue: 5 } })
      expect(
        (last.getByRole('button', { name: 'Page suivante' }) as HTMLButtonElement).disabled,
      ).toBe(true)
    })
  })

  describe('accessibilité', () => {
    it('pose aria-current="page" sur la seule page active', () => {
      const { container, getByRole } = render(VPagination, {
        props: { length: 20, modelValue: 10 },
      })

      expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
      expect(getByRole('button', { name: 'Page 10' }).getAttribute('aria-current')).toBe('page')
    })

    it('nomme la navigation et accepte un libellé de page personnalisé', () => {
      const { getByRole } = render(VPagination, {
        props: {
          length: 5,
          modelValue: 2,
          label: 'Résultats',
          pageLabel: (n: number) => `Aller à la page ${n}`,
        },
      })

      expect(getByRole('navigation').getAttribute('aria-label')).toBe('Résultats')
      expect(getByRole('button', { name: 'Aller à la page 3' })).toBeTruthy()
    })

    it("masque l'ellipse aux technologies d'assistance et la sort de la tabulation", () => {
      const { container } = render(VPagination, {
        props: { length: 20, modelValue: 10, totalVisible: 7 },
      })
      const ellipsis = container.querySelector<HTMLButtonElement>('.v-pagination-ellipsis')

      expect(ellipsis?.getAttribute('aria-hidden')).toBe('true')
      expect(ellipsis?.disabled).toBe(true)
    })
  })

  describe('pages désactivées', () => {
    // l'inertie elle-même est native (<button disabled>, fourni par VButton) :
    // jsdom la contourne en dispatchant l'événement, on n'asserte donc que le marquage
    it('accepte une liste', () => {
      const { getByRole } = render(VPagination, {
        props: { length: 5, modelValue: 2, disabledPages: [3] },
      })

      expect((getByRole('button', { name: 'Page 3' }) as HTMLButtonElement).disabled).toBe(true)
      expect((getByRole('button', { name: 'Page 2' }) as HTMLButtonElement).disabled).toBe(false)
    })

    it('accepte un prédicat', () => {
      const { getByRole } = render(VPagination, {
        props: { length: 5, modelValue: 1, disabledPages: (n: number) => n > 3 },
      })

      expect((getByRole('button', { name: 'Page 2' }) as HTMLButtonElement).disabled).toBe(false)
      expect((getByRole('button', { name: 'Page 4' }) as HTMLButtonElement).disabled).toBe(true)
    })

    it('enjambe les pages désactivées avec les contrôles', async () => {
      const { getByRole, emitted } = render(VPagination, {
        props: { length: 5, modelValue: 3, disabledPages: [2] },
      })

      await fireEvent.click(getByRole('button', { name: 'Page précédente' }))

      expect(emitted('update:modelValue')).toEqual([[1]])
    })

    it('désactive tout le composant avec disabled', () => {
      const { container } = render(VPagination, {
        props: { length: 5, modelValue: 3, disabled: true },
      })
      const buttons = [...container.querySelectorAll<HTMLButtonElement>('button')]

      expect(buttons.every((el) => el.disabled)).toBe(true)
    })
  })

  describe('attached', () => {
    it('rattache les boutons dans un VButtonGroup', () => {
      const { container, getByRole } = render(VPagination, {
        props: { length: 5, modelValue: 1, attached: true },
      })

      expect(container.querySelector('.v-pagination-items')?.classList).toContain('v-button-group')
      expect(getByRole('group')).toBeTruthy()
    })

    it('reste une simple rangée par défaut', () => {
      const { container, queryByRole } = render(VPagination, {
        props: { length: 5, modelValue: 1 },
      })

      expect(container.querySelector('.v-button-group')).toBeNull()
      expect(queryByRole('group')).toBeNull()
    })
  })

  describe('contrôles', () => {
    it("n'affiche aucun contrôle avec showControls: false", () => {
      const { container } = render(VPagination, {
        props: { length: 5, modelValue: 3, showControls: false },
      })

      expect(container.querySelectorAll('.v-pagination-control')).toHaveLength(0)
    })

    it('rend un libellé visible en mode text, sans icône', () => {
      const { container } = render(VPagination, {
        props: { length: 5, modelValue: 3, controlsDisplay: 'text' },
      })
      const control = container.querySelector('.v-pagination-control')

      expect(control?.querySelector('.v-pagination-control-label')?.textContent).toBe(
        'Page précédente',
      )
      expect(control?.querySelector('.v-icon')).toBeNull()
    })

    it('cumule icône et libellé en mode both', () => {
      const { container } = render(VPagination, {
        props: { length: 5, modelValue: 3, controlsDisplay: 'both' },
      })
      const control = container.querySelector('.v-pagination-control')

      expect(control?.querySelector('.v-pagination-control-label')).toBeTruthy()
      expect(control?.querySelector('.v-icon')).toBeTruthy()
    })

    it('garde le nom accessible même quand le libellé est visible', () => {
      const { getByRole } = render(VPagination, {
        props: { length: 5, modelValue: 3, controlsDisplay: 'both' },
      })

      expect(getByRole('button', { name: 'Page précédente' })).toBeTruthy()
    })

    it('accepte un nom ou un rendu explicite pour les icônes personnalisées', () => {
      const { container } = render(VPagination, {
        props: {
          length: 5,
          modelValue: 3,
          prevIcon: 'first_page',
          nextIcon: { src: 'https://cdn.test/next.svg' },
        },
      })
      const [prev, next] = [...container.querySelectorAll('.v-pagination-control')]

      expect(prev?.querySelector<HTMLElement>('.v-icon')?.dataset.icon).toBe('first_page')
      expect(next?.querySelector('.v-icon-img')?.getAttribute('src')).toBe(
        'https://cdn.test/next.svg',
      )
    })

    it('reprend les libellés personnalisés', () => {
      const { getByRole } = render(VPagination, {
        props: { length: 5, modelValue: 3, prevLabel: 'Précédent', nextLabel: 'Suivant' },
      })

      expect(getByRole('button', { name: 'Suivant' })).toBeTruthy()
    })
  })

  describe('taille', () => {
    it('propage size et compact à tous les boutons', () => {
      const { container } = render(VPagination, {
        props: { length: 20, modelValue: 10, size: 'sm', compact: true },
      })
      const buttons = [...container.querySelectorAll<HTMLElement>('.v-button')]

      expect(buttons.every((el) => el.dataset.size === 'sm')).toBe(true)
      expect(buttons.every((el) => el.hasAttribute('data-compact'))).toBe(true)
    })

    it('rend la page active en solid et les autres dans la variante demandée', () => {
      const { container } = render(VPagination, {
        props: { length: 5, modelValue: 3, variant: 'outline' },
      })
      const pages = [...container.querySelectorAll<HTMLElement>('.v-pagination-page')]

      expect(pages[2]?.dataset.variant).toBe('solid')
      expect(pages[2]?.dataset.tone).toBe('accent')
      expect(pages[0]?.dataset.variant).toBe('outline')
      expect(pages[0]?.dataset.tone).toBe('neutral')
    })
  })

  describe('navigation clavier', () => {
    it('déplace le focus avec les flèches sans changer de page', async () => {
      const { container, getByRole, emitted } = render(VPagination, {
        props: { length: 20, modelValue: 10 },
      })
      const pages = [...container.querySelectorAll<HTMLElement>('.v-pagination-page')]
      pages[1]?.focus()

      await fireEvent.keyDown(getByRole('navigation'), { key: 'ArrowRight' })

      expect(document.activeElement).toBe(pages[2])
      expect(emitted('update:modelValue')).toBeUndefined()
    })

    it('boucle en arrière et saute aux extrémités avec Home/End', async () => {
      const { container, getByRole } = render(VPagination, {
        props: { length: 20, modelValue: 10 },
      })
      const nav = getByRole('navigation')
      const pages = [...container.querySelectorAll<HTMLElement>('.v-pagination-page')]
      pages[0]?.focus()

      await fireEvent.keyDown(nav, { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(pages[pages.length - 1])

      await fireEvent.keyDown(nav, { key: 'Home' })
      expect(document.activeElement).toBe(pages[0])

      await fireEvent.keyDown(nav, { key: 'End' })
      expect(document.activeElement).toBe(pages[pages.length - 1])
    })

    it('ignore les pages désactivées', async () => {
      const { container, getByRole } = render(VPagination, {
        props: { length: 5, modelValue: 1, disabledPages: [2] },
      })
      const pages = [...container.querySelectorAll<HTMLElement>('.v-pagination-page')]
      pages[0]?.focus()

      await fireEvent.keyDown(getByRole('navigation'), { key: 'ArrowRight' })

      expect(document.activeElement).toBe(pages[2])
    })
  })

  describe('cas limites', () => {
    it('rend une seule pastille pour une page unique, contrôles en butée', () => {
      const { container, getByRole } = render(VPagination, { props: { length: 1, modelValue: 1 } })

      expect(pageLabels(container)).toEqual(['1'])
      expect((getByRole('button', { name: 'Page suivante' }) as HTMLButtonElement).disabled).toBe(
        true,
      )
    })

    it('borne une page courante hors limites', () => {
      const { getByRole } = render(VPagination, { props: { length: 5, modelValue: 99 } })

      expect(getByRole('button', { name: 'Page 5' }).getAttribute('aria-current')).toBe('page')
    })
  })
})
