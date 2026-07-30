import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VBadge from '../VBadge/VBadge.vue'
import VTab from './VTab.vue'
import VTabPanel from './VTabPanel.vue'
import VTabs from './VTabs.vue'

/** A tab set long enough to overflow a narrow container. */
const CITIES = [
  'Paris',
  'Lyon',
  'Marseille',
  'Toulouse',
  'Bordeaux',
  'Lille',
  'Nantes',
  'Strasbourg',
  'Montpellier',
  'Rennes',
  'Grenoble',
  'Toulon',
]

const t = storyText({
  en: {
    overviewPanel: 'Overview panel — variant',
    detailsPanel: 'Details panel.',
    historyPanel: 'History panel.',
    settings: 'Settings',
    messages: 'Messages',
    textOnly: 'Text only',
    textAndIcon: 'Text and icon',
    activeOnly: 'The active panel is the only visible one; the others carry the native attribute',
    andKeepState: 'and keep their state.',
    keptInput: 'An entry kept from one tab to the next:',
    lazyPanel: 'This panel is',
    mountedOnFirst: ': its content was only mounted on its first display.',
    seePrevious: 'See the previous tabs',
    seeNext: 'See the next tabs',
    singleTab: 'Single tab',
    veryLongLabel: 'A particularly long tab label',
    anotherEndless: 'Another equally endless label',
    longHistory: 'A very long history that must be truncated',
  },
  fr: {
    overviewPanel: 'Panneau « Aperçu » — variante',
    detailsPanel: 'Panneau « Détails ».',
    historyPanel: 'Panneau « Historique ».',
    settings: 'Réglages',
    messages: 'Messages',
    textOnly: 'Texte seul',
    textAndIcon: 'Texte et icône',
    activeOnly: "Le panneau actif est le seul visible ; les autres portent l'attribut natif",
    andKeepState: 'et gardent leur état.',
    keptInput: "Une saisie conservée d'un onglet à l'autre :",
    lazyPanel: 'Ce panneau est',
    mountedOnFirst: " : son contenu n'a été monté qu'à son premier affichage.",
    seePrevious: 'Voir les onglets précédents',
    seeNext: 'Voir les onglets suivants',
    singleTab: 'Onglet unique',
    veryLongLabel: "Un libellé d'onglet particulièrement long",
    anotherEndless: 'Un autre libellé tout aussi interminable',
    longHistory: 'Un historique très long qui doit être tronqué',
  },
})

const meta = {
  title: 'Components/Tabs',
  component: VTabs,
  argTypes: {
    variant: { control: 'inline-radio', options: ['flat', 'outlined', 'inset'] },
    tone: {
      control: 'inline-radio',
      options: ['accent', 'neutral', 'danger'],
    },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    activation: { control: 'inline-radio', options: ['manual', 'automatic'] },
  },
  args: {
    variant: 'flat',
    tone: 'accent',
    size: 'md',
    compact: false,
    orientation: 'horizontal',
    align: 'start',
    grow: false,
    scrollButtons: false,
    activation: 'manual',
  },
  // A live v-model: without a local ref, clicking a tab would change nothing.
  render: (args) => ({
    components: { VTabs, VTab, VTabPanel },
    setup: () => ({ args, tab: ref('overview') }),
    template: `
      <VTabs v-bind="args" v-model="tab">
        <VTab value="overview" label="Overview" />
        <VTab value="details" label="Details" />
        <VTab value="history" label="History" />
      </VTabs>
    `,
  }),
} satisfies Meta<typeof VTabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    await userEvent.click(canvas.getByRole('tab', { name: 'Details' }))

    await waitFor(async () => {
      await expect(canvas.getByRole('tab', { name: 'Details' })).toHaveAttribute(
        'aria-selected',
        'true',
      )
    })
  },
}

