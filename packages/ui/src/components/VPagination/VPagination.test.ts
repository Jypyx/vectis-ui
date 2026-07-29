import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VPagination from './VPagination.vue'

/** Labels of the page pills, in DOM order. */
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
  describe('logical truncation', () => {
    it('renders every page when totalVisible is absent', () => {
      const { container } = render(VPagination, { props: { length: 8, modelValue: 2 } })

      expect(pageLabels(container)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8'])
      expect(container.querySelectorAll('.v-pagination-ellipsis')).toHaveLength(0)
    })

    it('frames the current page, keeps the bounds and inserts two ellipses', () => {
      const { container } = render(VPagination, {
        props: { length: 20, modelValue: 10, totalVisible: 7 },
      })

      expect(pageLabels(container)).toEqual(['1', '9', '10', '11', '20'])
      expect(container.querySelectorAll('.v-pagination-ellipsis')).toHaveLength(2)
    })

    it('keeps a constant slot count by shifting the window at the ends', () => {
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
        // ellipses included: the bar keeps exactly the same width
        expect(slotCount(container)).toBe(7)
        unmount()
      }
    })

    it('inserts no ellipsis when totalVisible covers every page', () => {
      const { container } = render(VPagination, {
        props: { length: 4, modelValue: 2, totalVisible: 10 },
      })

      expect(pageLabels(container)).toEqual(['1', '2', '3', '4'])
      expect(container.querySelectorAll('.v-pagination-ellipsis')).toHaveLength(0)
    })

    it('clamps totalVisible to the useful minimum of 5', () => {
      const { container } = render(VPagination, {
        props: { length: 20, modelValue: 10, totalVisible: 3 },
      })

      expect(pageLabels(container)).toEqual(['1', '10', '20'])
      expect(slotCount(container)).toBe(5)
    })

    it('marks the bounds with data-edge and the neighbours with their distance to the current page', () => {
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
      // the current page can never be hidden
      expect(current?.hasAttribute('data-distance')).toBe(false)
    })
  })

  describe('v-model', () => {
    it('emits the clicked page', async () => {
      const { getByRole, emitted } = render(VPagination, { props: { length: 20, modelValue: 10 } })

      await fireEvent.click(getByRole('button', { name: 'Page 11' }))

      expect(emitted('update:modelValue')).toEqual([[11]])
    })

    it('moves forward and back one page with the controls', async () => {
      const next = render(VPagination, { props: { length: 20, modelValue: 10 } })
      await fireEvent.click(next.getByRole('button', { name: 'Next page' }))
      expect(next.emitted('update:modelValue')).toEqual([[11]])
      next.unmount()

      const previous = render(VPagination, { props: { length: 20, modelValue: 10 } })
      await fireEvent.click(previous.getByRole('button', { name: 'Previous page' }))
      expect(previous.emitted('update:modelValue')).toEqual([[9]])
    })

    it('disables the control at the end of the line on each side', () => {
      const first = render(VPagination, { props: { length: 5, modelValue: 1 } })
      expect(
        (first.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement).disabled,
      ).toBe(true)
      expect((first.getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled).toBe(
        false,
      )
      first.unmount()

      const last = render(VPagination, { props: { length: 5, modelValue: 5 } })
      expect((last.getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled).toBe(
        true,
      )
    })
  })

  describe('accessibility', () => {
    it('sets aria-current="page" on the active page alone', () => {
      const { container, getByRole } = render(VPagination, {
        props: { length: 20, modelValue: 10 },
      })

      expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
      expect(getByRole('button', { name: 'Page 10' }).getAttribute('aria-current')).toBe('page')
    })

    it('names the navigation and accepts a custom page label', () => {
      const { getByRole } = render(VPagination, {
        props: {
          length: 5,
          modelValue: 2,
          label: 'Results',
          pageLabel: (n: number) => `Go to page ${n}`,
        },
      })

      expect(getByRole('navigation').getAttribute('aria-label')).toBe('Results')
      expect(getByRole('button', { name: 'Go to page 3' })).toBeTruthy()
    })

    it('hides the ellipsis from assistive technologies and takes it out of the tab order', () => {
      const { container } = render(VPagination, {
        props: { length: 20, modelValue: 10, totalVisible: 7 },
      })
      const ellipsis = container.querySelector<HTMLButtonElement>('.v-pagination-ellipsis')

      expect(ellipsis?.getAttribute('aria-hidden')).toBe('true')
      expect(ellipsis?.disabled).toBe(true)
    })
  })

  describe('disabled pages', () => {
    // the inertness itself is native (<button disabled>, supplied by VButton):
    // jsdom bypasses it by dispatching the event, so only the marking is asserted
    it('accepts a list', () => {
      const { getByRole } = render(VPagination, {
        props: { length: 5, modelValue: 2, disabledPages: [3] },
      })

      expect((getByRole('button', { name: 'Page 3' }) as HTMLButtonElement).disabled).toBe(true)
      expect((getByRole('button', { name: 'Page 2' }) as HTMLButtonElement).disabled).toBe(false)
    })

    it('accepts a predicate', () => {
      const { getByRole } = render(VPagination, {
        props: { length: 5, modelValue: 1, disabledPages: (n: number) => n > 3 },
      })

      expect((getByRole('button', { name: 'Page 2' }) as HTMLButtonElement).disabled).toBe(false)
      expect((getByRole('button', { name: 'Page 4' }) as HTMLButtonElement).disabled).toBe(true)
    })

    it('steps over the disabled pages with the controls', async () => {
      const { getByRole, emitted } = render(VPagination, {
        props: { length: 5, modelValue: 3, disabledPages: [2] },
      })

      await fireEvent.click(getByRole('button', { name: 'Previous page' }))

      expect(emitted('update:modelValue')).toEqual([[1]])
    })

    it('disables the whole component with disabled', () => {
      const { container } = render(VPagination, {
        props: { length: 5, modelValue: 3, disabled: true },
      })
      const buttons = [...container.querySelectorAll<HTMLButtonElement>('button')]

      expect(buttons.every((el) => el.disabled)).toBe(true)
    })
  })

  describe('attached', () => {
    it('joins the buttons inside a VButtonGroup', () => {
      const { container, getByRole } = render(VPagination, {
        props: { length: 5, modelValue: 1, attached: true },
      })

      expect(container.querySelector('.v-pagination-items')?.classList).toContain('v-button-group')
      expect(getByRole('group')).toBeTruthy()
    })

    it('stays a plain row by default', () => {
      const { container, queryByRole } = render(VPagination, {
        props: { length: 5, modelValue: 1 },
      })

      expect(container.querySelector('.v-button-group')).toBeNull()
      expect(queryByRole('group')).toBeNull()
    })
  })

  describe('controls', () => {
    it('shows no control with showControls: false', () => {
      const { container } = render(VPagination, {
        props: { length: 5, modelValue: 3, showControls: false },
      })

      expect(container.querySelectorAll('.v-pagination-control')).toHaveLength(0)
    })

    it('renders a visible label in text mode, with no icon', () => {
      const { container } = render(VPagination, {
        props: { length: 5, modelValue: 3, controlsDisplay: 'text' },
      })
      const control = container.querySelector('.v-pagination-control')

      expect(control?.querySelector('.v-pagination-control-label')?.textContent).toBe(
        'Previous page',
      )
      expect(control?.querySelector('.v-icon')).toBeNull()
    })

    it('combines icon and label in both mode', () => {
      const { container } = render(VPagination, {
        props: { length: 5, modelValue: 3, controlsDisplay: 'both' },
      })
      const control = container.querySelector('.v-pagination-control')

      expect(control?.querySelector('.v-pagination-control-label')).toBeTruthy()
      expect(control?.querySelector('.v-icon')).toBeTruthy()
    })

    it('keeps the accessible name even when the label is visible', () => {
      const { getByRole } = render(VPagination, {
        props: { length: 5, modelValue: 3, controlsDisplay: 'both' },
      })

      expect(getByRole('button', { name: 'Previous page' })).toBeTruthy()
    })

    it('accepts a name or an explicit render for the custom icons', () => {
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

    it('picks up the custom labels', () => {
      const { getByRole } = render(VPagination, {
        props: { length: 5, modelValue: 3, prevLabel: 'Previous', nextLabel: 'Next' },
      })

      expect(getByRole('button', { name: 'Next' })).toBeTruthy()
    })
  })

  describe('size', () => {
    it('propagates size and compact to every button', () => {
      const { container } = render(VPagination, {
        props: { length: 20, modelValue: 10, size: 'sm', compact: true },
      })
      const buttons = [...container.querySelectorAll<HTMLElement>('.v-button')]

      expect(buttons.every((el) => el.dataset.size === 'sm')).toBe(true)
      expect(buttons.every((el) => el.hasAttribute('data-compact'))).toBe(true)
    })

    it('renders the active page as solid and the others in the requested variant', () => {
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

  describe('keyboard navigation', () => {
    it('moves focus with the arrows without changing page', async () => {
      const { container, getByRole, emitted } = render(VPagination, {
        props: { length: 20, modelValue: 10 },
      })
      const pages = [...container.querySelectorAll<HTMLElement>('.v-pagination-page')]
      pages[1]?.focus()

      await fireEvent.keyDown(getByRole('navigation'), { key: 'ArrowRight' })

      expect(document.activeElement).toBe(pages[2])
      expect(emitted('update:modelValue')).toBeUndefined()
    })

    it('wraps backwards and jumps to the ends with Home/End', async () => {
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

    it('ignores the disabled pages', async () => {
      const { container, getByRole } = render(VPagination, {
        props: { length: 5, modelValue: 1, disabledPages: [2] },
      })
      const pages = [...container.querySelectorAll<HTMLElement>('.v-pagination-page')]
      pages[0]?.focus()

      await fireEvent.keyDown(getByRole('navigation'), { key: 'ArrowRight' })

      expect(document.activeElement).toBe(pages[2])
    })
  })

  describe('edge cases', () => {
    it('renders a single pill for a single page, with both controls at the end of the line', () => {
      const { container, getByRole } = render(VPagination, { props: { length: 1, modelValue: 1 } })

      expect(pageLabels(container)).toEqual(['1'])
      expect((getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled).toBe(true)
    })

    it('clamps an out-of-range current page', () => {
      const { getByRole } = render(VPagination, { props: { length: 5, modelValue: 99 } })

      expect(getByRole('button', { name: 'Page 5' }).getAttribute('aria-current')).toBe('page')
    })
  })
})
