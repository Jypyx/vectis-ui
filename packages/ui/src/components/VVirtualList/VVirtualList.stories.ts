import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed, ref, type Component } from 'vue'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VVirtualListSfc from './VVirtualList.vue'
import type { VirtualListAlign } from './VVirtualList.vue'

// A generic component, which Storybook's types do not take as it is.
const VVirtualList = VVirtualListSfc as unknown as Component

const t = storyText({
  en: {
    label: 'Invoices',
    invoice: 'Invoice',
    notes: 'Notes',
    note: 'Note',
    short: 'Paid on delivery.',
    long: 'Paid in three instalments after a dispute about the delivery date, settled by the account manager with a discount on the next order.',
    feed: 'Activity',
    event: 'Event',
    jump: 'Go to invoice 5,000',
    top: 'Back to the top',
    open: 'Open',
  },
  fr: {
    label: 'Factures',
    invoice: 'Facture',
    notes: 'Notes',
    note: 'Note',
    short: 'Payée à la livraison.',
    long: 'Payée en trois fois après un désaccord sur la date de livraison, réglé par le chargé de compte avec une remise sur la commande suivante.',
    feed: 'Activité',
    event: 'Événement',
    jump: 'Aller à la facture 5 000',
    top: 'Revenir en haut',
    open: 'Ouvrir',
  },
})

const invoices = computed(() =>
  Array.from({ length: 10000 }, (_, i) => ({
    id: i + 1,
    name: `${t.value.invoice} ${i + 1}`,
    amount: ((i * 7919) % 100000) / 100,
  })),
)

const text =
  'font: var(--vectis-text-body-md-size) / var(--vectis-text-body-md-leading) var(--vectis-text-family); color: var(--vectis-color-text)'
const listStyle = 'max-width: 420px; border: 1px solid var(--vectis-color-border)'
const rowStyle = `display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 40px; padding: 0 12px; box-sizing: border-box; border-bottom: 1px solid var(--vectis-color-border); ${text}`
const notesStyle = 'max-width: 360px; border: 1px solid var(--vectis-color-border)'
const noteStyle = `padding: 8px 12px; border-bottom: 1px solid var(--vectis-color-border); ${text}`
const noteTextStyle = 'margin: 4px 0 0; color: var(--vectis-color-text-muted)'

const meta: Meta = {
  title: 'Components/VirtualList',
  component: VVirtualList as Meta['component'],
  argTypes: {
    itemSize: { control: { type: 'number', min: 16 } },
    overscan: { control: { type: 'number', min: 0 } },
    initialCount: { control: { type: 'number', min: 0 } },
    height: { control: 'text' },
    loading: { control: 'boolean' },
    hasMore: { control: 'boolean' },
  },
  args: {
    items: [],
    itemSize: 40,
    overscan: 5,
    initialCount: 10,
    height: 320,
    loading: false,
    hasMore: false,
  },
  render: (args) => ({
    components: { VVirtualList },
    setup: () => ({ args, t, invoices, listStyle, rowStyle }),
    template: `
      <VVirtualList
        v-bind="args"
        :items="invoices"
        item-key="id"
        :label="t.label"
        :style="listStyle"
      >
        <template #default="{ item }">
          <div :style="rowStyle">
            <span>{{ item.name }}</span>
            <span>{{ item.amount.toFixed(2) }} €</span>
          </div>
        </template>
      </VVirtualList>
    `,
  }),
}

export default meta
type Story = StoryObj

/** Ten thousand rows, of which only those near the viewport exist in the page. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list', { name: 'Invoices' })
    const rows = () => within(list).getAllByRole('listitem')
    await waitFor(() => expect(rows().length).toBeLessThan(30))
    expect(rows()[0]).toHaveAttribute('aria-setsize', '10000')

    // The list takes the focus, so the keyboard can scroll it.
    await userEvent.tab()
    expect(list).toHaveFocus()
    list.scrollTop = list.scrollHeight
    await waitFor(() => expect(within(list).getByText('Invoice 10000')).toBeVisible())
    expect(rows().length).toBeLessThan(30)
    expect(rows().at(-1)).toHaveAttribute('aria-posinset', '10000')
    list.scrollTop = 0
    await waitFor(() => expect(within(list).getByText('Invoice 1')).toBeVisible())

    // Hidden for a while and shown again, as by `v-show` or a closed tab: the rows keep their
    // measured heights, so the first frame shown is the same window, not one that walks back.
    list.style.display = 'none'
    await new Promise((resolve) => setTimeout(resolve, 300))
    list.style.display = ''
    await new Promise(requestAnimationFrame)
    expect(rows()[0]).toHaveAttribute('aria-posinset', '1')
    expect(within(list).getByText('Invoice 1')).toBeVisible()
  },
}

/**
 * Rows may differ in height: each is measured once it renders, and `itemSize` is only the
 * estimate for the rows not rendered yet.
 */
