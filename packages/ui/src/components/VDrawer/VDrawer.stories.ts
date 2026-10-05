import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VTypography from '../VTypography/VTypography.vue'
import VDrawer from './VDrawer.vue'
import type { DrawerSide, DrawerSize } from './VDrawer.vue'

const t = storyText({
  en: {
    filters: 'Filters',
    filtersSubtitle: 'Narrow the list of orders.',
    openFilters: 'Open the filters',
    filtersBody:
      'Filter the orders by status, date and amount. The list behind the drawer updates once you apply them.',
    reset: 'Reset',
    apply: 'Apply',
    side: (side: string) => `From ${side}`,
    sideSubtitle: 'The drawer slides in from this edge.',
    sideBody: 'start and end follow the writing direction; top and bottom are physical.',
    close: 'Close',
    size: (size: string) => `Size ${size}`,
    sizeSubtitle: 'A width on a side, a height at the top or bottom.',
    sizeBody: 'The drawer always leaves a strip of the page uncovered.',
    history: 'History',
    historySubtitle: 'The body scrolls; the header and footer stay put.',
    openHistory: 'Open the history',
    entry: (n: number) => `Change ${n}: the shipping address was updated and confirmed.`,
    done: 'Done',
    rtlTitle: 'Navigation',
    openRtl: 'Open from start',
    rtlBody: 'In a right-to-left page, start is the right edge.',
  },
  fr: {
    filters: 'Filtres',
    filtersSubtitle: 'Affinez la liste des commandes.',
    openFilters: 'Ouvrir les filtres',
    filtersBody:
      'Filtrez les commandes par statut, date et montant. La liste derrière le tiroir se met à jour une fois les filtres appliqués.',
    reset: 'Réinitialiser',
    apply: 'Appliquer',
    side: (side: string) => `Depuis ${side}`,
    sideSubtitle: 'Le tiroir glisse depuis ce bord.',
    sideBody: "start et end suivent le sens d'écriture ; top et bottom sont physiques.",
    close: 'Fermer',
    size: (size: string) => `Taille ${size}`,
    sizeSubtitle: 'Une largeur sur un côté, une hauteur en haut ou en bas.',
    sizeBody: 'Le tiroir laisse toujours une bande de la page découverte.',
    history: 'Historique',
    historySubtitle: "Le corps défile ; l'en-tête et le pied restent en place.",
    openHistory: "Ouvrir l'historique",
    entry: (n: number) =>
      `Modification ${n} : l'adresse de livraison a été mise à jour et confirmée.`,
    done: 'Terminé',
    rtlTitle: 'Navigation',
    openRtl: 'Ouvrir depuis start',
    rtlBody: 'Dans une page de droite à gauche, start est le bord droit.',
  },
})

const SIDES: DrawerSide[] = ['start', 'end', 'top', 'bottom']
const SIZES: DrawerSize[] = ['sm', 'md', 'lg']

const meta = {
  title: 'Components/Drawer',
  component: VDrawer,
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    side: { control: 'inline-radio', options: SIDES },
    size: { control: 'inline-radio', options: SIZES },
    extent: { control: 'text' },
    hideClose: { control: 'boolean' },
    persistentBackdrop: { control: 'boolean' },
    persistentEscape: { control: 'boolean' },
    closeLabel: { control: 'text' },
  },
  args: {
    side: 'end',
    size: 'md',
    hideClose: false,
    persistentBackdrop: false,
    persistentEscape: false,
  },
  render: (args) => ({
    components: { VDrawer, VButton, VTypography },
    setup() {
      const open = ref(false)
      return { args, t, open }
    },
    template: `
      <VDrawer v-bind="args" v-model:open="open" :title="t.filters" :subtitle="t.filtersSubtitle">
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps">{{ t.openFilters }}</VButton>
        </template>
        <VTypography>{{ t.filtersBody }}</VTypography>
        <template #footer>
          <VButton variant="ghost" tone="neutral" @click="open = false">{{ t.reset }}</VButton>
          <VButton @click="open = false">{{ t.apply }}</VButton>
        </template>
      </VDrawer>
    `,
  }),
} satisfies Meta<typeof VDrawer>

export default meta
type Story = StoryObj<typeof meta>

const findDrawer = (root: HTMLElement) => root.querySelector('.v-drawer') as HTMLDialogElement

/** Waits for the drawer to be open and settled against its edge. */
async function settled(root: HTMLElement) {
  return waitFor(() => {
    const drawer = findDrawer(root)
    expect(drawer?.open).toBe(true)
    expect(drawer.getAnimations()).toHaveLength(0)
    return drawer
  })
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Open the filters' })

    await userEvent.click(trigger)
    const drawer = await settled(canvasElement)
    expect(within(drawer).getByRole('heading', { name: 'Filters' })).toBeTruthy()
    // At the end edge, full height, with the md width.
    const box = drawer.getBoundingClientRect()
    expect(Math.round(box.right)).toBe(document.documentElement.clientWidth)
    expect(Math.round(box.top)).toBe(0)
    expect(Math.round(box.width)).toBe(400)

    await userEvent.click(within(drawer).getByRole('button', { name: 'Close' }))
    // Closed, it stays in the page while it slides out, then leaves it.
    expect(drawer.open).toBe(false)
    expect(drawer.isConnected).toBe(true)
    await waitFor(() => expect(findDrawer(canvasElement)).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  },
}

