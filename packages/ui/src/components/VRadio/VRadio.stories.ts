import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import Radio from './Radio.vue'

const meta = {
  title: 'Composants/Radio',
  component: Radio,
  argTypes: {
    labelPosition: { control: 'select', options: ['start', 'end'] },
  },
} satisfies Meta<typeof Radio>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Le groupe est natif : même `name` (fallthrough) + même v-model.
 * La navigation aux flèches est fournie par le navigateur, zéro JS.
 */
export const Groupe: Story = {
  args: { value: 'standard' },
  render: () => ({
    components: { Radio },
    setup: () => ({ plan: ref('standard') }),
    template: `
      <fieldset style="border: none; display: grid; gap: 8px">
        <legend style="margin-bottom: 8px">Formule</legend>
        <Radio v-model="plan" name="plan" value="gratuit">Gratuit</Radio>
        <Radio v-model="plan" name="plan" value="standard">Standard</Radio>
        <Radio v-model="plan" name="plan" value="pro">Pro</Radio>
      </fieldset>
      <output data-testid="mirror">{{ plan }}</output>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('radio', { name: 'Standard' })).toBeChecked()
    // l'input masqué est en pointer-events: none : on clique le <label> englobant
    await userEvent.click(canvas.getByRole('radio', { name: 'Pro' }).closest('label')!)
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('pro'))
    await expect(canvas.getByRole('radio', { name: 'Standard' })).not.toBeChecked()
  },
}

export const PositionDuLibelle: Story = {
  args: { value: 'x' },
  render: () => ({
    components: { Radio },
    setup: () => ({ v: ref('end') }),
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <Radio v-model="v" name="position" value="end" label-position="end">
          Libellé après (défaut)
        </Radio>
        <Radio v-model="v" name="position" value="start" label-position="start">
          Libellé avant
        </Radio>
      </div>
    `,
  }),
}

/**
 * `spread` : la racine passe en flex pleine largeur, libellé et pastille sont
 * repoussés aux extrémités du conteneur.
 */
export const Spread: Story = {
  args: { value: 'x' },
  render: () => ({
    components: { Radio },
    setup: () => ({ v: ref('a') }),
    template: `
      <div style="display: grid; gap: 8px; max-width: 320px">
        <Radio v-model="v" name="spread-demo" value="a" spread>Pastille à droite</Radio>
        <Radio v-model="v" name="spread-demo" value="b" spread label-position="start">
          Pastille à gauche
        </Radio>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  args: { value: 'x' },
  render: () => ({
    components: { Radio },
    setup: () => ({ v: ref('b') }),
    template: `
      <div style="display: grid; gap: 8px">
        <Radio v-model="v" name="disabled-demo" value="a" disabled>Désactivé</Radio>
        <Radio v-model="v" name="disabled-demo" value="b" disabled>Désactivé sélectionné</Radio>
      </div>
    `,
  }),
}