/** The three decorations: `flat` (default), `outlined` (a card) and `inset` (a hollow track). */
export const Variants: Story = {
  render: () => ({
    components: { VTabs, VTab, VTabPanel },
    setup: () => ({
      variants: ['flat', 'outlined', 'inset'],
      tabs: ref({ flat: 'a', outlined: 'a', inset: 'a', bar: 'a' }),
      t,
    }),
    /*
     * The panels are rendered: it is the WHOLE component that `outlined` encloses in
     * a card, and the bar's track becomes the rule separating them. No padding is set
     * on the panels — the frame's gutter is what spaces them out in `outlined`, where
     * `flat` and `inset` leave them flush, at the consumer's charge. The last bar is
     * the `outlined` edge case with no #panels slot: nothing left to separate, so the
     * track fades away.
     */
    template: `
      <div style="display: grid; gap: 32px; width: 480px">
        <VTabs v-for="v in variants" :key="v" :variant="v" v-model="tabs[v]">
          <VTab value="a" label="Overview" />
          <VTab value="b" label="Details" />
          <VTab value="c" label="History" />
          <template #panels>
            <VTabPanel value="a">{{ t.overviewPanel }} {{ v }}.</VTabPanel>
            <VTabPanel value="b">{{ t.detailsPanel }}</VTabPanel>
            <VTabPanel value="c">{{ t.historyPanel }}</VTabPanel>
          </template>
        </VTabs>

        <VTabs variant="outlined" v-model="tabs.bar">
          <VTab value="a" label="Overview" />
          <VTab value="b" label="Details" />
          <VTab value="c" label="History" />
        </VTabs>
      </div>
    `,
  }),
}

