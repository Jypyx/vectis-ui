import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import { storyText } from '../../stories/storyText'
import VSpinner from './VSpinner.vue'

const t = storyText({
  en: {
    followsSmText: 'Follows an sm text (1em)',
    followsXlText: 'Follows an xl text (1em)',
    numericOverride: '(numeric override 32)',
    sending: 'Sending…',
  },
  fr: {
    followsSmText: 'Suit un texte sm (1em)',
    followsXlText: 'Suit un texte xl (1em)',
    numericOverride: '(surcharge numérique 32)',
    sending: 'Envoi en cours…',
  },
})

const meta = {
  title: 'Components/Spinner',
  component: VSpinner,
  argTypes: {
    size: { control: { type: 'number', min: 12, max: 96, step: 4 } },
  },
} satisfies Meta<typeof VSpinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // role="status" + a hidden label: announced by screen readers
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Loading…')
  },
}

export const Sizes: Story = {
  render: () => ({
    components: { VSpinner },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px">
        <span style="font-size: var(--vectis-font-size-sm); display: inline-flex; gap: 8px; align-items: center">
          <VSpinner /> {{ t.followsSmText }}
        </span>
        <span style="font-size: var(--vectis-font-size-xl); display: inline-flex; gap: 8px; align-items: center">
          <VSpinner /> {{ t.followsXlText }}
        </span>
        <span style="display: inline-flex; gap: 8px; align-items: center">
          <VSpinner :size="32" />
          <span>{{ t.numericOverride }}</span>
        </span>
      </div>
    `,
  }),
}

export const Coloured: Story = {
  render: () => ({
    components: { VSpinner },
    setup: () => ({ t }),
    template: `
      <!-- the spinner inherits currentcolor: it follows the surrounding text -->
      <div
        style="color: var(--vectis-color-accent-text); display: flex; gap: 8px; align-items: center"
      >
        <VSpinner :label="t.sending" />
        <span>{{ t.sending }}</span>
      </div>
    `,
  }),
}
