import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import { nextTick, ref } from 'vue'

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
      // The current page can never be hidden
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
      expect(ellipsis?.hasAttribute('aria-label')).toBe(false)
      expect(ellipsis?.hasAttribute('data-icon-only')).toBe(true)
    })

    it('bordered reaches the row, and the size is carried by the row to every button', () => {
      const { container } = render(VPagination, {
        props: {
          length: 20,
          modelValue: 10,
          totalVisible: 7,
          bordered: true,
          size: 'sm',
          compact: true,
        },
      })
      expect(container.querySelector('.v-button-group')?.hasAttribute('data-bordered')).toBe(true)
      const buttons = [...container.querySelectorAll<HTMLElement>('.v-button')]
      expect(buttons.every((el) => el.dataset.size === 'sm')).toBe(true)
      expect(buttons.every((el) => el.hasAttribute('data-compact'))).toBe(true)
    })
  })

  describe('disabled pages', () => {
    // The inertness itself is native (<button disabled>, supplied by VButton): jsdom bypasses
    // it by dispatching the event, so only the marking is asserted
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

  describe('detached', () => {
    it('joins the buttons inside a VButtonGroup', () => {
      const { container, getByRole } = render(VPagination, {
        props: { length: 5, modelValue: 1 },
      })

      const row = container.querySelector('.v-pagination-items')
      expect(row?.classList).toContain('v-button-group')
      expect(row?.hasAttribute('data-detached')).toBe(false)
      expect(getByRole('group')).toBeTruthy()
    })

    it('spaces the row out when asked, which is the same group detached', () => {
      const { container } = render(VPagination, {
        props: { length: 5, modelValue: 1, detached: true },
      })

      const row = container.querySelector('.v-pagination-items')
      expect(row?.classList).toContain('v-button-group')
      expect(row?.hasAttribute('data-detached')).toBe(true)
    })
  })

  describe('controls', () => {
    it('controls: false takes both controls out', () => {
      const { container } = render(VPagination, {
        props: { length: 5, modelValue: 3, controls: false as const },
      })

      expect(container.querySelectorAll('.v-pagination-control')).toHaveLength(0)
    })

    it('renders a visible label in text mode, with no icon', () => {
      const { container } = render(VPagination, {
        props: { length: 5, modelValue: 3, controls: 'text' },
      })
      const control = container.querySelector('.v-pagination-control')

      expect(control?.querySelector('.v-pagination-control-label')?.textContent).toBe(
        'Previous page',
      )
      expect(control?.querySelector('.v-icon')).toBeNull()
    })

    it('combines icon and label in both mode', () => {
      const { container } = render(VPagination, {
        props: { length: 5, modelValue: 3, controls: 'both' },
      })
      const control = container.querySelector('.v-pagination-control')

      expect(control?.querySelector('.v-pagination-control-label')).toBeTruthy()
      expect(control?.querySelector('.v-icon')).toBeTruthy()
    })

    it('keeps the accessible name even when the label is visible', () => {
      const { getByRole } = render(VPagination, {
        props: { length: 5, modelValue: 3, controls: 'both' },
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
        props: { length: 5, modelValue: 3, prevText: 'Previous', nextText: 'Next' },
      })

      expect(getByRole('button', { name: 'Next' })).toBeTruthy()
    })
  })

  describe('edge controls', () => {
    const sides = (container: Element) =>
      [...container.querySelectorAll<HTMLElement>('.v-pagination-control')].map(
        (el) => el.dataset.side,
      )

    it('leaves them out by default', () => {
      const { container } = render(VPagination, { props: { length: 5, modelValue: 3 } })

      expect(sides(container)).toEqual(['prev', 'next'])
    })

    it('frames the previous and next controls with first and last, in their default icons', () => {
      const { container, getByRole } = render(VPagination, {
        props: { length: 5, modelValue: 3, edgeControls: true },
      })

      expect(sides(container)).toEqual(['first', 'prev', 'next', 'last'])
      const first = getByRole('button', { name: 'First page' })
      const last = getByRole('button', { name: 'Last page' })
      expect(first.querySelector<HTMLElement>('.v-icon')?.dataset.icon).toBe('first_page')
      expect(last.querySelector<HTMLElement>('.v-icon')?.dataset.icon).toBe('last_page')
    })

    it('follows controls: false', () => {
      const { container } = render(VPagination, {
        props: { length: 5, modelValue: 3, controls: false as const, edgeControls: true },
      })

      expect(container.querySelectorAll('.v-pagination-control')).toHaveLength(0)
    })

    it('jumps to the first and last pages', async () => {
      const first = render(VPagination, {
        props: { length: 20, modelValue: 10, edgeControls: true },
      })
      await fireEvent.click(first.getByRole('button', { name: 'First page' }))
      expect(first.emitted('update:modelValue')).toEqual([[1]])
      first.unmount()

      const last = render(VPagination, {
        props: { length: 20, modelValue: 10, edgeControls: true },
      })
      await fireEvent.click(last.getByRole('button', { name: 'Last page' }))
      expect(last.emitted('update:modelValue')).toEqual([[20]])
    })

    it('lands on the farthest reachable page, over disabled ones', async () => {
      const { getByRole, emitted } = render(VPagination, {
        props: { length: 9, modelValue: 5, disabledPages: [1, 2, 9], edgeControls: true },
      })

      await fireEvent.click(getByRole('button', { name: 'First page' }))
      await fireEvent.click(getByRole('button', { name: 'Last page' }))

      expect(emitted('update:modelValue')).toEqual([[3], [8]])
    })

    it('disables each one with its neighbour once no page is left in its direction', () => {
      const { getByRole } = render(VPagination, {
        props: { length: 5, modelValue: 2, disabledPages: [1], edgeControls: true },
      })

      expect((getByRole('button', { name: 'First page' }) as HTMLButtonElement).disabled).toBe(true)
      expect((getByRole('button', { name: 'Previous page' }) as HTMLButtonElement).disabled).toBe(
        true,
      )
      expect((getByRole('button', { name: 'Last page' }) as HTMLButtonElement).disabled).toBe(false)
    })

    it('shows the text the way controls asks, the icon on the outer side', () => {
      const { getByRole } = render(VPagination, {
        props: { length: 5, modelValue: 3, controls: 'both', edgeControls: true },
      })
      const first = getByRole('button', { name: 'First page' })
      const last = getByRole('button', { name: 'Last page' })

      const parts = (el: HTMLElement) =>
        [...el.querySelectorAll('.v-icon, .v-pagination-control-label')].map((part) =>
          part.matches('.v-icon') ? 'icon' : part.textContent,
        )

      expect(parts(first)).toEqual(['icon', 'First page'])
      expect(parts(last)).toEqual(['Last page', 'icon'])
    })

    it('picks up custom labels and icons', () => {
      const { getByRole } = render(VPagination, {
        props: {
          length: 5,
          modelValue: 3,
          edgeControls: true,
          firstText: 'Newest',
          lastText: 'Oldest',
          firstIcon: 'arrow_upward',
          lastIcon: { src: 'https://cdn.test/last.svg' },
        },
      })

      const first = getByRole('button', { name: 'Newest' })
      expect(first.querySelector<HTMLElement>('.v-icon')?.dataset.icon).toBe('arrow_upward')
      expect(
        getByRole('button', { name: 'Oldest' }).querySelector('.v-icon-img')?.getAttribute('src'),
      ).toBe('https://cdn.test/last.svg')
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

    /*
     * Only the wiring is observable here, the `:has()` rule that moves the shadow being CSS
     * jsdom never evaluates.
     */
    it('elevated reaches every button through the group', () => {
      const { container } = render(VPagination, {
        props: { length: 5, modelValue: 3, elevated: true },
      })
      const buttons = [...container.querySelectorAll<HTMLElement>('.v-button')]

      expect(buttons.length).toBeGreaterThan(0)
      expect(buttons.every((el) => el.hasAttribute('data-elevated'))).toBe(true)
    })

    it('without elevated, the group stays opinion-free and no button is raised', () => {
      const { container } = render(VPagination, { props: { length: 5, modelValue: 3 } })
      const buttons = [...container.querySelectorAll<HTMLElement>('.v-button')]

      expect(buttons.some((el) => el.hasAttribute('data-elevated'))).toBe(false)
    })

    it('renders the active page as solid and the others in the requested variant', () => {
      const { container } = render(VPagination, {
        props: { length: 5, modelValue: 3, itemVariant: 'outline' },
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

describe('VPagination — robustness', () => {
  it('reads a fractional model as the nearest whole page', () => {
    const { container } = render(VPagination, {
      props: { length: 20, modelValue: 2.4, totalVisible: 7 },
    })
    expect(container.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('2')
  })

  it('a length that is not a number renders a single page', () => {
    const { container } = render(VPagination, { props: { length: Number.NaN } })
    expect(pageLabels(container)).toEqual(['1'])
  })

  it('a totalVisible that is not a number renders every page', () => {
    const { container } = render(VPagination, {
      props: { length: 8, modelValue: 2, totalVisible: Number.NaN },
    })
    expect(pageLabels(container)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8'])
  })
})

describe('VPagination — selectedVariant and exposed members', () => {
  it('draws the current page in selectedVariant, solid by default', async () => {
    const { container, rerender } = render(VPagination, { props: { length: 3, modelValue: 2 } })
    const current = () => container.querySelector('[aria-current="page"]')!
    expect(current().getAttribute('data-variant')).toBe('solid')
    await rerender({ selectedVariant: 'soft' })
    expect(current().getAttribute('data-variant')).toBe('soft')
  })

  it('focus lands on the current page, and el is the nav', async () => {
    const pagination = ref<InstanceType<typeof VPagination> | null>(null)
    const { container } = render({
      components: { VPagination },
      setup: () => ({ pagination }),
      template: '<VPagination ref="pagination" :length="5" :model-value="3" />',
    })
    await nextTick()
    expect(pagination.value?.el).toBe(container.querySelector('nav'))
    pagination.value?.focus()
    expect(document.activeElement).toBe(container.querySelector('[aria-current="page"]'))
  })
})

describe('VPagination — links', () => {
  const href = (page: number) => `/products?page=${page}`
  // A hash address in the click tests: jsdom implements no other navigation.
  const hashHref = (page: number) => `#page-${page}`

  it('renders every pill as a link to its page, the current one included', () => {
    const { getByRole } = render(VPagination, { props: { length: 5, modelValue: 2, href } })

    expect(getByRole('link', { name: 'Page 3' }).getAttribute('href')).toBe('/products?page=3')
    const current = getByRole('link', { name: 'Page 2' })
    expect(current.getAttribute('href')).toBe('/products?page=2')
    expect(current.getAttribute('aria-current')).toBe('page')
  })

  it('links the controls to the page they lead to, over disabled pages, with rel', () => {
    const { getByRole } = render(VPagination, {
      props: { length: 9, modelValue: 5, disabledPages: [4, 6], href },
    })

    const prev = getByRole('link', { name: 'Previous page' })
    const next = getByRole('link', { name: 'Next page' })
    expect(prev.getAttribute('href')).toBe('/products?page=3')
    expect(prev.getAttribute('rel')).toBe('prev')
    expect(next.getAttribute('href')).toBe('/products?page=7')
    expect(next.getAttribute('rel')).toBe('next')
  })

  it('links the edge controls to the first and last reachable pages, with rel', () => {
    const { getByRole } = render(VPagination, {
      props: { length: 9, modelValue: 5, disabledPages: [1], edgeControls: true, href },
    })

    const first = getByRole('link', { name: 'First page' })
    const last = getByRole('link', { name: 'Last page' })
    expect(first.getAttribute('href')).toBe('/products?page=2')
    expect(first.getAttribute('rel')).toBe('first')
    expect(last.getAttribute('href')).toBe('/products?page=9')
    expect(last.getAttribute('rel')).toBe('last')
  })

  it('turns a control with no page left into an inert link, with no address and no rel', () => {
    const { getByRole } = render(VPagination, { props: { length: 5, modelValue: 1, href } })

    const prev = getByRole('link', { name: 'Previous page' })
    expect(prev.hasAttribute('href')).toBe(false)
    expect(prev.hasAttribute('rel')).toBe(false)
    expect(prev.getAttribute('aria-disabled')).toBe('true')
  })

  it('a click updates the model and emits navigate with the event first', async () => {
    const { getByRole, emitted } = render(VPagination, {
      props: { length: 5, modelValue: 2, href: hashHref },
    })

    await fireEvent.click(getByRole('link', { name: 'Page 4' }))
    await fireEvent.click(getByRole('link', { name: 'Next page' }))

    const navigate = emitted('navigate') as Array<[number, MouseEvent]>
    expect(navigate.map(([page]) => page)).toEqual([4, 5])
    expect(navigate[0]![1]).toBeInstanceOf(MouseEvent)
    expect(emitted('update:modelValue')).toEqual([[4], [5]])
  })

  it('lets navigate cancel the browser navigation, the model still following', async () => {
    let prevented: boolean | undefined
    const { getByRole, emitted } = render(VPagination, {
      props: {
        length: 5,
        modelValue: 2,
        href,
        onNavigate: (_page: number, event: MouseEvent) => event.preventDefault(),
      },
    })
    const link = getByRole('link', { name: 'Page 3' })
    link.addEventListener('click', (event) => (prevented = event.defaultPrevented))

    await fireEvent.click(link)

    expect(prevented).toBe(true)
    expect(emitted('update:modelValue')).toEqual([[3]])
  })

  it('leaves a click with a modifier to the browser: no model change, no navigate', async () => {
    const { getByRole, emitted } = render(VPagination, {
      props: { length: 5, modelValue: 2, href: hashHref },
    })

    for (const modifier of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey'] as const) {
      await fireEvent.click(getByRole('link', { name: 'Page 4' }), { [modifier]: true })
    }

    expect(emitted('navigate')).toBeUndefined()
    expect(emitted('update:modelValue')).toBeUndefined()
  })

  it('still emits navigate from buttons, where a modifier changes nothing', async () => {
    const { getByRole, emitted } = render(VPagination, { props: { length: 5, modelValue: 2 } })

    await fireEvent.click(getByRole('button', { name: 'Page 4' }), { ctrlKey: true })

    expect((emitted('navigate') as Array<[number, MouseEvent]>)[0]![0]).toBe(4)
    expect(emitted('update:modelValue')).toEqual([[4]])
  })

  it('makes a disabled page an inert link the arrows skip', async () => {
    const { getByRole, container } = render(VPagination, {
      props: { length: 5, modelValue: 2, disabledPages: [3], href: hashHref },
    })

    const disabled = container.querySelectorAll<HTMLElement>('.v-pagination-page')[2]!
    expect(disabled.hasAttribute('href')).toBe(false)
    expect(disabled.getAttribute('aria-disabled')).toBe('true')

    const current = getByRole('link', { name: 'Page 2' })
    current.focus()
    await fireEvent.keyDown(current, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(getByRole('link', { name: 'Page 4' }))
  })

  it('hands the focus to the current page when a control turns inert under it', async () => {
    const page = ref(4)
    const { getByRole } = render({
      components: { VPagination },
      setup: () => ({ page, hashHref }),
      template: '<VPagination v-model="page" :length="5" :href="hashHref" />',
    })
    const next = getByRole('link', { name: 'Next page' })
    next.focus()

    await fireEvent.click(next)
    await nextTick()

    expect(page.value).toBe(5)
    expect(document.activeElement).toBe(getByRole('link', { name: 'Page 5' }))
  })

  it('focus() reaches the current page when it is a link', async () => {
    const pagination = ref<InstanceType<typeof VPagination> | null>(null)
    const { container } = render({
      components: { VPagination },
      setup: () => ({ pagination, href }),
      template: '<VPagination ref="pagination" :length="5" :model-value="3" :href="href" />',
    })
    await nextTick()
    pagination.value?.focus()
    expect(document.activeElement).toBe(container.querySelector('[aria-current="page"]'))
  })
})
