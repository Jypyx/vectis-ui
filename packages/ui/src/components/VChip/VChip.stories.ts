import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VChip from './VChip.vue'

const t = storyText({
  en: {
    chipDefault: 'Chip (default)',
    selected: 'selected',
    clickedTimes: 'Clicked',
    times: 'times',
    staticNoHover: 'Static (no hover)',
    disabled: 'Disabled',
    inertLink: 'Inert link',
    startIcon: 'Start icon',
    endIcon: 'End icon',
    both: 'Both',
    favourite: 'Favourite',
    activeFilter: 'Active filter',
    closeDefault: 'close (default)',
    xsmall: 'XSmall 24px',
    small: 'Small 32px',
    xsmallCompact: 'XSmall compact 20px',
    smallCompact: 'Small compact 28px',
  },
  fr: {
    chipDefault: 'Chip (défaut)',
    selected: 'sélectionné',
    clickedTimes: 'Cliqué',
    times: 'fois',
    staticNoHover: 'Statique (sans hover)',
    disabled: 'Désactivé',
    inertLink: 'Lien inerte',
    startIcon: 'Icône début',
    endIcon: 'Icône fin',
    both: 'Les deux',
    favourite: 'Favori',
    activeFilter: 'Filtre actif',
    closeDefault: 'close (défaut)',
    xsmall: 'XSmall 24px',
    small: 'Small 32px',
    xsmallCompact: 'XSmall compact 20px',
    smallCompact: 'Small compact 28px',
  },
})

const meta = {
  title: 'Components/Chip',
  component: VChip,
  argTypes: {
    variant: { control: 'select', options: ['tonal', 'solid', 'outline'] },
    tone: { control: 'select', options: ['neutral', 'accent', 'danger', 'success', 'warning'] },
    color: { control: 'color' },
    shape: { control: 'select', options: ['chip', 'pill'] },
    size: { control: 'select', options: ['xs', 'sm'] },
    compact: { control: 'boolean' },
    clickable: { control: 'boolean' },
    check: { control: 'boolean' },
    dismissIcon: { control: 'text' },
  },
  args: {
    variant: 'tonal',
    tone: 'neutral',
    shape: 'chip',
    size: 'xs',
    compact: false,
    clickable: false,
    check: false,
  },
  render: (args) => ({
    components: { VChip },
    setup: () => ({ args }),
    template: '<VChip v-bind="args">Design system</VChip>',
  }),
} satisfies Meta<typeof VChip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Neutral `solid` switches to an inverted contrast (VToast style), readable in both themes. */
export const Variants: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({
      variants: ['tonal', 'solid', 'outline'],
      tones: ['neutral', 'accent', 'success', 'warning', 'danger'],
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px">
        <div v-for="variant in variants" :key="variant" style="display: flex; gap: 8px; flex-wrap: wrap">
          <VChip v-for="tone in tones" :key="tone" :variant="variant" :tone="tone">
            {{ variant }} {{ tone }}
          </VChip>
        </div>
      </div>
    `,
  }),
}

/** `chip` (the default): rectangular rounded corners; `pill`: a pill. */
export const Shapes: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VChip shape="chip" tone="accent">{{ t.chipDefault }}</VChip>
        <VChip shape="pill" tone="accent">Pill</VChip>
      </div>
    `,
  }),
}

/**
 * `color` (hex, a CSS name or oklch()) replaces the tone: every shade is derived by
 * color-mix from the theme tokens and adapts light/dark. In `solid` the text is
 * white: the contrast against a light colour is the consumer's responsibility.
 */
export const CustomColor: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({ selected: ref(true), t }),
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VChip color="mediumvioletred" variant="tonal" clickable>tonal</VChip>
        <VChip color="mediumvioletred" variant="solid" clickable>solid</VChip>
        <VChip color="mediumvioletred" variant="outline" clickable>outline</VChip>
        <VChip color="oklch(55% 0.15 150)" variant="tonal" clickable>oklch()</VChip>
        <VChip color="rebeccapurple" selectable check v-model:selected="selected">{{ t.selected }}</VChip>
      </div>
    `,
  }),
}

/** Clickable = a real button (hover, active, keyboard focus); static = no hover at all. */
export const Clickable: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({ count: ref(0), t }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <VChip clickable tone="accent" @click="count++">{{ t.clickedTimes }} {{ count }} {{ t.times }}</VChip>
        <VChip tone="accent">{{ t.staticNoHover }}</VChip>
        <VChip clickable disabled tone="accent">{{ t.disabled }}</VChip>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /Clicked/ }))
    await expect(canvas.getByText('Clicked 1 times')).toBeVisible()
  },
}

/** `href` renders a link; disabled → an inert link (href removed + aria-disabled). */
export const Link: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: 8px">
        <VChip href="https://vuejs.org" target="_blank" rel="noopener" tone="accent" iconStart="open_in_new">
          vuejs.org
        </VChip>
        <VChip href="https://vuejs.org" disabled tone="accent">{{ t.inertLink }}</VChip>
      </div>
    `,
  }),
}

