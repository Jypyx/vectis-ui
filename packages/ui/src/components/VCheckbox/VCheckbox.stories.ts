import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed, ref } from 'vue'

import VCheckbox from './VCheckbox.vue'

const meta = {
  title: 'Composants/Checkbox',
  component: VCheckbox,
  argTypes: {
    labelPosition: { control: 'select', options: ['start', 'end'] },
  },
  args: {
    indeterminate: false,
    labelPosition: 'end',
    spread: false,
    invalid: false,
    disabled: false,
  },
  render: (args) => ({
    components: { VCheckbox },
    setup: () => ({ args, checked: ref(false) }),
    template: '<VCheckbox v-bind="args" v-model="checked">Recevoir la newsletter</VCheckbox>',
  }),
} satisfies Meta<typeof VCheckbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox', {
      name: 'Recevoir la newsletter',
    })
    // l'input masqué est en pointer-events: none : on clique le <label>
    // englobant, comme un utilisateur réel
    const label = checkbox.closest('label')!
    await userEvent.click(label)
    await waitFor(() => expect(checkbox).toBeChecked())
    await userEvent.click(label)
    await waitFor(() => expect(checkbox).not.toBeChecked())
  },
}

export const PositionDuLibelle: Story = {
  render: () => ({
    components: { VCheckbox },
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <VCheckbox label-position="end">Libellé après (défaut)</VCheckbox>
        <VCheckbox label-position="start">Libellé avant</VCheckbox>
      </div>
    `,
  }),
}

/**
 * `spread` : la racine passe en flex pleine largeur, libellé et boîte sont
 * repoussés aux extrémités du conteneur.
 */
export const Spread: Story = {
  render: () => ({
    components: { VCheckbox },
    template: `
      <div style="display: grid; gap: 8px; max-width: 320px">
        <VCheckbox spread>Boîte à droite</VCheckbox>
        <VCheckbox spread label-position="start">Boîte à gauche</VCheckbox>
      </div>
    `,
  }),
}

export const Indeterminate: Story = {
  render: () => ({
    components: { VCheckbox },
    setup: () => {
      const fruits = ref([true, false, true])
      const all = computed({
        get: () => fruits.value.every(Boolean),
        set: (v: boolean) => {
          fruits.value = fruits.value.map(() => v)
        },
      })
      const some = computed(() => fruits.value.some(Boolean) && !all.value)
      return { fruits, all, some }
    },
    template: `
      <div style="display: grid; gap: 8px">
        <VCheckbox v-model="all" :indeterminate="some">Tout sélectionner</VCheckbox>
        <div style="display: grid; gap: 8px; padding-inline-start: 24px">
          <VCheckbox v-model="fruits[0]">Pommes</VCheckbox>
          <VCheckbox v-model="fruits[1]">Poires</VCheckbox>
          <VCheckbox v-model="fruits[2]">Cerises</VCheckbox>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const all = canvas.getByRole('checkbox', { name: 'Tout sélectionner' }) as HTMLInputElement
    await waitFor(() => expect(all.indeterminate).toBe(true))
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Poires' }).closest('label')!)
    await waitFor(() => expect(all.indeterminate).toBe(false))
    await expect(all).toBeChecked()
  },
}

export const Disabled: Story = {
  render: () => ({
    components: { VCheckbox },
    setup: () => ({ on: ref(true), off: ref(false) }),
    template: `
      <div style="display: grid; gap: 8px">
        <VCheckbox v-model="off" disabled>Désactivée</VCheckbox>
        <VCheckbox v-model="on" disabled>Désactivée cochée</VCheckbox>
      </div>
    `,
  }),
}

export const LibelleLong: Story = {
  render: () => ({
    components: { VCheckbox },
    template: `
      <div style="max-width: 260px">
        <VCheckbox>
          J'accepte les conditions générales d'utilisation ainsi que la politique de
          confidentialité, y compris le traitement de mes données personnelles.
        </VCheckbox>
      </div>
    `,
  }),
}
