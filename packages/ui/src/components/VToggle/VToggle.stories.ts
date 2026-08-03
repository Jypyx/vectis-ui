import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import VToggle from './VToggle.vue'
import VToggleItem from './VToggleItem.vue'

const meta = {
  title: 'Composants/Toggle',
  component: VToggle,
  argTypes: {
    variant: { control: 'inline-radio', options: ['ghost', 'outline'] },
    tone: {
      control: 'inline-radio',
      options: ['accent', 'neutral', 'danger', 'success', 'warning'],
    },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  args: {
    multiple: false,
    mandatory: false,
    attached: true,
    orientation: 'horizontal',
    variant: 'ghost',
    tone: 'accent',
    size: 'md',
    compact: false,
    disabled: false,
    selectedIconFilled: false,
    label: 'Alignement',
  },
  // v-model vivant : sans ref locale, cliquer un item ne changerait rien.
  render: (args) => ({
    components: { VToggle, VToggleItem },
    setup: () => ({ args, alignement: ref('gauche') }),
    template: `
      <VToggle v-bind="args" v-model="alignement">
        <VToggleItem value="gauche" label="Gauche" />
        <VToggleItem value="centre" label="Centre" />
        <VToggleItem value="droite" label="Droite" />
      </VToggle>
    `,
  }),
} satisfies Meta<typeof VToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Gauche' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await userEvent.click(canvas.getByRole('button', { name: 'Centre' }))
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Centre' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      await expect(canvas.getByRole('button', { name: 'Gauche' })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
    })

    // re-clic : sans `mandatory`, l'item se désélectionne
    await userEvent.click(canvas.getByRole('button', { name: 'Centre' }))
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Centre' })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
    })
  },
}

export const Detache: Story = {
  args: { attached: false },
}

