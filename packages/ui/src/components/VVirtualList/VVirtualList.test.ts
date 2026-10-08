import { fireEvent, render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, type Component } from 'vue'

import VVirtualListSfc from './VVirtualList.vue'
import type { VirtualListAlign } from './VVirtualList.vue'

// A generic component, which the render helpers' types do not take as it is.
const VVirtualList = VVirtualListSfc as unknown as Component

function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VVirtualList },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i + 1}` }))

/**
 * jsdom lays nothing out: the list is given a 200px viewport and a scroll position that holds
 * what is written to it, the two readings the windowing works from.
 */
const scrolled = new WeakMap<Element, number>()
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.classList.contains('v-virtual-list') ? 200 : 0
  })
  Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
    configurable: true,
    get(this: HTMLElement) {
      return scrolled.get(this) ?? 0
    },
    set(this: HTMLElement, value: number) {
      scrolled.set(this, Math.max(0, value))
    },
  })
})
afterEach(() => {
  delete (HTMLElement.prototype as { scrollTop?: number }).scrollTop
})

const rowsOf = (list: HTMLElement) =>
  [...list.querySelectorAll<HTMLElement>('[role="listitem"]')].map((row) => row.textContent)

async function scrollTo(list: HTMLElement, top: number) {
  list.scrollTop = top
  await fireEvent.scroll(list)
  await nextTick()
}

const template = `
  <VVirtualList :items="items" item-key="id" label="Items" v-bind="extra">
    <template #default="{ item }"><button type="button">{{ item.name }}</button></template>
  </VVirtualList>