export const VariableHeights: Story = {
  render: (args) => ({
    components: { VVirtualList },
    setup: () => {
      const notes = computed(() =>
        Array.from({ length: 2000 }, (_, i) => ({
          id: i,
          title: `${t.value.note} ${i + 1}`,
          text: i % 3 === 0 ? t.value.long : t.value.short,
        })),
      )
      return { args, t, notes, notesStyle, noteStyle, noteTextStyle }
    },
    template: `
      <VVirtualList v-bind="args" :items="notes" item-key="id" :item-size="64" :label="t.notes" :style="notesStyle">
        <template #default="{ item }">
          <article :style="noteStyle">
            <strong>{{ item.title }}</strong>
            <p :style="noteTextStyle">{{ item.text }}</p>
          </article>
        </template>
      </VVirtualList>
    `,
  }),
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list', { name: 'Notes' })
    // Scrolled to the end, the last row ends where the list does: every height is accounted for.
    list.scrollTop = list.scrollHeight
    await waitFor(() => expect(within(list).getByText('Note 2000')).toBeInTheDocument())
    list.scrollTop = list.scrollHeight
    await waitFor(() => {
      const last = within(list).getAllByRole('listitem').at(-1)!
      const gap = list.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom
      expect(Math.abs(gap)).toBeLessThan(2)
    })
    // Scrolling back up through rows taller than estimated keeps the first row in place.
    list.scrollTop = 0
    await waitFor(() => expect(within(list).getByText('Note 1')).toBeVisible())
  },
}

/** `scrollToIndex` brings any row into view, rendering it first. */
export const ScrollToIndex: Story = {
  render: (args) => ({
    components: { VVirtualList, VButton },
    setup: () => {
      const list = ref<{ scrollToIndex: (index: number, align?: VirtualListAlign) => void } | null>(
        null,
      )
      return { args, t, invoices, list, listStyle, rowStyle }
    },
    template: `
      <div style="display: grid; gap: 12px; max-width: 420px">
        <div style="display: flex; gap: 8px">
          <VButton @click="list.scrollToIndex(4999, 'center')">{{ t.jump }}</VButton>
          <VButton variant="outline" @click="list.scrollToIndex(0, 'start')">{{ t.top }}</VButton>
        </div>
        <VVirtualList ref="list" v-bind="args" :items="invoices" item-key="id" :label="t.label" :style="listStyle">
          <template #default="{ item }">
            <div :style="rowStyle"><span>{{ item.name }}</span><span>{{ item.amount.toFixed(2) }} €</span></div>
          </template>
        </VVirtualList>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const list = canvas.getByRole('list')
    await userEvent.click(canvas.getByRole('button', { name: 'Go to invoice 5,000' }))
    await waitFor(() => {
      const row = within(list).getByText('Invoice 5000').getBoundingClientRect()
      const box = list.getBoundingClientRect()
      expect(Math.abs(row.top + row.height / 2 - (box.top + box.height / 2))).toBeLessThan(2)
    })
    await userEvent.click(canvas.getByRole('button', { name: 'Back to the top' }))
    await waitFor(() => expect(list.scrollTop).toBe(0))
  },
}

/**
 * A row holding the focus stays rendered when the list scrolls away from it, so the focus is
 * never lost to the page.
 */
export const FocusableRows: Story = {
  render: (args) => ({
    components: { VVirtualList, VButton },
    setup: () => ({ args, t, invoices, listStyle, rowStyle }),
    template: `
      <VVirtualList v-bind="args" :items="invoices" item-key="id" :label="t.label" tabindex="-1" :style="listStyle">
        <template #default="{ item }">
          <div :style="rowStyle">
            <span>{{ item.name }}</span>
            <VButton size="sm" variant="ghost" :aria-label="t.open + ' ' + item.name">{{ t.open }}</VButton>
          </div>
        </template>
      </VVirtualList>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const list = canvas.getByRole('list')
    await userEvent.tab()
    const button = canvas.getByRole('button', { name: 'Open Invoice 1' })
    await waitFor(() => expect(button).toHaveFocus())
    list.scrollTop = 200000
    await waitFor(() => expect(within(list).getByText('Invoice 5001')).toBeInTheDocument())
    expect(button).toHaveFocus()
    list.scrollTop = 0
    await waitFor(() => expect(within(list).getByText('Invoice 1')).toBeVisible())
  },
}

/**
 * `hasMore` asks for the next rows as the end comes into view, through `load-more`; `loading`
 * ends the list with a loading row meanwhile.
 */
export const InfiniteScroll: Story = {
  render: (args) => ({
    components: { VVirtualList },
    setup: () => {
      const events = ref(page(0))
      const loading = ref(false)
      const total = 200
      function page(from: number) {
        return Array.from({ length: 40 }, (_, i) => ({
          id: from + i,
          name: `${t.value.event} ${from + i + 1}`,
        }))
      }
      function onLoadMore() {
        loading.value = true
        setTimeout(() => {
          events.value = [...events.value, ...page(events.value.length)]
          loading.value = false
        }, 400)
      }
      const hasMore = computed(() => events.value.length < total)
      return { args, t, events, loading, hasMore, onLoadMore, listStyle, rowStyle }
    },
    template: `
      <div style="display: grid; gap: 8px; max-width: 420px">
        <VVirtualList
          v-bind="args"
          :items="events"
          item-key="id"
          :label="t.feed"
          :loading="loading"
          :has-more="hasMore"
          :style="listStyle"
          @load-more="onLoadMore"
        >
          <template #default="{ item }"><div :style="rowStyle">{{ item.name }}</div></template>
        </VVirtualList>
        <output data-testid="count">{{ events.length }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const list = canvas.getByRole('list', { name: 'Activity' })
    expect(canvas.getByTestId('count')).toHaveTextContent('40')
    list.scrollTop = list.scrollHeight
    await waitFor(() => expect(list).toHaveAttribute('aria-busy', 'true'))
    expect(
      within(list).getByText('Loading…', { selector: 'span:not(.v-visually-hidden)' }),
    ).toBeVisible()
    await waitFor(() => expect(canvas.getByTestId('count')).toHaveTextContent('80'))
    await waitFor(() => expect(list).not.toHaveAttribute('aria-busy'))
  },
}