export const Tones: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({
      tones: ['accent', 'neutral', 'danger'],
      // `outlined` renders the tones identically to `flat` (the frame is agnostic
      // to the tone): adding it would only double the board.
      variants: ['flat', 'inset'],
      tab: ref('b'),
    }),
    template: `
      <div style="display: grid; gap: 32px">
        <div v-for="v in variants" :key="v" style="display: grid; gap: 16px">
          <VTabs v-for="tone in tones" :key="tone" :variant="v" :tone="tone" v-model="tab">
            <VTab value="a" label="Overview" />
            <VTab value="b" label="Details" />
            <VTab value="c" label="History" />
          </VTabs>
        </div>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({ sizes: ['xs', 'sm', 'md', 'lg', 'xl'], tab: ref('a') }),
    template: `
      <div style="display: grid; gap: 24px">
        <VTabs v-for="s in sizes" :key="s" :size="s" variant="inset" v-model="tab">
          <VTab value="a" label="Overview" />
          <VTab value="b" label="Details" icon="tune" />
          <VTab value="c" icon="more_horiz" aria-label="Plus" />
        </VTabs>
      </div>
    `,
  }),
}

export const Compact: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({ normal: ref('a'), compact: ref('a') }),
    // compact = -4px of height; padding, type and icons unchanged
    template: `
      <div style="display: grid; gap: 24px">
        <VTabs variant="inset" v-model="normal">
          <VTab value="a" label="Overview" />
          <VTab value="b" label="Details" />
        </VTabs>
        <VTabs variant="inset" compact v-model="compact">
          <VTab value="a" label="Overview" />
          <VTab value="b" label="Details" />
        </VTabs>
      </div>
    `,
  }),
}

export const TabContent: Story = {
  render: () => ({
    components: { VTabs, VTab, VBadge },
    setup: () => ({ tab: ref('text'), t }),
    template: `
      <VTabs v-model="tab">
        <VTab value="text" :label="t.textOnly" />
        <VTab value="icon" :label="t.textAndIcon" icon="tune" />
        <VTab value="iconOnly" icon="settings" :aria-label="t.settings" />
        <VTab value="slot">
          <VBadge :count="3">{{ t.messages }}</VBadge>
        </VTab>
      </VTabs>
    `,
  }),
}

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => ({
    components: { VTabs, VTab, VTabPanel },
    setup: () => ({ args, tab: ref('overview'), framed: ref('overview'), t }),
    /*
     * The indicator stays at the start edge in both decorations. The TRACK, on the
     * other hand, migrates: when flat it delimits the tab column (the start edge);
     * when framed, that edge is already held by the card's border and the rule moves
     * to the opposite edge, where it finally separates the tabs from their content.
     */
    template: `
      <div style="display: grid; grid-auto-flow: column; gap: 32px; justify-content: start">
        <VTabs v-bind="args" orientation="vertical" v-model="tab" style="min-height: 220px">
          <VTab value="overview" label="Overview" icon="dashboard" />
          <VTab value="details" label="Details" icon="tune" />
          <VTab value="history" label="History" icon="history" />
          <template #panels>
            <VTabPanel value="overview" style="padding: 16px">{{ t.overviewPanel }}</VTabPanel>
            <VTabPanel value="details" style="padding: 16px">{{ t.detailsPanel }}</VTabPanel>
            <VTabPanel value="history" style="padding: 16px">{{ t.historyPanel }}</VTabPanel>
          </template>
        </VTabs>

        <VTabs variant="outlined" orientation="vertical" v-model="framed" style="min-height: 220px">
          <VTab value="overview" label="Overview" icon="dashboard" />
          <VTab value="details" label="Details" icon="tune" />
          <VTab value="history" label="History" icon="history" />
          <template #panels>
            <VTabPanel value="overview">{{ t.overviewPanel }}</VTabPanel>
            <VTabPanel value="details">{{ t.detailsPanel }}</VTabPanel>
            <VTabPanel value="history">{{ t.historyPanel }}</VTabPanel>
          </template>
        </VTabs>
      </div>
    `,
  }),
}

export const Alignment: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({
      aligns: ['start', 'center', 'end'],
      horizontal: ref('a'),
      vertical: ref('a'),
    }),
    /*
     * In vertical mode, `align` acts on the block axis: it only has an effect if the
     * bar is given a height — hence the `height` set on each example.
     */
    template: `
      <div style="display: grid; gap: 24px">
        <VTabs v-for="a in aligns" :key="a" :align="a" variant="inset" v-model="horizontal">
          <VTab value="a" label="Overview" />
          <VTab value="b" label="Details" />
          <VTab value="c" label="History" />
        </VTabs>

        <div style="display: grid; grid-auto-flow: column; gap: 24px; justify-content: start">
          <VTabs
            v-for="a in aligns"
            :key="a"
            :align="a"
            orientation="vertical"
            variant="inset"
            v-model="vertical"
            style="height: 240px"
          >
            <VTab value="a" label="Overview" />
            <VTab value="b" label="Details" />
            <VTab value="c" label="History" />
          </VTabs>
        </div>
      </div>
    `,
  }),
}

export const Grow: Story = {
  args: { grow: true },
  render: (args) => ({
    components: { VTabs, VTab },
    setup: () => ({ args, tab: ref('a'), t }),
    template: `
      <VTabs v-bind="args" grow v-model="tab">
        <VTab value="a" label="Overview" />
        <VTab value="b" label="Details" />
        <VTab value="c" :label="t.longHistory" />
      </VTabs>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({ tab: ref('a') }),
    // the inert tab is a <button disabled>: greyed through tokens, skipped by the arrows
    template: `
      <VTabs v-model="tab">
        <VTab value="a" label="Overview" />
        <VTab value="b" label="Details" disabled />
        <VTab value="c" label="History" />
      </VTabs>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('tab', { name: 'Details' })).toBeDisabled()

    canvas.getByRole('tab', { name: 'Overview' }).focus()
    await userEvent.keyboard('{ArrowRight}')

    await waitFor(async () => {
      await expect(canvas.getByRole('tab', { name: 'History' })).toHaveFocus()
    })
  },
}

export const Panels: Story = {
  render: () => ({
    components: { VTabs, VTab, VTabPanel },
    setup: () => ({ tab: ref('overview'), t }),
    template: `
      <VTabs v-model="tab">
        <VTab value="overview" label="Overview" />
        <VTab value="details" label="Details" />
        <VTab value="history" label="History" />
        <template #panels>
          <VTabPanel value="overview" style="padding: 16px 0">
            {{ t.activeOnly }}
            <code>hidden</code> {{ t.andKeepState }}
          </VTabPanel>
          <VTabPanel value="details" style="padding: 16px 0">
            <label>{{ t.keptInput }} <input type="text" /></label>
          </VTabPanel>
          <VTabPanel value="history" style="padding: 16px 0" lazy>
            {{ t.lazyPanel }} <code>lazy</code>{{ t.mountedOnFirst }}
          </VTabPanel>
        </template>
      </VTabs>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('tab', { name: 'Details' }))

    await waitFor(async () => {
      await expect(canvas.getByRole('tabpanel')).toHaveAttribute(
        'aria-labelledby',
        canvas.getByRole('tab', { name: 'Details' }).id,
      )
    })
  },
}