/** `side` picks the edge. `start` and `end` follow the writing direction. */
export const Sides: Story = {
  render: () => ({
    components: { VDrawer, VButton, VTypography },
    setup() {
      const opened = ref<DrawerSide | null>(null)
      return { t, opened, sides: SIDES }
    },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VButton v-for="side in sides" :key="side" variant="outline" tone="neutral" @click="opened = side">
          {{ side }}
        </VButton>
      </div>
      <VDrawer
        v-for="side in sides"
        :key="side"
        :side="side"
        :title="t.side(side)"
        :subtitle="t.sideSubtitle"
        :open="opened === side"
        @update:open="(v) => { if (!v) opened = null }"
      >
        <VTypography>{{ t.sideBody }}</VTypography>
      </VDrawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { clientWidth, clientHeight } = document.documentElement
    const edges: Record<DrawerSide, (box: DOMRect) => [number, number]> = {
      start: (box) => [box.left, 0],
      end: (box) => [box.right, clientWidth],
      top: (box) => [box.top, 0],
      bottom: (box) => [box.bottom, clientHeight],
    }

    for (const side of SIDES) {
      await userEvent.click(canvas.getByRole('button', { name: side }))
      const drawer = await settled(canvasElement)
      const [edge, expected] = edges[side](drawer.getBoundingClientRect())
      expect(Math.round(edge)).toBe(expected)
      await userEvent.click(within(drawer).getByRole('button', { name: 'Close' }))
      await waitFor(() => expect(findDrawer(canvasElement)).toBeNull())
    }
  },
}

/**
 * `size` reads one of three tokens; `extent` replaces it with any CSS length. Either way the
 * drawer leaves a strip of the page uncovered on a narrow screen.
 */
export const Sizes: Story = {
  render: () => ({
    components: { VDrawer, VButton, VTypography },
    setup() {
      const opened = ref<string | null>(null)
      return { t, opened, sizes: SIZES }
    },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VButton v-for="size in sizes" :key="size" variant="outline" tone="neutral" @click="opened = size">
          {{ size }}
        </VButton>
        <VButton variant="outline" tone="neutral" @click="opened = '50vw'">extent 50vw</VButton>
      </div>
      <VDrawer
        v-for="size in sizes"
        :key="size"
        :size="size"
        :title="t.size(size)"
        :subtitle="t.sizeSubtitle"
        :open="opened === size"
        @update:open="(v) => { if (!v) opened = null }"
      >
        <VTypography>{{ t.sizeBody }}</VTypography>
      </VDrawer>
      <VDrawer
        extent="50vw"
        title="50vw"
        :subtitle="t.sizeSubtitle"
        :open="opened === '50vw'"
        @update:open="(v) => { if (!v) opened = null }"
      >
        <VTypography>{{ t.sizeBody }}</VTypography>
      </VDrawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { clientWidth } = document.documentElement
    const widths: [string, number][] = [
      ['sm', 320],
      ['md', 400],
      ['lg', 560],
      ['extent 50vw', clientWidth / 2],
    ]
    for (const [name, width] of widths) {
      await userEvent.click(canvas.getByRole('button', { name }))
      const drawer = await settled(canvasElement)
      expect(Math.round(drawer.getBoundingClientRect().width)).toBe(Math.round(width))
      drawer.close()
      await waitFor(() => expect(findDrawer(canvasElement)).toBeNull())
    }
  },
}

/**
 * Overflowing content: the body scrolls while the header and the footer stay put. A keyboard
 * scrolls it through the focusable content it holds, here one link per entry.
 */
export const LongContent: Story = {
  render: () => ({
    components: { VDrawer, VButton, VTypography },
    setup() {
      const open = ref(false)
      const entries = Array.from({ length: 30 }, (_, i) => i + 1)
      return { t, open, entries }
    },
    template: `
      <VDrawer v-model:open="open" :title="t.history" :subtitle="t.historySubtitle">
        <template #trigger="{ triggerProps }">
          <VButton v-bind="triggerProps">{{ t.openHistory }}</VButton>
        </template>
        <VTypography v-for="n in entries" :key="n" style="margin-block-end: 12px">
          <a :href="'#change-' + n">{{ t.entry(n) }}</a>
        </VTypography>
        <template #footer>
          <VButton @click="open = false">{{ t.done }}</VButton>
        </template>
      </VDrawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Open the history' }))
    const drawer = await settled(canvasElement)
    const scroller = drawer.querySelector('.v-drawer-scroll') as HTMLElement
    expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight)
    // The footer is still on screen, at the drawer's foot.
    const footer = drawer.querySelector('.v-drawer-footer') as HTMLElement
    expect(Math.round(footer.getBoundingClientRect().bottom)).toBe(
      Math.round(drawer.getBoundingClientRect().bottom),
    )
  },
}

/** In a right-to-left page, `start` is the right edge and the drawer slides in from there. */
export const RightToLeft: Story = {
  render: () => ({
    components: { VDrawer, VButton, VTypography },
    setup() {
      const open = ref(false)
      return { t, open }
    },
    template: `
      <div dir="rtl">
        <VDrawer v-model:open="open" side="start" :title="t.rtlTitle">
          <template #trigger="{ triggerProps }">
            <VButton v-bind="triggerProps">{{ t.openRtl }}</VButton>
          </template>
          <VTypography>{{ t.rtlBody }}</VTypography>
        </VDrawer>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Open from start' }))
    const drawer = await settled(canvasElement)
    expect(Math.round(drawer.getBoundingClientRect().right)).toBe(
      document.documentElement.clientWidth,
    )
  },
}