export const Selectable: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({ vue: ref(true), react: ref(false), svelte: ref(false) }),
    template: `
      <div style="display: flex; gap: 8px" role="group" aria-label="Frameworks">
        <VChip selectable v-model:selected="vue" tone="accent">Vue</VChip>
        <VChip selectable v-model:selected="react" tone="accent">React</VChip>
        <VChip selectable v-model:selected="svelte" tone="accent">Svelte</VChip>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const react = canvas.getByRole('button', { name: 'React' })
    await expect(react).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(react)
    await expect(react).toHaveAttribute('aria-pressed', 'true')
  },
}

/** `check` displays a tick when selected, in place of `iconStart`. */
export const SelectableWithCheck: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({ selected: ref(true) }),
    template: `
      <VChip selectable check iconStart="palette" v-model:selected="selected" tone="accent">
        Design
      </VChip>
    `,
  }),
  play: async ({ canvasElement }) => {
    // `data-icon` names the icon whatever its source — the tick comes from the
    // built-in registry (SVG), `palette` from the consumer's font (a ligature).
    const icon = (name: string) => canvasElement.querySelector(`.v-icon[data-icon='${name}']`)
    await expect(icon('check')).toBeVisible()
    await expect(icon('palette')).toBeNull()
    await userEvent.click(within(canvasElement).getByRole('button'))
    await expect(icon('check')).toBeNull()
    await expect(icon('palette')).toBeVisible()
  },
}

/** Selected = the solid rendering of the current tone (or custom colour). */
export const SelectionPerTone: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({
      tones: ['neutral', 'accent', 'success', 'warning', 'danger'],
      selected: ref(true),
    }),
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VChip v-for="tone in tones" :key="tone" :tone="tone" selectable :selected="true">
          {{ tone }}
        </VChip>
        <VChip color="mediumvioletred" selectable :selected="true">custom</VChip>
      </div>
    `,
  }),
}

export const Dismissible: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({ tags: ref(['Vue', 'TypeScript', 'CSS']) }),
    template: `
      <div style="display: flex; gap: 8px">
        <VChip v-for="tag in tags" :key="tag" dismissible @dismiss="tags = tags.filter(t => t !== tag)">
          {{ tag }}
        </VChip>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getAllByRole('button', { name: 'Remove' })[1]!)
    await expect(canvas.queryByText('TypeScript')).toBeNull()
  },
}

/** `dismissIcon`: a Material Symbols name or an image URL. */
export const CustomDismissIcon: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: 8px">
        <VChip dismissible tone="accent">{{ t.closeDefault }}</VChip>
        <VChip dismissible dismissIcon="cancel" tone="accent">cancel</VChip>
        <VChip dismissible dismissIcon="backspace" tone="accent">backspace</VChip>
      </div>
    `,
  }),
}

/** Icons through props (a Material name or a URL) or the #start/#end slots; an icon alone = no label. */
export const Icons: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <VChip iconStart="palette" tone="accent">{{ t.startIcon }}</VChip>
        <VChip iconEnd="arrow_forward" tone="accent">{{ t.endIcon }}</VChip>
        <VChip iconStart="favorite" iconEnd="arrow_forward" tone="accent">{{ t.both }}</VChip>
        <VChip iconStart="favorite" tone="danger" clickable :aria-label="t.favourite" />
        <VChip tone="success">
          <template #start><span aria-hidden="true">✓</span></template>
          Slot #start
        </VChip>
      </div>
    `,
  }),
}

export const SelectableAndDismissible: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({ selected: ref(true), t }),
    template: `
      <VChip selectable check dismissible v-model:selected="selected" tone="accent">{{ t.activeFilter }}</VChip>
    `,
  }),
}

/** xs 24px (the default) / sm 32px; `compact` removes 4px of height. */
export const Sizes: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <VChip size="xs" dismissible>{{ t.xsmall }}</VChip>
        <VChip size="sm" dismissible>{{ t.small }}</VChip>
        <VChip size="xs" compact dismissible>{{ t.xsmallCompact }}</VChip>
        <VChip size="sm" compact dismissible>{{ t.smallCompact }}</VChip>
      </div>
    `,
  }),
}

/** Disabled: greys through tokens (no opacity), the inert link included. */
export const Disabled: Story = {
  render: () => ({
    components: { VChip },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VChip variant="tonal" tone="accent" disabled clickable>tonal</VChip>
        <VChip variant="solid" tone="accent" disabled clickable>solid</VChip>
        <VChip variant="outline" tone="accent" disabled clickable>outline</VChip>
        <VChip selectable :selected="true" dismissible disabled>{{ t.selected }}</VChip>
        <VChip href="https://vuejs.org" disabled>{{ t.inertLink }}</VChip>
      </div>
    `,
  }),
}