export const Scrolling: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({ cities: CITIES, tab: ref('Paris') }),
    // the container is deliberately narrow: the list scrolls by touch, trackpad and
    // keyboard, with no visible scrollbar
    template: `
      <div style="max-width: 420px; border: 1px dashed var(--vectis-color-border); padding: 8px">
        <VTabs v-model="tab">
          <VTab v-for="v in cities" :key="v" :value="v" :label="v" />
        </VTabs>
      </div>
    `,
  }),
}

export const ScrollButtons: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({ cities: CITIES, tab: ref('Paris') }),
    template: `
      <div style="max-width: 420px; border: 1px dashed var(--vectis-color-border); padding: 8px">
        <VTabs scroll-buttons variant="inset" v-model="tab">
          <VTab v-for="v in cities" :key="v" :value="v" :label="v" />
        </VTabs>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const next = canvas.getByRole('button', { name: 'Next tabs' })

    // at the start of the line, only the downstream control is enabled
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Previous tabs' })).toBeDisabled()
      await expect(next).toBeEnabled()
    })

    await userEvent.click(next)

    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Previous tabs' })).toBeEnabled()
    })
  },
}

export const CustomArrows: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({ cities: CITIES, horizontal: ref('Paris'), vertical: ref('Paris'), t }),
    /*
     * `prevIcon`/`nextIcon` accept a Material Symbols name or an image URL, and
     * `prevLabel`/`nextLabel` supply the accessible name. The defaults follow the
     * orientation (chevrons when horizontal, expand_less / expand_more when
     * vertical); here they are replaced on both axes.
     */
    template: `
      <div style="display: grid; gap: 24px; max-width: 420px">
        <!-- min-width: 0: a grid item does not go below its min-content
             (min-width: auto), so the tab list would never overflow -->
        <div style="min-width: 0; border: 1px dashed var(--vectis-color-border); padding: 8px">
          <VTabs
            scroll-buttons
            prev-icon="keyboard_double_arrow_left"
            next-icon="keyboard_double_arrow_right"
            :prev-label="t.seePrevious"
            :next-label="t.seeNext"
            v-model="horizontal"
          >
            <VTab v-for="v in cities" :key="v" :value="v" :label="v" />
          </VTabs>
        </div>

        <div style="min-width: 0; border: 1px dashed var(--vectis-color-border); padding: 8px">
          <VTabs
            orientation="vertical"
            variant="inset"
            scroll-buttons
            prev-icon="arrow_drop_up"
            next-icon="arrow_drop_down"
            prev-label="Onglets au-dessus"
            next-label="Onglets en dessous"
            v-model="vertical"
            style="height: 180px"
          >
            <VTab v-for="v in cities" :key="v" :value="v" :label="v" />
          </VTabs>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const next = canvas.getByRole('button', { name: 'See the next tabs' })

    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'See the previous tabs' })).toBeDisabled()
      await expect(next).toBeEnabled()
    })

    await userEvent.click(next)

    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'See the previous tabs' })).toBeEnabled()
    })
  },
}

export const EdgeCases: Story = {
  render: () => ({
    components: { VTabs, VTab },
    setup: () => ({ single: ref('a'), long: ref('a'), unknown: ref('zzz'), t }),
    template: `
      <div style="display: grid; gap: 24px">
        <VTabs v-model="single"><VTab value="a" :label="t.singleTab" /></VTabs>

        <VTabs variant="inset" v-model="long">
          <VTab value="a" :label="t.veryLongLabel" />
          <VTab value="b" :label="t.anotherEndless" />
        </VTabs>

        <!-- a value outside the list: no active tab, and the bar leaves the tab order -->
        <VTabs v-model="unknown">
          <VTab value="a" label="Overview" />
          <VTab value="b" label="Details" />
        </VTabs>
      </div>
    `,
  }),
}