`

describe('VVirtualList', () => {
  it('renders only the rows near the viewport, and spaces for the others', async () => {
    const { getByRole } = renderHarness(template, { items, extra: {} })
    await nextTick()
    const list = getByRole('list', { name: 'Items' })
    // 200px of 40px rows: rows 1 to 6 in view, then 5 more below.
    expect(rowsOf(list)).toEqual(items.slice(0, 11).map((item) => item.name))
    const spacer = list.querySelector<HTMLElement>('.v-virtual-list-spacer')!
    expect(spacer.style.blockSize).toBe(`${(1000 - 11) * 40}px`)
    expect(spacer.getAttribute('aria-hidden')).toBe('true')
  })

  it('moves the window as the list scrolls', async () => {
    const { getByRole } = renderHarness(template, { items, extra: {} })
    await nextTick()
    const list = getByRole('list')
    await scrollTo(list, 4000)
    // Row 101 sits at 4000px: 5 rows above it, 6 in view, 5 below.
    expect(rowsOf(list)).toEqual(items.slice(95, 111).map((item) => item.name))
    const [before, after] = list.querySelectorAll<HTMLElement>('.v-virtual-list-spacer')
    expect(before!.style.blockSize).toBe(`${95 * 40}px`)
    expect(after!.style.blockSize).toBe(`${(1000 - 111) * 40}px`)
  })

  it('itemSize and overscan shape the window', async () => {
    const { getByRole } = renderHarness(template, { items, extra: { itemSize: 100, overscan: 1 } })
    await nextTick()
    expect(rowsOf(getByRole('list'))).toHaveLength(4)
  })

  it('each row says where it stands in the whole list', async () => {
    const { getByRole, getAllByRole } = renderHarness(template, { items, extra: {} })
    await nextTick()
    await scrollTo(getByRole('list'), 4000)
    const row = getAllByRole('listitem')[0]!
    expect(row.getAttribute('aria-setsize')).toBe('1000')
    expect(row.getAttribute('aria-posinset')).toBe('96')
  })

  it('announces the total as unknown while more rows may come', async () => {
    const { getAllByRole } = renderHarness(template, { items, extra: { hasMore: true } })
    await nextTick()
    expect(getAllByRole('listitem')[0]!.getAttribute('aria-setsize')).toBe('-1')
  })

  it('is a focusable scroll container, named by label', () => {
    const { getByRole } = renderHarness(template, { items, extra: {} })
    const list = getByRole('list', { name: 'Items' })
    expect(list.tabIndex).toBe(0)
    expect(list.classList.contains('v-virtual-list')).toBe(true)
  })

  it('height sets the block size, a number in pixels', () => {
    const { getByRole } = renderHarness(template, { items, extra: { height: 320 } })
    expect(getByRole('list').style.blockSize).toBe('320px')
  })

  it('forwards attributes, and a consumer tabindex or aria-label wins', () => {
    const { getByRole } = renderHarness(
      `<VVirtualList :items="items" label="Items" class="extra" data-x="1" tabindex="-1" aria-label="Rows" />`,
      { items },
    )
    const list = getByRole('list', { name: 'Rows' })
    expect(list.classList.contains('extra')).toBe(true)
    expect(list.dataset.x).toBe('1')
    expect(list.tabIndex).toBe(-1)
  })

  it('keeps the row holding the focus rendered when the list scrolls away from it', async () => {
    const { getByRole } = renderHarness(template, { items, extra: {} })
    await nextTick()
    const list = getByRole('list')
    const button = getByRole('button', { name: 'Item 3' })
    button.focus()
    await scrollTo(list, 20000)
    expect(rowsOf(list)[0]).toBe('Item 3')
    expect(document.activeElement).toBe(button)
    // Once the focus leaves, the row goes with the rest.
    button.blur()
    await nextTick()
    expect(rowsOf(list)).not.toContain('Item 3')
  })

  it('scrollToIndex renders the row and brings it into view', async () => {
    const list = ref<{
      scrollToIndex: (index: number, align?: VirtualListAlign) => Promise<void>
      el: HTMLElement
    } | null>(null)
    // Rows laid out 40px apart from the top of the list, which is at the top of the page.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const container = this.closest<HTMLElement>('.v-virtual-list')
      const top =
        this === container ? 0 : Number(this.dataset.index) * 40 - (container?.scrollTop ?? 0)
      return { top, height: this === container ? 200 : 40 } as DOMRect
    })
    const { getByRole } = renderHarness(
      `<VVirtualList ref="list" :items="items" item-key="id" v-slot="{ item }">{{ item.name }}</VVirtualList>`,
      { items, list },
    )
    await nextTick()
    await list.value!.scrollToIndex(500, 'start')
    await nextTick()
    const el = getByRole('list')
    expect(el.scrollTop).toBe(500 * 40)
    expect(rowsOf(el)).toContain('Item 501')
    expect(list.value!.el).toBe(el)
  })

  it('keeps its rows when items are added at the end', async () => {
    const list = ref(items.slice(0, 3))
    const { getByRole } = renderHarness(template, { items: list, extra: {} })
    await nextTick()
    list.value = [...list.value, { id: 3, name: 'Item 4' }]
    await nextTick()
    expect(rowsOf(getByRole('list'))).toEqual(['Item 1', 'Item 2', 'Item 3', 'Item 4'])
    expect(getByRole('list').querySelector('.v-virtual-list-spacer')).toBeNull()
  })

  describe('loading', () => {
    it('ends the list with a loading row, and marks the list busy', () => {
      const { getByRole, container } = renderHarness(template, { items, extra: { loading: true } })
      expect(getByRole('list').getAttribute('aria-busy')).toBe('true')
      const row = container.querySelector('.v-virtual-list-more')!
      expect(row.getAttribute('aria-hidden')).toBe('true')
      expect(row.querySelector(':scope > span')!.textContent).toBe('Loading…')
    })

    it('loadingText and the #loading slot replace what it says', () => {
      const { container } = renderHarness(
        `<VVirtualList :items="[]" loading loading-text="Fetching rows" />`,
      )
      expect(container.querySelector('.v-virtual-list-more > span')!.textContent).toBe(
        'Fetching rows',
      )
      const slotted = renderHarness(
        `<VVirtualList :items="[]" loading><template #loading>Wait</template></VVirtualList>`,
      )
      expect(slotted.container.querySelector('.v-virtual-list-more')!.textContent).toBe('Wait')
    })

    it('has no loading row when nothing is loading and nothing more is coming', () => {
      const { container } = renderHarness(template, { items, extra: {} })
      expect(container.querySelector('.v-virtual-list-more')).toBeNull()
    })

    it('asks for the next page again once a page is pushed into the same array', async () => {
      let notify: ((entries: Partial<IntersectionObserverEntry>[]) => void) | undefined
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          constructor(callback: typeof notify) {
            notify = callback
          }
          observe() {}
          unobserve() {}
          disconnect() {}
        },
      )
      try {
        const cross = () => notify?.([{ isIntersecting: true }])
        const list = ref(items.slice(0, 3))
        const onLoadMore = vi.fn()
        renderHarness(
          `<VVirtualList :items="items" item-key="id" label="Items" has-more @load-more="onLoadMore" />`,
          { items: list, onLoadMore },
        )
        await nextTick()
        cross()
        cross()
        expect(onLoadMore).toHaveBeenCalledTimes(1)
        list.value.push(...items.slice(3, 6))
        await nextTick()
        cross()
        expect(onLoadMore).toHaveBeenCalledTimes(2)
      } finally {
        vi.unstubAllGlobals()
      }
    })
  })

  describe('server rendering', () => {
    it('renders initialCount rows, the rest as one spacer', async () => {
      const { createSSRApp } = await import('vue')
      const { renderToString } = await import('vue/server-renderer')
      const html = await renderToString(
        createSSRApp({
          render: () =>
            h(
              VVirtualList,
              { items, itemKey: 'id', initialCount: 4 },
              { default: ({ item }: { item: (typeof items)[number] }) => item.name },
            ),
        }),
      )
      expect(html.match(/role="listitem"/g)).toHaveLength(4)
      expect(html).toContain(`block-size:${996 * 40}px`)
    })
  })
})
