import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'

import Chip from './Chip.vue'

const meta = {
  title: 'Composants/Chip',
  component: Chip,
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'accent', 'danger', 'success', 'warning'] },
    size: { control: 'select', options: ['xs', 'sm'] },
    compact: { control: 'boolean' },
  },
  args: { tone: 'neutral', size: 'xs', compact: false },
  render: (args) => ({
    components: { Chip },
    setup: () => ({ args }),
    template: '<Chip v-bind="args">Design system</Chip>',
  }),
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tones: Story = {
  render: () => ({
    components: { Chip },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <Chip v-for="tone in ['neutral', 'accent', 'success', 'warning', 'danger']" :key="tone" :tone="tone">
          {{ tone }}
        </Chip>
      </div>
    `,
  }),
}

/** xs 24px (défaut) / sm 32px ; `compact` retire 4px de hauteur. */
export const Tailles: Story = {
  render: () => ({
    components: { Chip },
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <Chip size="xs" dismissible>XSmall 24px</Chip>
        <Chip size="sm" dismissible>Small 32px</Chip>
        <Chip size="xs" compact dismissible>XSmall compact 20px</Chip>
        <Chip size="sm" compact dismissible>Small compact 28px</Chip>
      </div>
    `,
  }),
}

export const Selectionnable: Story = {
  render: () => ({
    components: { Chip },
    setup: () => ({ vue: ref(true), react: ref(false), svelte: ref(false) }),
    template: `
      <div style="display: flex; gap: 8px" role="group" aria-label="Frameworks">
        <Chip selectable v-model:selected="vue" tone="accent">Vue</Chip>
        <Chip selectable v-model:selected="react" tone="accent">React</Chip>
        <Chip selectable v-model:selected="svelte" tone="accent">Svelte</Chip>
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

export const Supprimable: Story = {
  render: () => ({
    components: { Chip },
    setup: () => ({ tags: ref(['Vue', 'TypeScript', 'CSS']) }),
    template: `
      <div style="display: flex; gap: 8px">
        <Chip v-for="tag in tags" :key="tag" dismissible @dismiss="tags = tags.filter(t => t !== tag)">
          {{ tag }}
        </Chip>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getAllByRole('button', { name: 'Retirer' })[1]!)
    await expect(canvas.queryByText('TypeScript')).toBeNull()
  },
}

export const SelectionnableEtSupprimable: Story = {
  render: () => ({
    components: { Chip },
    setup: () => ({ selected: ref(true) }),
    template: `
      <Chip selectable dismissible v-model:selected="selected" tone="accent">Filtre actif</Chip>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { Chip },
    template: '<Chip selectable dismissible disabled>Indisponible</Chip>',
  }),
}
