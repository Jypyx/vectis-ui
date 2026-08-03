import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed, ref } from 'vue'

import Checkbox from './VCheckbox.vue'

const meta = {
  title: 'Composants/Checkbox',
  component: Checkbox,
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
    components: { Checkbox },
    setup: () => ({ args, checked: ref(false) }),
    template: '<Checkbox v-bind="args" v-model="checked">Recevoir la newsletter</Checkbox>',
  }),
} satisfies Meta<typeof Checkbox>

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
    components: { Checkbox },
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <Checkbox label-position="end">Libellé après (défaut)</Checkbox>
        <Checkbox label-position="start">Libellé avant</Checkbox>
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
    components: { Checkbox },
    template: `
      <div style="display: grid; gap: 8px; max-width: 320px">
        <Checkbox spread>Boîte à droite</Checkbox>
        <Checkbox spread label-position="start">Boîte à gauche</Checkbox>
      </div>
    `,
  }),
}

export const Indeterminate: Story = {
  render: () => ({
    components: { Checkbox },
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
        <Checkbox v-model="all" :indeterminate="some">Tout sélectionner</Checkbox>
        <div style="display: grid; gap: 8px; padding-inline-start: 24px">
          <Checkbox v-model="fruits[0]">Pommes</Checkbox>
          <Checkbox v-model="fruits[1]">Poires</Checkbox>
          <Checkbox v-model="fruits[2]">Cerises</Checkbox>
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
    components: { Checkbox },
    setup: () => ({ on: ref(true), off: ref(false) }),
    template: `
      <div style="display: grid; gap: 8px">
        <Checkbox v-model="off" disabled>Désactivée</Checkbox>
        <Checkbox v-model="on" disabled>Désactivée cochée</Checkbox>
      </div>
    `,
  }),
}

export const LibelleLong: Story = {
  render: () => ({
    components: { Checkbox },
    template: `
      <div style="max-width: 260px">
        <Checkbox>
          J'accepte les conditions générales d'utilisation ainsi que la politique de
          confidentialité, y compris le traitement de mes données personnelles.
        </Checkbox>
      </div>
    `,
  }),
}
