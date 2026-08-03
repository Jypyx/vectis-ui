import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Toggle from './Toggle.vue'
import ToggleItem from './ToggleItem.vue'

const meta = {
  title: 'Composants/Toggle',
  component: Toggle,
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
    components: { Toggle, ToggleItem },
    setup: () => ({ args, alignement: ref('gauche') }),
    template: `
      <Toggle v-bind="args" v-model="alignement">
        <ToggleItem value="gauche" label="Gauche" />
        <ToggleItem value="centre" label="Centre" />
        <ToggleItem value="droite" label="Droite" />
      </Toggle>
    `,
  }),
} satisfies Meta<typeof Toggle>

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
    components: { Toggle, ToggleItem },
    setup: () => ({
      variants: ['ghost', 'outline'],
      attachements: [true, false],
      selection: ref('centre'),
    }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <template v-for="v in variants" :key="v">
          <Toggle
            v-for="a in attachements"
            :key="v + a"
            :variant="v"
            :attached="a"
            label="Alignement"
            v-model="selection"
          >
            <ToggleItem value="gauche" label="Gauche" />
            <ToggleItem value="centre" label="Centre" />
            <ToggleItem value="droite" label="Droite" />
          </Toggle>
        </template>
      </div>
    `,
  }),
}

export const Tones: Story = {
  render: () => ({
    components: { Toggle, ToggleItem },
    setup: () => ({
      tones: ['accent', 'neutral', 'success', 'warning', 'danger'],
      selection: ref('centre'),
    }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <Toggle v-for="t in tones" :key="t" :tone="t" variant="outline" label="Alignement" v-model="selection">
          <ToggleItem value="gauche" label="Gauche" />
          <ToggleItem value="centre" label="Centre" />
          <ToggleItem value="droite" label="Droite" />
        </Toggle>
      </div>
    `,
  }),
}

export const Multiple: Story = {
  render: (args) => ({
    components: { Toggle, ToggleItem },
    setup: () => ({ args, format: ref(['gras']) }),
    template: `
      <Toggle v-bind="args" v-model="format">
        <ToggleItem value="gras" icon="format_bold" aria-label="Gras" />
        <ToggleItem value="italique" icon="format_italic" aria-label="Italique" />
        <ToggleItem value="souligne" icon="format_underlined" aria-label="Souligné" />
      </Toggle>
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
    components: { Toggle, ToggleItem },
    setup: () => ({ args, affichage: ref(['favoris']) }),
    template: `
      <Toggle v-bind="args" v-model="affichage">
        <ToggleItem value="favoris" icon="favorite" label="Favoris" />
        <ToggleItem value="suivis" icon="star" label="Suivis" />
        <ToggleItem value="enregistres" icon="bookmark" label="Enregistrés" />
      </Toggle>
    `,
  }),
  args: { multiple: true, selectedIconFilled: true, label: 'Collections' },
}

export const TaillesEtCompact: Story = {
  render: () => ({
    components: { Toggle, ToggleItem },
    setup: () => ({
      sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
      selection: ref('centre'),
    }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <Toggle v-for="s in sizes" :key="s" :size="s" label="Alignement" v-model="selection">
          <ToggleItem value="gauche" label="Gauche" />
          <ToggleItem value="centre" label="Centre" />
          <ToggleItem value="droite" label="Droite" />
        </Toggle>
        <Toggle size="md" compact label="Alignement (compact)" v-model="selection">
          <ToggleItem value="gauche" label="Gauche" />
          <ToggleItem value="centre" label="Centre" />
          <ToggleItem value="droite" label="Droite" />
        </Toggle>
      </div>
    `,
  }),
}

export const Desactive: Story = {
  render: () => ({
    components: { Toggle, ToggleItem },
    setup: () => ({ groupe: ref('gauche'), item: ref('gauche') }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <Toggle disabled label="Groupe désactivé" v-model="groupe">
          <ToggleItem value="gauche" label="Gauche" />
          <ToggleItem value="centre" label="Centre" />
          <ToggleItem value="droite" label="Droite" />
        </Toggle>
        <Toggle label="Item désactivé" v-model="item">
          <ToggleItem value="gauche" label="Gauche" />
          <ToggleItem value="centre" label="Centre" disabled />
          <ToggleItem value="droite" label="Droite" />
        </Toggle>
      </div>
    `,
  }),
}

export const Vertical: Story = {
  render: () => ({
    components: { Toggle, ToggleItem },
    setup: () => ({ selection: ref('centre') }),
    template: `
      <div style="display: flex; gap: 32px; align-items: start">
        <Toggle orientation="vertical" label="Alignement" v-model="selection">
          <ToggleItem value="gauche" label="Gauche" />
          <ToggleItem value="centre" label="Centre" />
          <ToggleItem value="droite" label="Droite" />
        </Toggle>
        <Toggle orientation="vertical" :attached="false" variant="outline" label="Alignement" v-model="selection">
          <ToggleItem value="gauche" label="Gauche" />
          <ToggleItem value="centre" label="Centre" />
          <ToggleItem value="droite" label="Droite" />
        </Toggle>
      </div>
    `,
  }),
}

export const CasLimites: Story = {
  render: () => ({
    components: { Toggle, ToggleItem },
    setup: () => ({ selection: ref('long') }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start; max-width: 480px">
        <Toggle label="Périodes" v-model="selection">
          <ToggleItem value="court" label="Jour" />
          <ToggleItem value="long" label="Une période de temps particulièrement longue" />
          <ToggleItem value="autre" label="Semaine glissante personnalisée" />
        </Toggle>
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
