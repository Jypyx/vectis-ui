import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VSwitch from './VSwitch.vue'

const t = storyText({
  en: {
    notifications: 'Notifications',
    labelAfter: 'Label after (default)',
    labelBefore: 'Label before',
    switchRight: 'VSwitch on the right',
    switchLeft: 'VSwitch on the left',
    disabled: 'Disabled',
    disabledOn: 'Disabled and on',
    enableNotifications: 'Enable notifications',
  },
  fr: {
    notifications: 'Notifications',
    labelAfter: 'Libellé après (défaut)',
    labelBefore: 'Libellé avant',
    switchRight: 'VSwitch à droite',
    switchLeft: 'VSwitch à gauche',
    disabled: 'Désactivé',
    disabledOn: 'Désactivé actif',
    enableNotifications: 'Activer les notifications',
  },
})

const meta = {
  title: 'Components/Switch',
  component: VSwitch,
  argTypes: {
    labelPosition: { control: 'select', options: ['start', 'end'] },
  },
  args: {
    labelPosition: 'end',
    spread: false,
    disabled: false,
  },
  render: (args) => ({
    components: { VSwitch },
    setup: () => ({ args, on: ref(false), t }),
    template: '<VSwitch v-bind="args" v-model="on">{{ t.notifications }}</VSwitch>',
  }),
} satisfies Meta<typeof VSwitch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // role="switch": correct semantics for screen readers
    const sw = within(canvasElement).getByRole('switch', { name: 'Notifications' })
    await expect(sw).not.toBeChecked()
    // the hidden input is pointer-events: none, so the wrapping <label> is clicked
    await userEvent.click(sw.closest('label')!)
    await waitFor(() => expect(sw).toBeChecked())
  },
}

export const LabelPosition: Story = {
  render: () => ({
    components: { VSwitch },
    setup: () => ({ a: ref(false), b: ref(true) }),
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <VSwitch v-model="a" label-position="end">{{ t.labelAfter }}</VSwitch>
        <VSwitch v-model="b" label-position="start">{{ t.labelBefore }}</VSwitch>
      </div>
    `,
  }),
}

/**
 * `spread`: the root becomes full-width flex, and label and switch are pushed to
 * the container's opposite ends.
 */
export const Spread: Story = {
  render: () => ({
    components: { VSwitch },
    setup: () => ({ a: ref(true), b: ref(false) }),
    template: `
      <div style="display: grid; gap: 8px; max-width: 320px">
        <VSwitch v-model="a" spread>{{ t.switchRight }}</VSwitch>
        <VSwitch v-model="b" spread label-position="start">{{ t.switchLeft }}</VSwitch>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { VSwitch },
    setup: () => ({ on: ref(true), off: ref(false) }),
    template: `
      <div style="display: grid; gap: 8px">
        <VSwitch v-model="off" disabled>{{ t.disabled }}</VSwitch>
        <VSwitch v-model="on" disabled>{{ t.disabledOn }}</VSwitch>
      </div>
    `,
  }),
}

export const WithoutLabel: Story = {
  render: () => ({
    components: { VSwitch },
    setup: () => ({ on: ref(false), t }),
    template: '<VSwitch v-model="on" :aria-label="t.enableNotifications" />',
  }),
}
