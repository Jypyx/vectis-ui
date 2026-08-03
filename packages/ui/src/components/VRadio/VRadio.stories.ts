import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VRadio from './VRadio.vue'

const t = storyText({
  en: {
    plan: 'Plan',
    free: 'Free',
    labelAfter: 'Label after (default)',
    labelBefore: 'Label before',
    dotRight: 'Dot on the right',
    dotLeft: 'Dot on the left',
    disabled: 'Disabled',
    disabledSelected: 'Disabled and selected',
  },
  fr: {
    plan: 'Formule',
    free: 'Gratuit',
    labelAfter: 'Libellé après (défaut)',
    labelBefore: 'Libellé avant',
    dotRight: 'Pastille à droite',
    dotLeft: 'Pastille à gauche',
    disabled: 'Désactivé',
    disabledSelected: 'Désactivé sélectionné',
  },
})

const meta = {
  title: 'Components/Radio',
  component: VRadio,
  argTypes: {
    labelPosition: { control: 'select', options: ['start', 'end'] },
  },
} satisfies Meta<typeof VRadio>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The group is native: the same `name` (fallthrough) + the same v-model. Arrow
 * navigation is supplied by the browser, zero JS.
 */
export const Group: Story = {
  args: { value: 'standard' },
  render: () => ({
    components: { VRadio },
    setup: () => ({ plan: ref('standard'), t }),
    template: `
      <fieldset style="border: none; display: grid; gap: 8px">
        <legend style="margin-bottom: 8px">{{ t.plan }}</legend>
        <VRadio v-model="plan" name="plan" value="free">{{ t.free }}</VRadio>
        <VRadio v-model="plan" name="plan" value="standard">Standard</VRadio>
        <VRadio v-model="plan" name="plan" value="pro">Pro</VRadio>
      </fieldset>
      <output data-testid="mirror">{{ plan }}</output>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('radio', { name: 'Standard' })).toBeChecked()
    // the hidden input is pointer-events: none, so the wrapping <label> is clicked
    await userEvent.click(canvas.getByRole('radio', { name: 'Pro' }).closest('label')!)
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('pro'))
    await expect(canvas.getByRole('radio', { name: 'Standard' })).not.toBeChecked()
  },
}

export const LabelPosition: Story = {
  args: { value: 'x' },
  render: () => ({
    components: { VRadio },
    setup: () => ({ v: ref('end'), t }),
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <VRadio v-model="v" name="position" value="end" label-position="end">
          {{ t.labelAfter }}
        </VRadio>
        <VRadio v-model="v" name="position" value="start" label-position="start">
          {{ t.labelBefore }}
        </VRadio>
      </div>
    `,
  }),
}

/**
 * `spread`: the root becomes full-width flex, and label and dot are pushed to the
 * container's opposite ends.
 */
export const Spread: Story = {
  args: { value: 'x' },
  render: () => ({
    components: { VRadio },
    setup: () => ({ v: ref('a'), t }),
    template: `
      <div style="display: grid; gap: 8px; max-width: 320px">
        <VRadio v-model="v" name="spread-demo" value="a" spread>{{ t.dotRight }}</VRadio>
        <VRadio v-model="v" name="spread-demo" value="b" spread label-position="start">
          {{ t.dotLeft }}
        </VRadio>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  args: { value: 'x' },
  render: () => ({
    components: { VRadio },
    setup: () => ({ v: ref('b'), t }),
    template: `
      <div style="display: grid; gap: 8px">
        <VRadio v-model="v" name="disabled-demo" value="a" disabled>{{ t.disabled }}</VRadio>
        <VRadio v-model="v" name="disabled-demo" value="b" disabled>{{ t.disabledSelected }}</VRadio>
      </div>
    `,
  }),
}
