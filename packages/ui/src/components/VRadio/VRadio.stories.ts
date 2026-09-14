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
    delivery: 'Delivery',
    standardHint: 'Three to five working days.',
    express: 'Express',
    expressHint: 'Next working day, ordered before noon.',
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
    delivery: 'Livraison',
    standardHint: 'Trois à cinq jours ouvrés.',
    express: 'Express',
    expressHint: 'Le jour ouvré suivant, pour une commande avant midi.',
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
 * `spread`: the root takes the full width, and label and dot are pushed to the
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

/** `label` stands in for the default slot, and `hint` draws a caption under it. */
export const WithHint: Story = {
  args: { value: 'x' },
  render: () => ({
    components: { VRadio },
    setup: () => ({ v: ref('standard'), t }),
    template: `
      <fieldset style="border: none; display: grid; gap: 12px">
        <legend style="margin-bottom: 8px">{{ t.delivery }}</legend>
        <VRadio v-model="v" name="delivery" value="standard" label="Standard" :hint="t.standardHint" />
        <VRadio v-model="v" name="delivery" value="express" :label="t.express" :hint="t.expressHint" />
      </fieldset>
    `,
  }),
  play: async ({ canvasElement }) => {
    const radio = within(canvasElement).getByRole('radio', { name: 'Standard' })
    await expect(radio).toHaveAccessibleDescription('Three to five working days.')
  },
}

/**
 * `readonly`, set on every button of the group, keeps the buttons focusable and refuses
 * the selection. The arrow keys select through a click the browser dispatches on the next
 * button, and that click is cancelled like any other.
 */
export const ReadOnly: Story = {
  args: { value: 'x' },
  render: () => ({
    components: { VRadio },
    setup: () => ({ plan: ref('standard'), t }),
    template: `
      <fieldset style="border: none; display: grid; gap: 8px">
        <legend style="margin-bottom: 8px">{{ t.plan }}</legend>
        <VRadio v-model="plan" name="readonly-plan" value="free" readonly>{{ t.free }}</VRadio>
        <VRadio v-model="plan" name="readonly-plan" value="standard" readonly>Standard</VRadio>
        <VRadio v-model="plan" name="readonly-plan" value="pro" readonly>Pro</VRadio>
      </fieldset>
      <output data-testid="mirror">{{ plan }}</output>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const standard = canvas.getByRole('radio', { name: 'Standard' })
    const pro = canvas.getByRole('radio', { name: 'Pro' })
    await userEvent.click(pro.closest('label')!)
    // A browser puts the previous selection back on a cancelled click, which jsdom does not.
    await expect(standard).toBeChecked()
    await expect(pro).not.toBeChecked()
    standard.focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(standard).toBeChecked()
    await expect(canvas.getByTestId('mirror')).toHaveTextContent('standard')
  },
}