export const Variantes: Story = {
  render: () => ({
    components: { VToggle, VToggleItem },
    setup: () => ({
      variants: ['ghost', 'outline'],
      attachements: [true, false],
      selection: ref('centre'),
    }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <template v-for="v in variants" :key="v">
          <VToggle
            v-for="a in attachements"
            :key="v + a"
            :variant="v"
            :attached="a"
            label="Alignement"
            v-model="selection"
          >
            <VToggleItem value="gauche" label="Gauche" />
            <VToggleItem value="centre" label="Centre" />
            <VToggleItem value="droite" label="Droite" />
          </VToggle>
        </template>
      </div>
    `,
  }),
}

export const Tones: Story = {
  render: () => ({
    components: { VToggle, VToggleItem },
    setup: () => ({
      tones: ['accent', 'neutral', 'success', 'warning', 'danger'],
      selection: ref('centre'),
    }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <VToggle v-for="t in tones" :key="t" :tone="t" variant="outline" label="Alignement" v-model="selection">
          <VToggleItem value="gauche" label="Gauche" />
          <VToggleItem value="centre" label="Centre" />
          <VToggleItem value="droite" label="Droite" />
        </VToggle>
      </div>
    `,
  }),
}

export const Multiple: Story = {
  render: (args) => ({
    components: { VToggle, VToggleItem },
    setup: () => ({ args, format: ref(['gras']) }),
    template: `
      <VToggle v-bind="args" v-model="format">
        <VToggleItem value="gras" icon="format_bold" aria-label="Gras" />
        <VToggleItem value="italique" icon="format_italic" aria-label="Italique" />
        <VToggleItem value="souligne" icon="format_underlined" aria-label="Souligné" />
      </VToggle>
    `,
  }),
  args: { multiple: true, label: 'Format' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Italique' }))
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Gras' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      await expect(canvas.getByRole('button', { name: 'Italique' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })
  },
}

export const Mandatory: Story = {
  args: { mandatory: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // re-cliquer l'unique sélection ne la retire pas
    await userEvent.click(canvas.getByRole('button', { name: 'Gauche' }))
    await expect(canvas.getByRole('button', { name: 'Gauche' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  },
}

export const IconesRemplies: Story = {
  render: (args) => ({
    components: { VToggle, VToggleItem },
    setup: () => ({ args, affichage: ref(['favoris']) }),
    template: `
      <VToggle v-bind="args" v-model="affichage">
        <VToggleItem value="favoris" icon="favorite" label="Favoris" />
        <VToggleItem value="suivis" icon="star" label="Suivis" />
        <VToggleItem value="enregistres" icon="bookmark" label="Enregistrés" />
      </VToggle>
    `,
  }),
  args: { multiple: true, selectedIconFilled: true, label: 'Collections' },
}

export const TaillesEtCompact: Story = {
  render: () => ({
    components: { VToggle, VToggleItem },
    setup: () => ({
      sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
      selection: ref('centre'),
    }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <VToggle v-for="s in sizes" :key="s" :size="s" label="Alignement" v-model="selection">
          <VToggleItem value="gauche" label="Gauche" />
          <VToggleItem value="centre" label="Centre" />
          <VToggleItem value="droite" label="Droite" />
        </VToggle>
        <VToggle size="md" compact label="Alignement (compact)" v-model="selection">
          <VToggleItem value="gauche" label="Gauche" />
          <VToggleItem value="centre" label="Centre" />
          <VToggleItem value="droite" label="Droite" />
        </VToggle>
      </div>
    `,
  }),
}

export const Desactive: Story = {
  render: () => ({
    components: { VToggle, VToggleItem },
    setup: () => ({ groupe: ref('gauche'), item: ref('gauche') }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <VToggle disabled label="Groupe désactivé" v-model="groupe">
          <VToggleItem value="gauche" label="Gauche" />
          <VToggleItem value="centre" label="Centre" />
          <VToggleItem value="droite" label="Droite" />
        </VToggle>
        <VToggle label="Item désactivé" v-model="item">
          <VToggleItem value="gauche" label="Gauche" />
          <VToggleItem value="centre" label="Centre" disabled />
          <VToggleItem value="droite" label="Droite" />
        </VToggle>
      </div>
    `,
  }),
}

export const Vertical: Story = {
  render: () => ({
    components: { VToggle, VToggleItem },
    setup: () => ({ selection: ref('centre') }),
    template: `
      <div style="display: flex; gap: 32px; align-items: start">
        <VToggle orientation="vertical" label="Alignement" v-model="selection">
          <VToggleItem value="gauche" label="Gauche" />
          <VToggleItem value="centre" label="Centre" />
          <VToggleItem value="droite" label="Droite" />
        </VToggle>
        <VToggle orientation="vertical" :attached="false" variant="outline" label="Alignement" v-model="selection">
          <VToggleItem value="gauche" label="Gauche" />
          <VToggleItem value="centre" label="Centre" />
          <VToggleItem value="droite" label="Droite" />
        </VToggle>
      </div>
    `,
  }),
}

export const CasLimites: Story = {
  render: () => ({
    components: { VToggle, VToggleItem },
    setup: () => ({ selection: ref('long') }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start; max-width: 480px">
        <VToggle label="Périodes" v-model="selection">
          <VToggleItem value="court" label="Jour" />
          <VToggleItem value="long" label="Une période de temps particulièrement longue" />
          <VToggleItem value="autre" label="Semaine glissante personnalisée" />
        </VToggle>
      </div>
    `,
  }),
}

export const Clavier: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    canvas.getByRole('button', { name: 'Gauche' }).focus()

    await userEvent.keyboard('{ArrowRight}')
    await expect(canvas.getByRole('button', { name: 'Centre' })).toHaveFocus()
    // le focus ne sélectionne pas
    await expect(canvas.getByRole('button', { name: 'Centre' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    await userEvent.keyboard('{End}')
    await expect(canvas.getByRole('button', { name: 'Droite' })).toHaveFocus()
  },
}
